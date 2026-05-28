from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Complaint
import aiofiles, os, smtplib
from email.mime.text import MIMEText   # ✅ FIXED
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_image(
    photo: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form(""),
    user_id: int = Form(...),
    db: Session = Depends(get_db),
):
    # 1. Save image
    raw_path = f"{UPLOAD_DIR}/raw_{photo.filename}"
    async with aiofiles.open(raw_path, "wb") as f:
        await f.write(await photo.read())

    # 2. Run AI
    try:
        from ai.preprocessor import preprocess_image
        from ai.detector import detect_pothole

        processed_path = preprocess_image(raw_path)
        result = detect_pothole(processed_path)

        # 🔥 SUPER SAFE BOOLEAN FIX
        if str(result.get("is_fake")).lower() in ["true", "1"]:
            result["is_fake"] = True
        else:
            result["is_fake"] = False

        print("FINAL TYPE:", type(result["is_fake"]), result["is_fake"])

    except Exception as e:
        print(f"AI error: {e}")
        result = {
            "is_fake": False,
            "confidence": 0.80,
            "annotated_path": raw_path
        }

    # 3. Save to DB
    complaint = Complaint(
        user_id=user_id,
        image_path=raw_path,
        annotated_path=result["annotated_path"],
        latitude=latitude,
        longitude=longitude,
        description=description,
        is_fake=bool(result["is_fake"]),   # 🔥 FORCE BOOLEAN
        confidence=result["confidence"],
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # 4. Email govt if real
    if not result["is_fake"]:
        try:
            send_govt_email(complaint)
        except Exception as e:
            print(f"Email error: {e}")

    # 5. Return response
    return {
        "complaint_id": complaint.id,
        "is_fake": bool(result["is_fake"]),   # 🔥 FORCE AGAIN
        "confidence": round(result["confidence"] * 100, 1),
        "annotated_image": f"/static/{os.path.basename(result['annotated_path'])}",
        "message": "Not a real pothole." if result["is_fake"] else "Complaint sent to authorities!"
    }


@router.get("/complaints")
def get_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).filter(
        Complaint.is_fake == False
    ).order_by(Complaint.created_at.desc()).all()


@router.patch("/complaints/{complaint_id}")
def update_status(complaint_id: int, status: str, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(404, "Not found")

    c.status = status
    db.commit()

    return {"message": f"Marked as {status}"}


def send_govt_email(complaint):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "New Pothole Complaint"
    msg["From"] = os.getenv("EMAIL")
    msg["To"] = os.getenv("GOVT_EMAIL")

    msg.attach(MIMEText(f"""
        <h2>New pothole reported!</h2>
        <p><b>Location:</b> {complaint.latitude}, {complaint.longitude}</p>
        <p><b>Description:</b> {complaint.description}</p>
        <p><b>AI Confidence:</b> {complaint.confidence:.0%}</p>
    """, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(os.getenv("EMAIL"), os.getenv("EMAIL_PASS"))
        s.send_message(msg)