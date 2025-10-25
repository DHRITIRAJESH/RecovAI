import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hello! I\'m your 24/7 recovery assistant. I can answer questions about your recovery, help with concerns, and provide personalized guidance. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load quick questions when chatbot opens
  useEffect(() => {
    if (isOpen && quickQuestions.length === 0) {
      fetchQuickQuestions();
    }
  }, [isOpen]);

  const fetchQuickQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chatbot/quick-questions', {
        withCredentials: true
      });
      setQuickQuestions(response.data.quick_questions || []);
    } catch (error) {
      console.error('Failed to fetch quick questions:', error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message to chat
    const userMessage = {
      type: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to backend chatbot
      const response = await axios.post(
        'http://localhost:5000/api/chatbot/ask',
        {
          message: messageText,
          chat_history: messages.filter(m => m.type === 'user' || m.type === 'bot').slice(-10)
        },
        { withCredentials: true }
      );

      // Add bot response
      const botMessage = {
        type: 'bot',
        text: response.data.response,
        actions: response.data.recommended_actions || [],
        needsAlert: response.data.needs_alert || false,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);

      // Show alert if needed
      if (response.data.needs_alert) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 8000);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Add error message
      const errorMessage = {
        type: 'bot',
        text: '❌ I\'m having trouble connecting right now. Please try again in a moment, or contact your doctor if this is urgent.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Alert Notification */}
      {showAlert && (
        <div className="absolute bottom-20 right-0 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg animate-pulse max-w-sm">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div>
              <p className="font-bold">Doctor Notified</p>
              <p className="text-sm">Your doctor has been alerted about your symptoms.</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col mb-4 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <div>
                <h3 className="font-bold text-lg">Recovery Assistant</h3>
                <p className="text-xs text-blue-100">Online • 24/7 Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                  }`}
                >
                  {msg.type === 'bot' && msg.needsAlert && (
                    <div className="bg-red-100 text-red-800 p-2 rounded mb-2 text-sm flex items-center">
                      <span className="text-lg mr-2">⚠️</span>
                      <span className="font-semibold">Doctor has been notified</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold mb-2 text-blue-700">📋 Recommended Actions:</p>
                      <ul className="text-sm space-y-1">
                        {msg.actions.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-70">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block bg-white p-3 rounded-lg shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {quickQuestions.length > 0 && messages.length <= 3 && (
            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-white hover:bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              🔒 Secure • AI-powered recovery guidance
            </p>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center group"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            AI
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
