from ultralytics import YOLO
import cv2, os

MODEL_PATH = "model/best.pt"

if os.path.exists(MODEL_PATH):
    model = YOLO(MODEL_PATH)
    print("✅ Custom pothole model loaded!")
else:
    model = YOLO("yolov8n.pt")
    print("⚠️  Using base YOLOv8 — train model to get pothole detection")

CONFIDENCE_THRESHOLD = 0.40

def detect_pothole(image_path: str) -> dict:
    results = model.predict(
        source=image_path,
        conf=CONFIDENCE_THRESHOLD,
        save=False,
        verbose=False,
        imgsz=320,
    )
    boxes = results[0].boxes

    annotated_path = _save_annotated(image_path, results)

    if boxes is None or len(boxes) == 0:
        return {"is_fake": True, "confidence": 0.0, "annotated_path": annotated_path}

    best   = boxes[boxes.conf.argmax()]
    conf   = float(best.conf[0])
    return {
        "is_fake":        conf < CONFIDENCE_THRESHOLD,
        "confidence":     conf,
        "annotated_path": annotated_path,
    }

def _save_annotated(image_path: str, results) -> str:
    annotated = results[0].plot()
    out_path  = image_path.replace("processed_", "annotated_")
    cv2.imwrite(out_path, annotated)
    return out_path