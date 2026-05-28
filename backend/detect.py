from ultralytics import YOLO

model = YOLO("model/best.pt")

print("Custom pothole model loaded successfully")


def detect_pothole(image_path):

    results = model(image_path, conf=0.2, imgsz=320)

    detections = results[0].boxes

    if len(detections) > 0:

        confidence = float(detections[0].conf[0])

        return {
            "detected": True,
            "confidence": confidence
        }

    return {
        "detected": False,
        "confidence": 0
    }