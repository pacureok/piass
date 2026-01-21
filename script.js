const chatWindow = document.getElementById('chat-window');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');

async function askPIAS() {
    const prompt = userInput.value.trim();
    const url = document.getElementById('ngrok-url').value.trim();
    const mode = document.getElementById('mode').value;

    if(!url) {
        addMessage("Por favor, introduce la URL de Ngrok en la barra lateral.", "ai-msg");
        return;
    }
    if(!prompt) return;

    // Mostrar mensaje del usuario
    addMessage(prompt, 'user-msg');
    userInput.value = '';

    // Efecto de carga
    const loadingId = addMessage("PIAS está pensando...", 'ai-msg blinking');

    try {
        const response = await fetch(`${url}/generate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt, type: mode })
        });
        
        const data = await response.json();
        document.getElementById(loadingId).remove(); // Quitar carga

        if(data.format === 'image') {
            addMessage(`<img src="data:image/png;base64,${data.result}" class="gen-image">`, 'ai-msg', true);
        } else if(data.format === 'audio') {
            addMessage(`<span>Aquí tienes la música generada:</span><audio controls src="data:audio/wav;base64,${data.result}"></audio>`, 'ai-msg', true);
        } else {
            addMessage(data.result, 'ai-msg');
        }
    } catch (e) {
        document.getElementById(loadingId).innerHTML = "Error: No pude conectar con el cerebro de PIAS. Revisa Colab.";
    }
}

function addMessage(content, className, isHTML = false) {
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.id = id;
    
    const avatar = `<img src="/favicon.ico" class="avatar">`;
    const textDiv = `<div class="text">${content}</div>`;
    
    div.innerHTML = className.includes('user-msg') ? textDiv : avatar + textDiv;
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return id;
}

sendBtn.addEventListener('click', askPIAS);
userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') askPIAS(); });
