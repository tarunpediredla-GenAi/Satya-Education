import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from '../types';

const SUGGESTED_PROMPTS = [
  'Recommend a Python & Django learning path',
  'Suggest inspiring story books under ₹500',
  'What is the difference between Generative AI and Agentic AI courses?',
  'Explain how N+1 queries are fixed in Django',
];

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Namaste! I am Satya’s Academic Advisor. Ask me for book recommendations across our 20 Technology and 20 Stories & Literature titles, guidance on Python, Django, React, SQL, or AI courses, or help with study topics.',
      timestamp: new Date().toISOString(),
      suggestedLinks: [
        { label: 'Explore 40 Books', path: '/books' },
        { label: 'View Courses', path: '/courses' },
      ],
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach Satya’s Learning Assistant.');
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I can help you explore our books, courses, and recorded classes.',
        timestamp: new Date().toISOString(),
        suggestedLinks: data.suggestedLinks || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : 'Unable to connect to the AI study advisor right now.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Note: ${errorText}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Satya's AI Academic Advisor Chatbot"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0B192C] text-[#FAF8F5] shadow-xl border border-[#C59B27]/40 hover:bg-[#0D6E6E] transition-colors text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4 text-[#C59B27]" />
          <span>Academic Advisor Chat</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Satya's Academic Advisor Chat"
          className="w-[92vw] sm:w-[400px] h-[540px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-[#0B192C]/15 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#0B192C] text-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C59B27]" />
              <div>
                <h3 className="text-sm font-semibold">Satya’s Academic Advisor</h3>
                <p className="text-[11px] text-[#FAF8F5]/70">
                  Course & Book Mentor · Powered by Gemini
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-lg text-[#FAF8F5]/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#0B192C] text-[#FAF8F5]'
                      : 'bg-white text-[#0B192C] border border-[#0B192C]/10 shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.suggestedLinks && msg.suggestedLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.suggestedLinks.map((lnk) => (
                      <button
                        key={lnk.path}
                        type="button"
                        onClick={() => {
                          navigate(lnk.path);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0D6E6E]/10 text-[#0D6E6E] hover:bg-[#0D6E6E] hover:text-white text-xs font-medium transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{lnk.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#0B192C]/60 px-2">
                <div className="w-2 h-2 rounded-full bg-[#0D6E6E] animate-ping" />
                <span>Consulting curriculum & catalog...</span>
              </div>
            )}

            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-medium text-[#0B192C]/60">Suggested questions:</p>
                {SUGGESTED_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-white border border-[#0B192C]/10 text-[#0B192C]/85 hover:border-[#0D6E6E] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-[#0B192C]/10 flex items-center gap-2"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Ask a question about books, courses, or programming
            </label>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Python, Django, Stories, or courses..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] text-[#0B192C]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="p-2.5 rounded-lg bg-[#0D6E6E] text-white hover:bg-[#0B192C] disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
