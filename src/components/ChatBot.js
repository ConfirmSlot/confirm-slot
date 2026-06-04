import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { C } from '../styles/colors';

const QUICK_REPLIES = [
  'How do I book an appointment?',
  'How to cancel a booking?',
  'Payment options?',
  'Contact support',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: "Hi! 👋 I'm your Onezy assistant. How can I help you today?", ts: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', content: msg, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/v1/chat', { message: msg, history });
      const reply = res.data?.message || res.message || "I'm having trouble responding right now. Please try again.";

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_r',
        role: 'assistant',
        content: reply,
        ts: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_e',
        role: 'assistant',
        content: "Sorry, I couldn't connect. Please try again.",
        ts: new Date(),
      }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div style={s.window}>
          {/* Header */}
          <div style={s.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={s.botAvatar}>🤖</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#fff' }}>Onezy Assistant</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>● Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={s.closeBtn}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={s.messages}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                {m.role === 'assistant' && (
                  <div style={s.avatarSmall}>🤖</div>
                )}
                <div style={{
                  ...s.bubble,
                  ...(m.role === 'user' ? s.bubbleUser : s.bubbleBot),
                  marginLeft: m.role === 'assistant' ? 8 : 0,
                  marginRight: m.role === 'user' ? 0 : 0,
                }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 10, opacity: 0.6, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                    {m.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={s.avatarSmall}>🤖</div>
                <div style={{ ...s.bubble, ...s.bubbleBot }}>
                  <div style={s.dots}>
                    <span style={s.dot} />
                    <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                    <span style={{ ...s.dot, animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies — only show when no user messages yet */}
          {messages.length === 1 && (
            <div style={s.quickReplies}>
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={s.quickBtn}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={s.inputRow}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              style={s.textInput}
              maxLength={1000}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ ...s.sendBtn, opacity: input.trim() && !loading ? 1 : 0.4 }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button onClick={() => setIsOpen(o => !o)} style={s.fab}>
        {isOpen ? '✕' : '💬'}
      </button>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

const s = {
  fab: {
    position: 'fixed',
    bottom: 80,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.PRIMARY,
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(109,40,217,0.4)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  window: {
    position: 'fixed',
    bottom: 140,
    right: 16,
    width: 320,
    maxHeight: 480,
    borderRadius: 20,
    backgroundColor: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    zIndex: 199,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: C.PRIMARY,
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botAvatar:  { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  closeBtn:   { background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: 4 },
  messages:   { flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: 0, maxHeight: 280 },
  avatarSmall:{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, alignSelf: 'flex-end' },
  bubble:     { maxWidth: '75%', padding: '8px 12px', borderRadius: 14, wordBreak: 'break-word' },
  bubbleUser: { backgroundColor: C.PRIMARY, color: '#fff', borderBottomRightRadius: 4 },
  bubbleBot:  { backgroundColor: '#F3F4F6', color: C.TEXT1, borderBottomLeftRadius: 4 },
  dots:       { display: 'flex', gap: 4, padding: '2px 0', alignItems: 'center' },
  dot:        { width: 7, height: 7, borderRadius: '50%', backgroundColor: '#9CA3AF', display: 'inline-block', animation: 'bounce 1.2s infinite' },
  quickReplies:{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid #F3F4F6' },
  quickBtn:   { fontSize: 12, padding: '5px 10px', borderRadius: 12, border: `1px solid ${C.BORDER}`, backgroundColor: '#fff', color: C.PRIMARY, cursor: 'pointer', fontWeight: 600 },
  inputRow:   { display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid #F3F4F6', alignItems: 'center' },
  textInput:  { flex: 1, padding: '10px 12px', borderRadius: 20, border: `1.5px solid ${C.BORDER}`, fontSize: 13, outline: 'none', backgroundColor: '#F9F8FF' },
  sendBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.PRIMARY, border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
