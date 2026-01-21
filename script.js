const chatWindow = document.getElementById('chat-window');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const ngrokUrlInput = document.getElementById('ngrok-url');
const modeSelect = document.getElementById('mode');
const fileInput = document.getElementById('file-upload');

let selectedFile = null;

// Capturar archivo seleccionado
fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        addMessage(`📎 Archivo cargado: ${selectedFile.name}`, 'user-msg');
    }
});

async function askPIAS() {
    const prompt = userInput.value.trim();
    const url = ngrokUrlInput.value.trim();
    const mode = modeSelect.value;

    if (!url) return alert("Pega la URL de Ngrok de Colab");
    if (!prompt && !selectedFile) return;

    // Mostrar mensaje del usuario
    addMessage(prompt || `Analizando archivo: ${selectedFile.name}`, 'user-msg');
    userInput.value = '';

    const loadingId = addMessage("🧠 PIAS (Pacure Studio) procesando...", "ai-msg blinking");

    // Preparar datos (FormData permite enviar archivos)
    const formData = new FormData();
    formData.append('prompt', prompt || "Analiza el archivo");
    formData.append('type', mode);
    if (selectedFile) formData.append('file', selectedFile);

    try {
        const response = await fetch(`${url}/generate`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);
        loadingElement.classList.remove('blinking');

        if (data.error) {
            loadingElement.innerHTML = `<div class="text" style="color:red">Error: ${data.error}</div>`;
            return;
        }

        let htmlRes = `<i style="color:#8ab4f8">${data.status}</i><br><br>`;
        
        if (data.format === 'image') {
            htmlRes += `<img src="data:image/png;base64,${data.result}" class="gen-image">`;
        } else if (data.format === 'audio') {
            htmlRes += `<audio controls src="data:audio/wav;base64,${data.result}"></audio>`;
        } else {
            htmlRes += `<span>${data.result}</span>`;
        }

        loadingElement.innerHTML = `<img src="/favicon.ico" class="avatar"><div class="text">${htmlRes}</div>`;
        
        // Resetear archivo
        selectedFile = null;
        fileInput.value = '';

    } catch (e) {
        document.getElementById(loadingId).innerText = "Error de conexión con Colab.";
    }
}

function addMessage(text, className) {
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.id = id;
    const avatar = className.includes('ai-msg') ? `<img src="/favicon.ico" class="avatar">` : '';
    div.innerHTML = `${avatar}<div class="text">${text}</div>`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return id;
}

sendBtn.addEventListener('click', askPIAS);
userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') askPIAS(); });
