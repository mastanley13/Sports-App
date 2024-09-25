export function initializeVoiceCommandIntegration() {
    const voiceCommandButton = document.getElementById('voiceCommandButton');
    const voiceCommandModal = document.getElementById('voiceCommandModal');
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const voiceChatHistory = document.getElementById('voiceChatHistory');

    let recognition;
    let isRecording = false;
    let recordedChunks = [];

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser does not support the Web Speech API. Please use a supported browser.');
        return;
    }

    voiceCommandButton.addEventListener('click', () => {
        voiceCommandModal.style.display = 'block';
    });

    startRecordingBtn.addEventListener('click', startRecording);
    stopRecordingBtn.addEventListener('click', stopRecording);

    function startRecording() {
        startRecordingBtn.style.display = 'none';
        stopRecordingBtn.style.display = 'block';
        recordedChunks = [];
        isRecording = true;

        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.start();

        recognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            // Update the UI with the interim transcript
            updateInterimTranscript(interimTranscript);

            // If this is a final result, add it to the recorded chunks
            if (event.results[event.results.length - 1].isFinal) {
                recordedChunks.push(event.results[event.results.length - 1][0].transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (isRecording) {
                recognition.start();
            }
        };

        recognition.onend = () => {
            if (isRecording) {
                recognition.start();
            }
        };
    }

    function stopRecording() {
        startRecordingBtn.style.display = 'block';
        stopRecordingBtn.style.display = 'none';
        isRecording = false;
        if (recognition) {
            recognition.stop();
        }

        const fullTranscript = recordedChunks.join(' ');
        sendVoiceCommand(fullTranscript);
    }

    function updateInterimTranscript(transcript) {
        // Update the UI to show the interim transcript
        const interimElement = document.getElementById('interimTranscript');
        if (interimElement) {
            interimElement.textContent = transcript;
        } else {
            const newInterimElement = document.createElement('div');
            newInterimElement.id = 'interimTranscript';
            newInterimElement.textContent = transcript;
            voiceChatHistory.appendChild(newInterimElement);
        }
    }

    async function sendVoiceCommand(transcript) {
        try {
            const userMessageElement = document.createElement('div');
            userMessageElement.className = 'user-message';
            userMessageElement.textContent = `You: ${transcript}`;
            voiceChatHistory.appendChild(userMessageElement);

            const response = await fetch('/api/voice-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcript }),
            });
            const data = await response.json();

            if (data.content) {
                const botMessageElement = document.createElement('div');
                botMessageElement.className = 'bot-message';
                botMessageElement.innerHTML = `<strong>HeyTC:</strong><br>${formatResponseText(data.content)}`;
                voiceChatHistory.appendChild(botMessageElement);

                // Handle function calls if present
                if (data.functionCalls) {
                    for (const functionCall of data.functionCalls) {
                        const result = await executeFunctionCall(functionCall.name, functionCall.arguments);
                        const functionResultElement = document.createElement('div');
                        functionResultElement.className = 'function-result';
                        functionResultElement.innerHTML = `<strong>Function Result:</strong><br>${JSON.stringify(result, null, 2)}`;
                        voiceChatHistory.appendChild(functionResultElement);
                    }
                }

                if (data.audioFilePath) {
                    const audio = new Audio(data.audioFilePath);
                    audio.play();
                }
            } else {
                console.error('No content in response:', data);
                alert('Failed to get a valid response from Voice Assistant.');
            }
        } catch (error) {
            console.error('Error interacting with Voice Assistant:', error);
            alert('Failed to interact with Voice Assistant. Please try again.');
        }

        // Clear the interim transcript after sending the command
        const interimElement = document.getElementById('interimTranscript');
        if (interimElement) {
            interimElement.remove();
        }
    }

    async function executeFunctionCall(functionName, args) {
        switch (functionName) {
            case 'fetch_contact':
                return await fetchContact(args);
            case 'generate_note':
                return await generateNote(args);
            case 'send_email':
                return await sendEmail(args);
            case 'create_task':
                return await createTask(args);
            case 'get_contact':
                return await getContactInfo(args);
            default:
                throw new Error(`Unknown function: ${functionName}`);
        }
    }

    async function fetchContact(args) {
        const response = await fetch('/api/fetch-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });
        return await response.json();
    }

    async function generateNote(args) {
        const response = await fetch('/api/generate-note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });
        return await response.json();
    }

    async function sendEmail(args) {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });
        return await response.json();
    }

    async function createTask(args) {
        const response = await fetch('/api/create-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });
        return await response.json();
    }

    async function getContactInfo(args) {
        const response = await fetch('/api/get-contact-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });
        return await response.json();
    }
}