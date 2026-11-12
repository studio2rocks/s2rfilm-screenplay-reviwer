import React, { useState, useRef, useEffect } from 'react';
import { AISettings, ScriptMetadata, StoryDoctorMessage } from '../types/script';
import { Send, Bot, User, ShieldCheck } from 'lucide-react';

interface StoryDoctorChatProps {
  metadata: ScriptMetadata;
  screenplayText: string;
  aiSettings?: AISettings;
}

export const StoryDoctorChat: React.FC<StoryDoctorChatProps> = ({
  metadata,
  screenplayText,
  aiSettings
}) => {
  const [messages, setMessages] = useState<StoryDoctorMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to S2RFilm Story Doctor. I am your dramaturgical consultant for "${metadata.title}" (${metadata.genre}).\n\nI operate under our Strict Voice-Preservation Mandate: I will never push formulaic studio clichés on your script. How can I assist you with character agency, narrative velocity, or dialogue subtext today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: StoryDoctorMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/story-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          scriptContext: screenplayText,
          metadata,
          aiSettings
        })
      });

      const data = await response.json();
      if (data.reply) {
        const botMsg: StoryDoctorMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Story doctor query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How can I raise the stakes at the midpoint without cliché action tropes?',
    'Is my protagonist demonstrating enough active dramatic agency?',
    'How do I heighten the unspoken subtext between the two leads in scene 1?',
    'Does the climax resolve both the external plot goal and internal emotional need?'
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
          Context-Aware Dramaturgy Consultant
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
          Story Doctor Studio Chat
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Grounded directly in your screenplay text, character arcs, and authorial statement. Dedicated to preserving your creative voice.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[560px]">
        
        {/* Chat Header Bar */}
        <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 block">
                S2RFilm Story Doctor
              </span>
              <span className="text-3xs text-zinc-400 font-mono">
                {metadata.title} ({metadata.targetFormat})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-3xs text-zinc-300 font-medium bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-750">
            <ShieldCheck className="w-3 h-3 text-zinc-300" />
            <span>Voice Safeguard Active</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {messages.map((m) => {
            const isBot = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-3xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center mt-0.5 ${
                    isBot ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-zinc-700 text-zinc-100'
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                        : 'bg-zinc-100 text-zinc-950 font-medium'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-3xs text-zinc-500 px-1 font-mono block">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 max-w-xl mr-auto">
              <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-zinc-400 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                <span>Story Doctor analyzing dramaturgy...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample Prompts Tray */}
        <div className="bg-zinc-950/60 border-t border-zinc-800/60 px-3.5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-3xs text-zinc-500 uppercase font-semibold shrink-0">Prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2 py-0.5 text-3xs rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the story doctor about a scene, character flaw, or pacing beat..."
              disabled={isLoading}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
