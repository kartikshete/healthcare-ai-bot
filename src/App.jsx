import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Heart, MessageSquare, AlertTriangle, Send, Settings, Trash2, X, Mic, MicOff } from 'lucide-react';
import { getHealthResponse } from './services/aiService';
import { translations, healthTips } from './data/translations';
import './index.css';

function App() {
    const [language, setLanguage] = useState('en');
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Auto-scroll to bottom of chat
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const t = translations[language];
    const tips = healthTips[language];

    // Voice Input Logic
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            // Set language based on selection
            recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(prev => (prev ? prev + ' ' : '') + transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert("Browser does not support voice input. Try Chrome/Edge.");
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage;
        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await getHealthResponse(userMessage, language);
            setMessages(prev => [...prev, { type: 'ai', text: response }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                type: 'ai',
                text: language === 'hi' ? 'कुछ गलत हो गया। कंसोल चेक करें।' : 'Sorry, something went wrong. Please check console logs.'
            }]);
        }

        setIsLoading(false);
    };

    const refreshTip = () => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    };

    const clearChat = () => {
        setMessages([]);
        setShowSettings(false);
    };

    return (
        <div className="app-container">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #14B8A6, #0891B2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                    }}>
                        <Heart size={24} color="white" />
                    </div>
                    <div>
                        <h2>{t.appName}</h2>
                        <p>{t.tagline}</p>
                    </div>
                </div>

                {/* Settings Button & Dropdown */}
                <div className="settings-container">
                    <button
                        className="settings-toggle-btn"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>

                    {showSettings && (
                        <div className="settings-dropdown">
                            <div className="dropdown-header">
                                <h3>Preferences</h3>
                                <button className="close-btn" onClick={() => setShowSettings(false)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="setting-group">
                                <label>Language</label>
                                <div className="lang-grid">
                                    {['en', 'hi', 'mr', 'hinglish'].map(lang => (
                                        <button
                                            key={lang}
                                            className={`lang-option ${language === lang ? 'active' : ''}`}
                                            onClick={() => setLanguage(lang)}
                                        >
                                            {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : 'Hinglish'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Chat Options</label>
                                <button className="clear-chat-btn" onClick={clearChat}>
                                    <Trash2 size={16} /> Clear Conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <div className="nav-menu">
                    <div
                        className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageCircle size={20} />
                        <span>{t.chat}</span>
                    </div>

                    <div
                        className={`nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emergency')}
                    >
                        <AlertTriangle size={20} />
                        <span>{t.emergency}</span>
                    </div>

                    <div
                        className={`nav-item ${activeTab === 'tips' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tips')}
                    >
                        <Heart size={20} />
                        <span>{t.healthTips}</span>
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
                        onClick={() => setActiveTab('feedback')}
                    >
                        <MessageSquare size={20} />
                        <span>{t.feedback}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                {activeTab === 'chat' && (
                    <div className="chat-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <MessageCircle className="text-teal-500" /> {t.chatAssistant}
                            </h2>
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Trash2 size={14} /> Clear
                                </button>
                            )}
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="welcome-message">
                                    <div className="welcome-icon">👋</div>
                                    <h3>
                                        {language === 'hi' ? 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?'
                                            : language === 'mr' ? 'नमस्कार! मी तुम्हाला कशी मदत करू शकतो?'
                                                : language === 'hinglish' ? 'Namaste! Main aapki kaise help kar sakta hoon?'
                                                    : 'Hello! How can I help you regarding your health today?'}
                                    </h3>
                                    <p>{t.disclaimer}</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.type}`}>
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message ai typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-container">
                            <button
                                className={`mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={startListening}
                                title="Speak"
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            <input
                                type="text"
                                className="chat-input"
                                placeholder={isListening ? "Listening..." : t.typePlaceholder}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                className="send-btn"
                                onClick={handleSendMessage}
                                disabled={isLoading || (!inputMessage.trim() && !isListening)}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Emergency Tab */}
                {activeTab === 'emergency' && (
                    <div className="emergency-view">
                        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
                            <AlertTriangle /> {t.emergency}
                        </h2>

                        <div className="helpline-grid">
                            <div className="helpline-card">
                                <h4>{t.nationalAmbulance}</h4>
                                <p><Phone size={24} /> 108</p>
                            </div>
                            <div className="helpline-card">
                                <h4>{t.womenHelpline}</h4>
                                <p><Phone size={24} /> 1091</p>
                            </div>
                            <div className="helpline-card">
                                <h4>{t.childHelpline}</h4>
                                <p><Phone size={24} /> 1098</p>
                            </div>
                            <div className="helpline-card">
                                <h4>{t.fireEmergency}</h4>
                                <p><Phone size={24} /> 101</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#FEE2E2', borderRadius: '12px', color: '#991B1B' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <AlertTriangle size={18} /> Important
                            </h4>
                            <p style={{ fontSize: '0.95rem' }}>
                                {language === 'hi' ? 'आपातकालीन स्थिति में तुरंत नजदीकी अस्पताल से संपर्क करें।'
                                    : language === 'mr' ? 'आपत्कालीन परिस्थितीत त्वरित जवळच्या रुग्णालयाशी संपर्क साधा.'
                                        : 'In case of extreme emergency, please visit the nearest hospital immediately.'}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'tips' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Heart className="text-teal-500" /> {t.healthTips}
                            </h2>
                            <button className="refresh-btn" onClick={refreshTip}>
                                <RefreshCw size={16} /> {t.getNewTips}
                            </button>
                        </div>

                        <div className="tips-grid">
                            {tips.map((tip, idx) => (
                                <div key={idx} className="tip-card-large">
                                    <div className="tip-icon">💡</div>
                                    <p>{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                    <div>
                        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare className="text-teal-500" /> {t.feedback}
                        </h2>
                        <div style={{ maxWidth: '600px' }}>
                            <textarea
                                style={{
                                    width: '100%',
                                    minHeight: '200px',
                                    padding: '1rem',
                                    border: '2px solid var(--border-light)',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    resize: 'vertical',
                                    marginBottom: '1rem'
                                }}
                                placeholder={t.feedbackPlaceholder}
                            />
                            <button className="send-btn full-width">
                                {t.submit}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
