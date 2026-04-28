'use client'

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const text = input;
    setInput('');
    sendMessage({ text });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-800">🤖 AIコーチング</h1>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 pt-10">
            <div className="text-6xl mb-2">💪</div>
            <p className="text-center leading-relaxed">
              お疲れ様です！<br />
              あなたの最近のトレーニング記録を読み込みました。<br />
              アドバイスが欲しいことや、次回のメニューの相談など<br />
              何でも聞いてください！
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border text-gray-800 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.parts
                      .filter(part => part.type === 'text')
                      .map((part: any) => part.text)
                      .join('')}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border text-gray-800 shadow-sm rounded-2xl rounded-bl-none px-4 py-4 flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Form */}
      <footer className="bg-white border-t shrink-0 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex space-x-2">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={input}
            placeholder="コーチに質問する..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-full px-6 py-2 font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            送信
          </button>
        </form>
      </footer>
    </div>
  );
}
