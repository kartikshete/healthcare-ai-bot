import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
    const modelName = 'gemini-flash-latest';
    console.log(`Testing ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Hello";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`SUCCESS with ${modelName}:`, response.text());
    } catch (error) {
        console.error(`FAILED ${modelName}:`, error.message);
    }
}

run();
