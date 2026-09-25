import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { sendChatMessage } from '../services/api';

const EXAMPLE_QUESTIONS = [
  'What is the annual leave policy for employees?',
  'Summarize the key points in the uploaded files.',
  'What are the main guidelines mentioned in the documents?'
];

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const questionText = (textToSend || inputQuestion).trim();
    if (!questionText) {
      setChatError('Please enter a question before sending.');
      return;
    }

    setChatError('');
    setInputQuestion('');

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: questionText,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(questionText);

      // Add AI response
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.answer,
        sources: response.sources || [],
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error communicating with AI assistant.';
      setChatError(errorMsg);

      const errorAiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Error: ${errorMsg}`,
        sources: [],
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorAiMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setChatError('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h2>AI Document Assistant</h2>
          <p className="chat-subtitle">Ask questions based on your uploaded documents</p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClearChat} className="btn btn-secondary btn-sm" title="Clear chat history">
            Clear Chat
          </button>
        )}
      </div>

      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>How can I assist you with your documents?</h3>
            <p>Select an example question below or type your own question.</p>

            <div className="example-questions">
              {EXAMPLE_QUESTIONS.map((eq, i) => (
                <button
                  key={i}
                  className="example-question-btn"
                  onClick={() => handleSendMessage(eq)}
                  disabled={isLoading}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 16 16 12 12 8"></polyline>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>{eq}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {isLoading && (
          <div className="chat-message ai-message">
            <div className="message-avatar">
              <div className="avatar-ai">AI</div>
            </div>
            <div className="message-body">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {chatError && (
        <div className="chat-error-bar">
          <span>{chatError}</span>
        </div>
      )}

      <div className="chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Ask a question about your documents... (Press Enter to send)"
          value={inputQuestion}
          onChange={(e) => {
            setInputQuestion(e.target.value);
            if (chatError) setChatError('');
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          className="btn btn-primary chat-send-btn"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputQuestion.trim()}
          title="Send question"
        >
          {isLoading ? (
            <span className="btn-spinner"></span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
