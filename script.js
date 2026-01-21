/**
 * PIAS - Intelligence Interface (script.js)
 * Maneja la comunicación con Google Colab y la interfaz estilo Gemini.
 */

const chatWindow = document.getElementById('chat-window');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const ngrokUrlInput = document.getElementById('ngrok-url');
const modeSelect = document.getElementById('mode');

// Función principal para enviar mensajes
async function askPIAS() {
    const prompt = userInput.value.trim();
    const url = ngrokUrlInput.value.trim();
    const mode = modeSelect.value;

    // Validaciones básicas
    if (!url) {
        addMessage("⚠️ Por favor, introduce la URL de Ngrok en la barra lateral antes de continuar.", "ai-msg");
        return;
    }
    if (!prompt) return;

    // 1. Mostrar mensaje del usuario en la interfaz
    addMessage(prompt, 'user-msg');
    userInput.value = '';

    // 2. Crear burbuja de carga con el estado "Pensando..."
    // Usamos un ID único para poder actualizar esta misma burbuja luego
    const loadingId = addMessage(`🧠 PIAS está cargando el motor de ${mode.toUpperCase()}... por favor espera.`, 'ai-msg blinking');

    try {
        // Formatear la URL (asegurar que no termine en /)
        const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

        // 3. Petición al servidor de Colab
        const response = await fetch(`${cleanUrl}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                type: mode
            })
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);

        if (data.error) {
            loadingElement.innerHTML = `<img src="/favicon.ico" class="avatar"><div class="text" style="color: #ff6b6b;">❌ Error en PIAS: ${data.error}</div>`;
            loadingElement.classList.remove('blinking');
            return;
        }

        // 4. Actualizar la burbuja con el razonamiento y el resultado
        let contentHTML = "";
        
        // Si el servidor envió un estado de razonamiento, lo mostramos en cursiva
        if (data.status) {
            contentHTML += `<i style="color: #8ab4f8; font-size: 0.9em;">${data.status}</i><br><hr style="border: 0.5px solid #333; margin: 10px 0;">`;
        }

        // Formatear según el tipo de contenido recibido
        if (data.format === 'image') {
            contentHTML += `<img src="data:image/png;base64,${data.result}" class="gen-image">`;
        } else if (data.format === 'audio') {
            contentHTML += `<span>Música generada por PIAS:</span><audio controls src="data:audio/wav;base64,${data.result}"></audio>`;
        } else {
            // Es texto normal
            contentHTML += `<span>${data.result}</span>`;
        }

        // Aplicar el contenido final a la burbuja
        loadingElement.innerHTML = `<img src="/favicon.ico" class="avatar"><div class="text">${contentHTML}</div>`;
        loadingElement.classList.remove('blinking');

    } catch (error) {
        console.error("Error de conexión:", error);
        const loadingElement = document.getElementById(loadingId);
        loadingElement.innerHTML = `<img src="/favicon.ico" class="avatar"><div class="text" style="color: #ff6b6b;">🔌 No se pudo conectar con PIAS. Verifica que Colab esté encendido y la URL sea correcta.</div>`;
        loadingElement.classList.remove('blinking');
    }
}

/**
 * Crea y añade una burbuja de mensaje al chat
 * @param {string} content - El texto o HTML a mostrar
 * @param {string} className - Clase CSS (user-msg o ai-msg)
 * @returns {string} ID único del elemento creado
 */
function addMessage(content, className) {
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.id = id;

    const isAI = className.includes('ai-msg');
    const avatar = `<img src="/favicon.ico" class="avatar" onerror="this.src='https://www.gstatic.com/lamda/images/favicon_v1_150160d1398251f45347b.png'">`;
    
    div.innerHTML = `
        ${isAI ? avatar : ''}
        <div class="text">${content}</div>
    `;

    chatWindow.appendChild(div);
    
    // Auto-scroll hacia abajo
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });

    return id;
}

// --- EVENTOS ---

// Enviar al hacer click
sendBtn.addEventListener('click', askPIAS);

// Enviar al presionar Enter (sin Shift)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askPIAS();
    }
});

// Guardar la URL de Ngrok en el almacenamiento local para no tener que pegarla siempre
ngrokUrlInput.addEventListener('change', () => {
    localStorage.setItem('pias_ngrok_url', ngrokUrlInput.value);
});

// Cargar la URL guardada al abrir la página
window.addEventListener('load', () => {
    const savedUrl = localStorage.getItem('pias_ngrok_url');
    if (savedUrl) {
        ngrokUrlInput.value = savedUrl;
    }
});
