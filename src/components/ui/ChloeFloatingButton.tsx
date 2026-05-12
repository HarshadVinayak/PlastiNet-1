import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Plus, Send, FileText, Trash2, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAIStore } from '../../stores/aiStore';
import { SpeechService } from '../../lib/speech';

const ChloeFloatingButton = () => {
  const { isChloeOpen, toggleChloe, setChloeOpen, chloeVoice } = useUIStore();
  const { messages, sendMessage, isTyping, clearHistory } = useAIStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChloeOpen) scrollToBottom();
  }, [messages, isTyping, isChloeOpen]);

  // Stop any speech when chat is closed
  useEffect(() => {
    if (!isChloeOpen) {
      SpeechService.stop();
      setSpeakingId(null);
    }
  }, [isChloeOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;
    setInput('');
    await sendMessage(textToSend);
  };

  const toggleListening = () => {
    if (isListening) {
      SpeechService.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      SpeechService.initSTT(
        (text) => {
          setInput(text);
          handleSend(text);
        },
        () => setIsListening(false)
      )?.start();
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      // Already speaking this message — stop it
      SpeechService.stop();
      setSpeakingId(null);
    } else {
      // Stop any current speech then start new
      SpeechService.stop();
      setSpeakingId(msgId);
      SpeechService.speak(text, chloeVoice, () => setSpeakingId(null));
    }
  };

  return (
    <>
      <motion.button
        drag
        dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChloe}
        className="fixed bottom-24 right-8 z-[4000] w-14 h-14 bg-neon-green rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.5)] cursor-grab active:cursor-grabbing"
      >
        <Sparkles className="text-black" size={28} />
      </motion.button>

      <AnimatePresence>
        {isChloeOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-32 right-8 w-[400px] h-[600px] z-[5000] flex flex-col glass-card border-neon-green/30 bg-black/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(57,255,20,0.2)] overflow-hidden rounded-[2rem]"
          >
            {/* Header */}
            <div className="p-5 bg-neon-green text-black flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-black/10 p-1.5 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="font-black uppercase tracking-tighter text-sm block">Chloe AI Chat</span>
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Impact Agent v2.0</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setChloeOpen(false)} className="p-2 hover:rotate-90 transition-transform">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-green/20 text-neon-green'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none shadow-xl'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          msg.content
                        )}
                      </div>

                      {/* Speaker button — only for assistant messages */}
                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                              speakingId === msg.id
                                ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-[0_0_8px_rgba(57,255,20,0.3)]'
                                : 'bg-white/5 text-white/30 border border-white/10 hover:bg-neon-green/10 hover:text-neon-green hover:border-neon-green/30'
                            }`}
                          >
                            {speakingId === msg.id ? (
                              <>
                                <VolumeX size={11} />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 size={11} />
                                Read
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-white/20 font-medium">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      {/* Timestamp for user messages */}
                      {msg.role === 'user' && (
                        <span className="text-[10px] text-white/20 font-medium">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-neon-green/20 text-neon-green flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="animate-spin" />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1.5 h-4 items-center">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }} className="w-1.5 h-1.5 bg-neon-green/50 rounded-full" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} className="w-1.5 h-1.5 bg-neon-green/50 rounded-full" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="w-1.5 h-1.5 bg-neon-green/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white/[0.02] border-t border-white/10 shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-neon-green/5 blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity" />
                <div className="relative flex items-end gap-2 bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-neon-green/50 transition-all">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 hover:bg-white/5 text-white/40 hover:text-neon-green rounded-xl transition-all"
                  >
                    <Plus size={20} />
                  </button>
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Ask Chloe about impact..."
                    className="flex-1 bg-transparent border-none outline-none py-2.5 px-1 text-sm resize-none max-h-32 custom-scrollbar placeholder:text-white/20"
                  />
                  <button
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'hover:bg-white/5 text-white/40 hover:text-neon-green'
                    }`}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className={`p-2.5 rounded-xl transition-all ${
                      input.trim() && !isTyping
                        ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert(`File "${file.name}" selected for analysis! (Upload integration pending)`);
                  }
                }}
              />
              <p className="text-[10px] text-center text-white/20 mt-3 uppercase tracking-widest font-bold">
                Powered by PlastiNet Groq Llama 3
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChloeFloatingButton;
