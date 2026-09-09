import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorshipAPI } from '../../services/api';
import { Send, MessageSquare, Clock, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  requestId: string;
  topic: string;
  otherPartyName: string;
  status: string;
  onClose: () => void;
}

export function MentorshipChat({ requestId, topic, otherPartyName, status, onClose }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    try {
      const res = await mentorshipAPI.getMessages(requestId);
      setMessages(res.data.messages || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [requestId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    // Optimistic update
    const optimistic = {
      id: 'temp-' + Date.now(),
      sender_id: user!.id,
      sender_name: user!.name,
      sender_role: user!.role,
      message: text,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await mentorshipAPI.sendMessage(requestId, text);
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.data.data : m));
    } catch {
      // Remove optimistic on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(text); // restore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = status !== 'REJECTED' && status !== 'PENDING';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });

  // Group messages by date
  const grouped: { date: string; msgs: any[] }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-navy-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {otherPartyName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{otherPartyName}</p>
            <p className="text-xs text-gray-400 truncate max-w-[220px]">{topic || 'Mentorship Discussion'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            status === 'ACCEPTED' ? 'bg-teal-500/20 text-teal-300' :
            status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
            status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-400' :
            'bg-red-500/20 text-red-300'
          )}>{status}</span>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full border-2 border-gray-200 border-t-teal-500 h-8 w-8" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {canSend ? 'Start the conversation below.' : 'Messages available once mentorship is accepted.'}
              </p>
            </div>
          </div>
        ) : (
          grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{date}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-2">
                {msgs.map((msg, i) => {
                  const isMe = msg.sender_id === user!.id;
                  const prevMsg = i > 0 ? msgs[i - 1] : null;
                  const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} className={clsx('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                      {/* Avatar — other party */}
                      {!isMe && (
                        <div className={clsx('w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold',
                          showAvatar ? 'bg-navy-900' : 'opacity-0'
                        )}>
                          {msg.sender_name?.charAt(0)}
                        </div>
                      )}

                      <div className={clsx('max-w-[72%]', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-0.5')}>
                        {showAvatar && !isMe && (
                          <span className="text-xs text-gray-400 ml-1">{msg.sender_name}</span>
                        )}
                        <div className={clsx(
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMe
                            ? 'bg-navy-900 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm',
                          msg._optimistic && 'opacity-70'
                        )}>
                          {msg.message}
                        </div>
                        <span className={clsx('text-xs text-gray-400 flex items-center gap-1 px-1', isMe && 'justify-end')}>
                          <Clock className="w-3 h-3" />
                          {formatTime(msg.created_at)}
                          {msg._optimistic && <span className="text-gray-300">· Sending…</span>}
                        </span>
                      </div>

                      {/* Spacer for my messages */}
                      {isMe && <div className="w-7 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        {!canSend ? (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
            <MessageSquare className="w-4 h-4" />
            {status === 'PENDING'
              ? 'Waiting for mentor to accept the request before chatting'
              : status === 'REJECTED'
              ? 'This mentorship request was declined'
              : 'Session completed'}
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-600 transition-colors max-h-32 overflow-y-auto leading-relaxed"
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-10 h-10 bg-navy-900 text-white rounded-xl flex items-center justify-center hover:bg-navy-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
