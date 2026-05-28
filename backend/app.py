from flask import Flask, request, jsonify
from flask_cors import CORS
from detect import detect_pothole
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/detect', methods=['POST'])
def detect():

    if 'image' not in request.files:
        return jsonify({
            "error": "No image uploaded"
        })

    image = request.files['image']

    filepath = os.path.join(UPLOAD_FOLDER, image.filename)

    image.save(filepath)

    result = detect_pothole(filepath)

    return jsonify(result)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)