import cv2
import os

def preprocess_image(image_path: str) -> str:
    img = cv2.imread(image_path)
    if img is None:
        return image_path

    img = cv2.resize(img, (640, 640))
    img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    img = cv2.merge((l, a, b))
    img = cv2.cvtColor(img, cv2.COLOR_LAB2BGR)

    out_path = image_path.replace("raw_", "processed_")
    cv2.imwrite(out_path, img)
    return out_path