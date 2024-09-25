const OpenAI = require('openai');
const fs = require('fs');
const path = require('path'); // Import the path module

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function textToSpeech(text) {
    try {
        console.log('AI speaks:', text);
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const audioFilePath = path.join(__dirname, '..', 'public', 'speech.mp3');
        await fs.promises.writeFile(audioFilePath, buffer);

        console.log('Text-to-speech successful:', text);
        return `/speech.mp3`;
    } catch (error) {
        console.error('Error in text-to-speech:', error);
        return null;
    }
}

module.exports = { textToSpeech };
