import { GoogleGenerativeAI } from '@google/generative-ai';

// Switched to new Gemini Key (Valid: AIzaSyByo...)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getHealthResponse = async (userMessage, language = 'en') => {
    try {
        // Using 'gemini-flash-latest' as verified working model for this key
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Language-specific system prompts
        const systemPrompts = {
            en: "You are a friendly healthcare assistant. Provide helpful, accurate health information. Always remind users to consult professional medical help for serious concerns. Keep responses concise and clear.",
            hi: "आप एक मित्रवत स्वास्थ्य सहायक हैं। उपयोगी, सटीक स्वास्थ्य जानकारी प्रदान करें। हमेशा उपयोगकर्ताओं को गंभीर चिंताओं के लिए पेशेवर चिकित्सा सहायता लेने की याद दिलाएं। प्रतिक्रियाएं संक्षिप्त और स्पष्ट रखें। हिंदी में जवाब दें।",
            mr: "तुम्ही एक मैत्रीपूर्ण आरोग्य सहाय्यक आहात. उपयुक्त, अचूक आरोग्य माहिती द्या. गंभीर चिंतांसाठी नेहमी वापरकर्त्यांना व्यावसायिक वैद्यकीय मदत घेण्याची आठवण करून द्या. प्रतिसाद संक्षिप्त आणि स्पष्ट रखें। मराठीत उत्तर द्या।",
            hinglish: "Aap ek friendly healthcare assistant hain. Helpful aur accurate health information provide karein. Hamesha serious concerns ke liye users ko professional medical help lene ki yaad dilayein. Responses short aur clear rakhein. Hinglish mein jawab dein (Hindi words with English script)."
        };

        const prompt = `${systemPrompts[language]}\n\nUser Question: ${userMessage}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error generating response:', error);
        // More detailed error for user if strictly necessary, but sticking to safe fallback
        return language === 'hi'
            ? 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
            : language === 'mr'
                ? 'माफ करा, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.'
                : language === 'hinglish'
                    ? 'Sorry, kuch galat ho gaya. Please phir se try karein.'
                    : 'Sorry, something went wrong. Please try again.';
    }
};
