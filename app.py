from flask import Flask, request, render_template, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re  # Pour diviser le texte en phrases

# Charger la clé API depuis le fichier .env
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

# Configurer l'API
genai.configure(api_key=API_KEY)

app = Flask(__name__)

# Fonction pour diviser une chaîne en phrases
def split_text_by_sentence(text):
    # Utilise une expression régulière pour découper le texte en phrases
    sentences = re.split(r'(?<=\.|\?|\!)(?=\s)', text)
    return sentences

# Fonction pour diviser les phrases longues en morceaux de 280 caractères si nécessaire
def split_long_sentences(sentences, max_length=280):
    result = []
    for sentence in sentences:
        # Si la phrase dépasse la longueur max, la découper
        while len(sentence) > max_length:
            result.append(sentence[:max_length])
            sentence = sentence[max_length:]
        if sentence:
            result.append(sentence)
    return result

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.get_json()
    prompt = data.get('prompt', 'Écris-moi un script pour une vidéo pour une chaîne YouTube spécialisée dans les faits des histoir. Le script doit être engageant et captivant, se concentrant sur une histoire , en mêlant excitation et réalisme. Le script doit inclure un appel aux spectateurs à aimer la vidéo, à commenter et à s abonner à la chaîne pour plus de vidéos. Le style doit être vivant et intéressant, avec une attention particulière à l engagement rapide des spectateurs')
    requet = data.get('requet', 'default_requet')  # Nom de la requête
    folder_path = f'./Script/'  # Dossier de sauvegarde

    # Créer le dossier si nécessaire
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    # Initialiser le modèle de chat Gemini
    model = genai.GenerativeModel('gemini-1.5-flash')
    chat = model.start_chat(history=[])

    # Envoyer le prompt et obtenir la réponse
    response = chat.send_message(prompt)

    # Nettoyer la réponse pour enlever les symboles et mots indésirables
    cleaned_response = clean_text(response.text)

    # Découper la réponse nettoyée en phrases
    sentences = split_text_by_sentence(cleaned_response)

    # Diviser les phrases longues en morceaux de 280 caractères si nécessaire
    response_parts = split_long_sentences(sentences)

    # Enregistrer chaque morceau dans un fichier texte
    for i, part in enumerate(response_parts, start=1):
        file_name = f"{folder_path}/{i}.txt"  # Nom du fichier (1.txt, 2.txt, ...)
        with open(file_name, 'w', encoding='utf-8') as file:
            file.write(part)

    return jsonify({"response": cleaned_response})

def clean_text(text):
    # Remplacer les astérisques (*) et les dièses (#) par une chaîne vide
    cleaned_text = re.sub(r'[*#]', '', text)
    # Supprimer les occurrences des mots "times" ou "temps"
    cleaned_text = re.sub(r'\b(times|temps)\b', '', cleaned_text)
    return cleaned_text

if __name__ == "__main__":
    app.run(debug=True)
