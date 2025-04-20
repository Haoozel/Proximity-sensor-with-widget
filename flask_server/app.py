from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import time

app = Flask(__name__, static_folder='static')
CORS(app) 

status = {"status": "UNKNOWN", "last_update": 0}

@app.route('/api/status', methods=['GET', 'POST'])
def handle_status():
    global status
    if request.method == 'POST':
        data = request.get_json()
        if data and 'status' in data:
            status["status"] = data["status"]
            status["last_update"] = time.time()
            print("🛰️ New status", status["status"])
            return jsonify({"message": "Status recieved"}), 200
        return jsonify({"error": "Invalid request"}), 400

    # GET
    now = time.time()
    elapsed = now - status["last_update"]
    if elapsed > 10:  
        return jsonify({"status": "DISCONNECTED"})
    return jsonify({"status": status["status"]})

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

