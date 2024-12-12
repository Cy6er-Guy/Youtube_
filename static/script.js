let responseText = "";  // Variable pour stocker la réponse

function generateResponse() {
    const prompt = document.getElementById("prompt").value;
    const filename = document.getElementById("filename").value;

    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, filename })
    })
    .then(response => response.json())
    .then(data => {
        const responseContainer = document.getElementById("response-container");
        responseText = data.response;  // Stocke la réponse
        responseContainer.innerHTML = `<p>${responseText}</p>`;
        document.getElementById("save-button").style.display = "block";  // Affiche le bouton "Enregistrer"
    })
    .catch(error => {
        console.error("Erreur:", error);
    });
}

function saveFile() {
    const filename = document.getElementById("filename").value || "default_filename"; // Nom par défaut
    const blob = new Blob([responseText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${filename}.txt`; // Ajoute l'extension .txt
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Supprime le lien après le téléchargement
}
