'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Mic, Plus, Trash2, RotateCcw, ChevronRight, Bot, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

type Conversation = {
  id: string
  title: string
  time: string
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', title: 'Gaming Laptop under ₹1L', time: '2 hours ago' },
  { id: '2', title: 'iPhone 15 vs S24', time: 'Yesterday' },
  { id: '3', title: 'Noise Cancelling Headphones', time: '3 days ago' },
  { id: '4', title: 'Mechanical Keyboards', time: 'Last week' },
  { id: '5', title: '4K Monitor for Mac', time: 'Last week' },
]

const SUGGESTIONS = [
  'Best laptops under ₹50,000',
  'Compare iPhone vs Samsung',
  'Top rated headphones',
  'Gaming PC build guide'
]

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string>('new')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = useCallback((text: string = input) => {
    if (!text.trim()) return
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMsg])
    setInput('')
    setIsTyping(true)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Mock AI response
    setTimeout(() => {
      setIsTyping(false)
      
      const query = text.toLowerCase()
      let responseText = "I can help you research that! What specific features are you looking for in your budget?"
      
      if (query.includes('laptop')) {
        responseText = "For laptops, the **Apple MacBook Air M2** is currently best in class for battery life and portability. For Windows, I highly recommend the **ASUS ROG Zephyrus G14** (starting at ₹1,15,000) for gaming, or the **Lenovo IdeaPad Slim 5** (around ₹65,000) for budget productivity."
      } else if (query.includes('phone') || query.includes('iphone') || query.includes('samsung')) {
        responseText = "If you're comparing phones, the **iPhone 15** excels in video recording and ecosystem integration. The **Samsung Galaxy S24** offers superior zoom cameras and a beautiful 120Hz AMOLED display. Both start around ₹75,000-₹80,000. Do you prefer iOS or Android?"
      } else if (query.includes('headphone')) {
        responseText = "The **Sony WH-1000XM5** (approx ₹29,990) remains the king of ANC headphones. For a more budget-friendly option, the **Soundcore Life Q30** (₹5,999) offers fantastic value with great noise cancellation and battery life."
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newAiMsg])
    }, 1500)
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
    setActiveConversationId('new')
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] flex-col border-r border-border bg-card transition-transform duration-300 md:relative md:flex ${sidebarOpen ? 'flex translate-x-0' : 'hidden -translate-x-full md:translate-x-0'}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <span className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Conversations
          </span>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-3">
          <Button onClick={clearChat} className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20" variant="ghost">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
          {MOCK_CONVERSATIONS.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`w-full flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors ${
                activeConversationId === conv.id ? 'bg-accent/50 text-accent-foreground' : 'hover:bg-accent/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-sm font-medium truncate w-full">{conv.title}</span>
              <span className="text-xs opacity-70">{conv.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col relative grid-bg">
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6 z-10 shadow-soft">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-4 text-white shadow-glow">
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold gradient-text hidden sm:block">Vyzo AI</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                Powered by GPT-4
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearChat} className="hidden sm:flex gap-2">
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            <Button size="sm" onClick={clearChat} className="gap-2 shadow-glow">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Conversation</span>
            </Button>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar relative">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex h-full flex-col items-center justify-center text-center max-w-2xl mx-auto"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 shadow-glow animate-float">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-3 text-balance">
                  How can I help you <span className="gradient-text">shop smarter?</span>
                </h2>
                <p className="text-muted-foreground mb-10 max-w-md">
                  I can analyze products, compare specs, find the best deals, and give you personalized buying advice.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {SUGGESTIONS.map((suggestion) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="group flex items-center justify-between rounded-xl border border-border/50 glass-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-glow"
                    >
                      <span className="text-sm font-medium">{suggestion}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto pb-4">
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-primary to-chart-4 text-white'
                    }`}>
                      {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-5 py-3.5 text-sm sm:text-base shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-card border border-border/50 rounded-tl-none leading-relaxed'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 flex-row"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm bg-gradient-to-br from-primary to-chart-4 text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1 items-center shadow-sm">
                      <motion.div className="h-2 w-2 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className="h-2 w-2 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                      <motion.div className="h-2 w-2 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* INPUT BAR */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-background via-background to-transparent z-20">
          <div className="mx-auto max-w-3xl relative">
            <div className="flex flex-col rounded-2xl glass-card border border-border/60 shadow-lg focus-within:ring-1 focus-within:ring-primary/50 transition-all focus-within:border-primary/50 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a product, e.g., 'Best noise cancelling headphones under ₹10,000'"
                className="w-full resize-none bg-transparent px-4 py-4 text-sm sm:text-base outline-none placeholder:text-muted-foreground min-h-[56px] max-h-[120px]"
                rows={1}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-primary rounded-xl h-8 w-8"
                    onClick={() => toast.info('Voice input coming soon!')}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground hidden sm:inline-block">
                    {input.length}/2000 • Ctrl/Cmd + Enter to send
                  </span>
                  <Button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    size="icon" 
                    className="h-8 w-8 rounded-xl shrink-0 transition-transform active:scale-95 shadow-glow"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
