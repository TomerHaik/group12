from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_pymongo import PyMongo
from bson.json_util import dumps
from bson.objectid import ObjectId
from functools import wraps

app = Flask(__name__, template_folder='src/templates', static_folder='src/static')
app.secret_key = "super_secret"  # Required for session encryption

app.config["MONGO_URI"] = "mongodb+srv://orshalo:lKrOEXnrYEKA6kCe@orshalom.ie645.mongodb.net/sportastic?retryWrites=true&w=majority&appName=orshalom&connectTimeoutMS=30000&socketTimeoutMS=30000&tlsAllowInvalidCertificates=true"
mongo = PyMongo(app)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)

    return decorated_function


# templates

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/login', methods=["GET"])
def login():
    return render_template('login.html')


@app.route('/contact')
def contact():
    return render_template('contact.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/book-training')
@login_required
def book_training():
    return render_template('book_training.html')


@app.route('/my-training')
@login_required
def my_training():
    return render_template('my_training.html')


@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route("/logout", methods=["GET"])
def logout():
    session.clear()  # מוחק את כל הנתונים מה-Session
    return redirect(url_for("login"))  # מחזיר לעמוד ההתחברות


# api

# post new user
@app.route("/api/users", methods=["POST"])
def add_user():
    try:
        user = request.get_json()
        required_fields = ["first-name", "email", "password"]
        for field in required_fields:
            if field not in user:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        if mongo.db.users.find_one({"email": user["email"]}):
            return jsonify({"error": "User with this email already exists"}), 409
        user["trainings"] = []
        mongo.db.users.insert_one(user)  # Insert data into collection
        return jsonify({"msg":"User added successfully"}), 201
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Unexpected error"}), 500


# login
@app.route("/api/login", methods=["POST"])
def login_user():
    try:
        credentials = request.get_json()
        user = mongo.db.users.find_one({"email": credentials["email"], "password": credentials["password"]})
        if user is not None:
            session["user_id"] = str(user["_id"])
            return jsonify({"id": str(user["_id"])}), 200
        else:
            return jsonify({"error": "One or both credentials are wrong"}), 401
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Unexpected error"}), 500


@app.route("/api/trainings", methods=["GET"])
def get_training_sessions():
    try:
        training_sessions = convert_objectid(list(mongo.db.trainings.find()))
        return dumps(training_sessions)
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Unexpected error"}), 500


@app.route("/api/trainings/<user_id>", methods=["GET"])
def get_user_training_sessions(user_id=""):
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            return jsonify({"error": "User not found"}), 404
        training_ids = user["trainings"]
        user_training_sessions = list(mongo.db.trainings.find({"_id": {"$in": training_ids}}))
        user_training_sessions = convert_objectid(user_training_sessions)
        return dumps(user_training_sessions)
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Unexpected error"}), 500


@app.route("/api/trainings/<user_id>", methods=["POST"])
def add_user_training_session(user_id=""):
    data = request.json
    try:
        training_to_add = mongo.db.trainings.find({"_id": ObjectId(data["training_id"])})
        if training_to_add is None:
            return jsonify({"error": "Training session not found"}), 404
        mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},  # Match the user by ID
            {"$push": {"trainings": ObjectId(data["training_id"])}}  # Push the training ID
        )
        return jsonify({"message": "Training session added successfully"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Unexpected error"}), 500


@app.route("/api/trainings/<user_id>", methods=["DELETE"])
def remove_user_training_session(user_id=""):
    data = request.json
    try:
        training_to_add = mongo.db.trainings.find({"_id": ObjectId(data["training_id"])})
        if training_to_add is None:
            return jsonify({"error": "Training session not found"}), 404
        mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},  # Match the user by ID
            {"$pull": {"trainings": ObjectId(data["training_id"])}}
        )
        return jsonify({"message": "Training session added successfully"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Unexpected error"}), 500


def convert_objectid(data):
    """ Recursively converts all _id fields from ObjectId to string in a dictionary or list """
    if isinstance(data, list):
        return [convert_objectid(doc) for doc in data]
    if isinstance(data, dict):
        data["_id"] = str(data["_id"]) if "_id" in data else None
        return data
    return data


if __name__ == '__main__':
    app.run(debug=True, port=8080)
