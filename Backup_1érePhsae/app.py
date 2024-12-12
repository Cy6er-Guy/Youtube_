from flask import Flask, request, render_template, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Charger la clé API depuis le fichier .env
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

# Configurer l'API
genai.configure(api_key=API_KEY)

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.get_json()
    prompt = data.get('prompt', '')

    # Initialiser le modèle de chat Gemini
    model = genai.GenerativeModel('gemini-1.5-flash')
    chat = model.start_chat(history=[])

    # Envoyer le prompt et obtenir la réponse sans la sauvegarder
    response = chat.send_message(prompt)
    return jsonify({"response": response.text})

if __name__ == "__main__":
    app.run(debug=True)
