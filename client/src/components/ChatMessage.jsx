import React from 'react';
import SourceCard from './SourceCard';

function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? (
          <div className="avatar-user">You</div>
        ) : (
          <div className="avatar-ai">AI</div>
        )}
      </div>

      <div className="message-body">
        <div className="message-text">
          {message.text}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="sources-section">
            <span className="sources-title">Sources used:</span>
            <div className="sources-list">
              {message.sources.map((source, index) => (
                <SourceCard key={source._id || index} source={source} />
              ))}
            </div>
          </div>
        )}

        <div className="message-time">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
