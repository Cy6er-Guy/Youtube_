function generateResponse() {
    const prompt = document.getElementById("prompt").value;
    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    })
    .then(response => response.json())
    .then(data => {
        const responseContainer = document.getElementById("response-container");
        responseContainer.innerHTML = `<p>${data.response}</p>`;
    })
    .catch(error => {
        console.error("Erreur:", error);
    });
}
