import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5688/support', { 
        messages: updatedMessages 
      });
      
      const botMessage = { 
        role: 'assistant', 
        content: response.data.reply 
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your message.' 
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div 
        ref={chatBoxRef} 
        className="chat-box overflow-y-auto h-96"
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-2 m-1 rounded ${
              msg.role === 'user' 
                ? 'bg-blue-100 text-right' 
                : 'bg-green-100 text-left'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">
            Generating response...
          </div>
        )}
      </div>
      <div className="chat-input flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded"
        />
        <button 
          onClick={sendMessage} 
          disabled={isLoading}
          className="p-2 bg-blue-500 text-white rounded ml-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;