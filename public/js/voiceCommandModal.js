import { formatResponseText } from './formatResponse.js';

export function initializeVoiceCommandModal() {
    const voiceCommandButton = document.getElementById('voiceCommandButton');
    const voiceCommandModal = document.getElementById('voiceCommandModal');
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const stopPlaybackBtn = document.getElementById('stopPlaybackBtn');
    const clearVoiceChatBtn = document.getElementById('clearVoiceChatBtn');
    const voiceChatHistory = document.getElementById('voiceChatHistory');

    let recognition;
    let audio;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser does not support the Web Speech API. Please use a supported browser.');
        return;
    }

    voiceCommandButton.addEventListener('click', () => {
        console.log('Voice Command Button Clicked');
        voiceCommandModal.style.display = 'block';
    });

    // Update the close button functionality
    const closeButton = voiceCommandModal.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            console.log('Close Button Clicked');
            voiceCommandModal.style.display = 'none';
        });
    }

    startRecordingBtn.addEventListener('click', startRecording);
    stopRecordingBtn.addEventListener('click', stopRecording);
    stopPlaybackBtn.addEventListener('click', stopPlayback);
    clearVoiceChatBtn.addEventListener('click', async () => {
        console.log('Clear Chat Button Clicked');
        voiceChatHistory.innerHTML = ''; // Clear the chat history

        try {
            // Send a request to create a new thread
            const response = await fetch('/api/voice-command/new-thread', {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error('Failed to create a new voice command thread');
            }
            
            console.log('New voice command thread created');
        } catch (error) {
            console.error('Error creating new voice command thread:', error);
            alert('Failed to start a new voice conversation. Please try again.');
        }
    });

    function startRecording() {
        console.log('Recording started...');
        startRecordingBtn.style.display = 'none';
        stopRecordingBtn.style.display = 'block';

        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Transcript:', transcript);

            const userMessageElement = document.createElement('div');
            userMessageElement.className = 'user-message';
            userMessageElement.textContent = `You: ${transcript}`;
            
            const timestamp = document.createElement('div');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = new Date().toLocaleTimeString();
            userMessageElement.appendChild(timestamp);

            voiceChatHistory.appendChild(userMessageElement);
            
            // Scroll to the bottom after adding user's message
            voiceChatHistory.scrollTop = voiceChatHistory.scrollHeight;

            await sendVoiceCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            console.log('Speech recognition service disconnected');
            startRecordingBtn.style.display = 'block';
            stopRecordingBtn.style.display = 'none';
        };
    }

    function stopRecording() {
        console.log('Recording stopped...');
        startRecordingBtn.style.display = 'block';
        stopRecordingBtn.style.display = 'none';
        if (recognition) {
            recognition.stop();
        }
    }

    function stopPlayback() {
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Reset the audio to the beginning
            audio.src = ''; // Clear the audio source
            audio.load(); // Reload the audio element
            stopPlaybackBtn.style.display = 'none';
            console.log('Audio playback stopped');
        }
    }

    async function sendVoiceCommand(transcript) {
        try {
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
                
                const botTimestamp = document.createElement('div');
                botTimestamp.className = 'message-timestamp';
                botTimestamp.textContent = new Date().toLocaleTimeString();
                botMessageElement.appendChild(botTimestamp);

                voiceChatHistory.appendChild(botMessageElement);
                voiceChatHistory.scrollTop = voiceChatHistory.scrollHeight;

                // Debugging audio element
                console.log('Preparing to play new audio from:', data.audioFilePath);

                // Stop and replace the previous audio
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                    console.log('Previous audio stopped.');
                }

                // Append a timestamp to the URL to avoid caching issues
                const audioUrlWithTimestamp = `${data.audioFilePath}?t=${new Date().getTime()}`;
                audio = new Audio(audioUrlWithTimestamp);
                audio.load();  // Explicitly call load to ensure the browser fetches new content

                audio.addEventListener('canplaythrough', () => {
                    console.log('Audio can play through, starting playback');
                    audio.play().catch(e => console.error('Error playing audio:', e));
                    stopPlaybackBtn.style.display = 'block';
                });
                audio.addEventListener('ended', () => {
                    console.log('Audio playback ended');
                    stopPlaybackBtn.style.display = 'none';
                });
                audio.addEventListener('error', (e) => {
                    console.error('Audio playback error:', e);
                });
            } else {
                console.error('No content in response:', data);
                alert('Failed to get a valid response from Voice Assistant.');
            }
        } catch (error) {
            console.error('Error interacting with Voice Assistant:', error);
            alert('Failed to interact with Voice Assistant. Please try again.');
        }
    }
}