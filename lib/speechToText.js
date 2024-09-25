const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function speechToText(audioFilePath) {
    try {
        const audioFile = fs.createReadStream(path.join(__dirname, '..', 'public', audioFilePath));
        const response = await openai.audio.transcriptions.create({
            model: "whisper-1",
            file: audioFile,
            response_format: "text"
        });

        console.log('Speech-to-text response:', response);
        return response.text;
    } catch (error) {
        console.error('Error in speech-to-text:', error);
        return null;
    }
}

module.exports = { speechToText };
