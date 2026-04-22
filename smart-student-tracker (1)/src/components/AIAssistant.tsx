import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'assistant' | 'user';
  text: string;
  type?: 'suggestion' | 'error' | 'success';
}

const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (user) {
        const userData = await dataService.getUserData(user.id);
        if (userData.assistantChat && userData.assistantChat.length > 0) {
          setMessages(userData.assistantChat);
        } else {
          // Load initial greeting
          const greeting = await generateInitialInsight(user.id);
          setMessages([greeting]);
          await dataService.setUserData(user.id, { assistantChat: [greeting] });
        }
      }
    };
    initChat();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const generateInitialInsight = async (userId: string): Promise<Message> => {
    const data = await dataService.getUserData(userId);
    const riskySubjects = (data.subjects || []).filter(s => {
      const att = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
      return att < 75 && s.totalClasses > 0;
    });

    if (riskySubjects.length > 0) {
      return {
        role: 'assistant',
        text: `Welcome back! ⚠️ Your attendance in ${riskySubjects[0].subjectName} is currently ${((riskySubjects[0].attendedClasses / riskySubjects[0].totalClasses) * 100).toFixed(1)}%. I recommend attending your next segment for this subject.`
      };
    }

    const pendingAssignments = (data.assignments || []).filter(a => a.status !== 'completed');
    if (pendingAssignments.length > 0) {
      return {
        role: 'assistant',
        text: `Hey! You have ${pendingAssignments.length} pending assignments. The nearest deadline is ${new Date(pendingAssignments[0].deadline).toLocaleDateString()}. Ready to crush some tasks?`
      };
    }

    return {
      role: 'assistant',
      text: "Hello! I'm your Academic Assistant. I can help you track attendance risks, check your daily schedule, or see upcoming deadlines. What can I help you with today?"
    };
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !user) return;

    const userMessage: Message = { role: 'user', text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    // Simulate AI Response logic
    const assistantResponse = await processQuery(text.toLowerCase(), user.id);
    const finalMessages = [...updatedMessages, assistantResponse];
    setMessages(finalMessages);
    await dataService.setUserData(user.id, { assistantChat: finalMessages });
  };

  const processQuery = async (query: string, userId: string): Promise<Message> => {
    const data = await dataService.getUserData(userId);
    const subjects = data.subjects || [];
    const assignments = data.assignments || [];
    const timetable = data.timetable || [];

    // 1. Attendance Risk
    if (query.includes('risk') || query.includes('attendance') || query.includes('check attendance')) {
      const risky = subjects.filter(s => (s.attendedClasses / (s.totalClasses || 1)) * 100 < 75);
      if (risky.length > 0) {
        return {
          role: 'assistant',
          text: `You have ${risky.length} subject(s) below the 75% threshold: ${risky.map(s => s.subjectName).join(', ')}. You should prioritize these classes.`
        };
      }
      return { role: 'assistant', text: "Great job! All your subjects are currently above the 75% attendance threshold." };
    }

    // 2. Skip Logic
    if (query.includes('skip') || query.includes('bunk')) {
      const safe = subjects.filter(s => {
        const att = (s.attendedClasses / (s.totalClasses || 1)) * 100;
        const safeBunks = Math.floor((s.attendedClasses - 0.75 * s.totalClasses) / 0.75);
        return safeBunks > 0;
      });

      if (safe.length > 0) {
        const firstSafe = safe[0];
        const safeBunks = Math.floor((firstSafe.attendedClasses - 0.75 * firstSafe.totalClasses) / 0.75);
        return {
          role: 'assistant',
          text: `You can safely skip ${safeBunks} class(es) of ${firstSafe.subjectName} and still stay above 75%. Use them wisely!`
        };
      }
      return { role: 'assistant', text: "Your attendance is currently too low or too close to the limit to safely skip any classes. I recommend attending all upcoming sessions." };
    }

    // 3. Deadlines
    if (query.includes('assignment') || query.includes('deadline') || query.includes('task')) {
      const pending = assignments.filter(a => a.status !== 'completed');
      if (pending.length > 0) {
        return {
          role: 'assistant',
          text: `You have ${pending.length} pending assignments. The next one is "${pending[0].title}" due on ${new Date(pending[0].deadline).toLocaleDateString()}.`
        };
      }
      return { role: 'assistant', text: "You have no pending assignments! You're all caught up." };
    }

    // 4. Today's Plan
    if (query.includes('today') || query.includes('plan') || query.includes('schedule')) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()].toLowerCase();
      const classesToday = timetable.filter(t => t.day.toLowerCase() === today);
      
      if (classesToday.length > 0) {
        return {
          role: 'assistant',
          text: `You have ${classesToday.length} classes today. Your first class starts at ${classesToday[0].startTime}.`
        };
      }
      return { role: 'assistant', text: "It looks like you have no classes scheduled for today. A great time to catch up on assignments!" };
    }

    // Default fallback
    return {
      role: 'assistant',
      text: "I'm not sure I understand that. You can ask me about 'attendance risk', 'assignments', 'safe skip count', or 'today's plan'."
    };
  };

  const quickActions = [
    { label: "Today's Plan", query: "Show today's plan" },
    { label: "Check Risk", query: "Which subject is risky?" },
    { label: "Deadlines", query: "Upcoming deadlines" },
    { label: "Can I skip?", query: "How many classes can I skip?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Smart Assistant</h4>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-[10px] opacity-80">Online & Analyzing</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 scroll-smooth"
            >
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-text-main border border-border rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Quick Actions Component */}
              <div className="pt-4 grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.query)}
                    className="p-2 bg-white border border-border rounded-xl text-[10px] font-bold text-text-muted hover:border-primary hover:text-primary transition-all text-center"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer / Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-4 bg-white border-t border-border flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your assistant..."
                className="flex-1 bg-slate-50 border border-border rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 relative z-[101]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
            <Sparkles size={10} />
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
