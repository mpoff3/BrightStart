"use client";
import { useState, useEffect } from 'react';

export default function MessageStreamTest() {
  const [messages, setMessages] = useState<any[]>([]);
  const [caseId, setCaseId] = useState('1');

  useEffect(() => {
    const eventSource = new EventSource(`/api/messages/stream?started_case_id=${caseId}`);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => {
      eventSource.close();
    };
  }, [caseId]);

  // Test sending a new message
  const sendTestMessage = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          started_case_id: caseId,
          persona_id: 1, // Replace with actual persona ID
          content: "This is a test message " + new Date().toISOString(),
          is_user_message: false,
        }),
      });
      const data = await response.json();
      console.log('Sent message:', data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={sendTestMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Test Message
        </button>
      </div>
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 border rounded">
            <div>From: {msg.persona_name || 'User'}</div>
            <div>{msg.content}</div>
            <div className="text-sm text-gray-500">
              {new Date(msg.sent_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 