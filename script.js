const chatWindow = document.getElementById('chat-window');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');

async function sendMessage() {
    const prompt = userInput.value;
    const url = document.getElementById('ngrok-url').value;
    const mode = document.getElementById('mode').value;

    if(!url) return alert("Por favor pon la URL de Ngrok");
    if(!prompt) return;

    // Agregar mensaje usuario
    addMessage(prompt, 'user');
    userInput.value = '';

    try {
        const response = await fetch(`${url}/generate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt, type: mode })
        });
        
        const data = await response.json();
        
        if(data.format === 'image') {
            addMessage(`<img src="data:image/png;base64,${data.result}">`, 'ai', true);
        } else if(data.format === 'audio') {
            addMessage(`<audio controls src="data:audio/wav;base64,${data.result}"></audio>`, 'ai', true);
        } else {
            addMessage(data.result, 'ai');
        }
    } catch (e) {
        addMessage("Error conectando con Colab. Verifica la URL.", 'ai');
    }
}

function addMessage(content, sender, isHTML = false) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    if(isHTML) div.innerHTML = content;
    else div.innerText = content;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
