import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send as Telegram, StopCircle, Plus, ChevronDown, Trash2, History, Paperclip, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachedFiles?: Array<{name: string; content: string; type: string}>;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  model?: string; // AI model used for this chat
}

// Local storage keys
const CHAT_HISTORY_KEY = "ai-chat-history"; // legacy single-thread key
const CHAT_CONVERSATIONS_KEY = "ai-chat-conversations"; // new multi-chat key

export default function AIChatModal({ open, onClose, onInsert }: { open: boolean; onClose: () => void; onInsert: (text: string) => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string; content: string; type: string}>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Available models with descriptions - updated with latest options
  const availableModels = [
    { id: "gpt-4o", name: "GPT-4 Omni", description: "Latest & most capable", recommended: true },
    { id: "gpt-4o-mini", name: "GPT-4 Omni Mini", description: "Fast & efficient" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Powerful & reliable" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fastest & most affordable" }
  ];

  function deriveTitleFromMessages(msgs: Message[]): string {
    const firstUser = msgs.find(m => m.role === 'user');
    if (!firstUser) return "New Chat";
    const text = firstUser.content.replace(/\s+/g, ' ').trim();
    if (text.length <= 50) return text || "New Chat";
    return text.slice(0, 50) + '…';
  }

  // Load chats (and migrate legacy single-thread history if present)
  useEffect(() => {
    async function checkAuthAndLoadChats() {
      try {
        setAuthLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          setCurrentUserId(user.id);
          
          // Load chats directly from Supabase
          const { data: dbChats, error } = await supabase
            .from('chat_histories')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
          if (!error && dbChats) {
            const normalized: Chat[] = dbChats.map((c: any) => ({
              ...c,
              id: c.id,
              title: c.title,
              messages: (c.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
              createdAt: c.created_at,
              updatedAt: c.updated_at,
              model: c.model,
            }));
            setChats(normalized);
            if (normalized.length > 0) {
              setActiveChatId(normalized[0].id);
              setMessages(normalized[0].messages || []);
            }
          }
        } else {
          setIsAuthenticated(false);
          await loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error checking auth or loading chats:', error);
        await loadFromLocalStorage();
      } finally {
        setAuthLoading(false);
      }
    }

    async function loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(CHAT_CONVERSATIONS_KEY);
        if (saved) {
          const parsed: any[] = JSON.parse(saved);
          const normalized: Chat[] = parsed.map((c: any) => ({
            ...c,
            messages: (c.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
          }));
          setChats(normalized);
          if (normalized.length > 0) {
            setActiveChatId(normalized[0].id);
            setMessages(normalized[0].messages || []);
          }
          return;
        }
        const legacy = localStorage.getItem(CHAT_HISTORY_KEY);
        if (legacy) {
          const legacyMsgs = JSON.parse(legacy).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          const chat: Chat = {
            id: uuidv4(),
            title: deriveTitleFromMessages(legacyMsgs),
            messages: legacyMsgs,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const list = [chat];
          localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(list));
          localStorage.removeItem(CHAT_HISTORY_KEY);
          setChats(list);
          setActiveChatId(chat.id);
          setMessages(chat.messages);
        } else {
          const chat: Chat = {
            id: uuidv4(),
            title: "New Chat",
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setChats([chat]);
          setActiveChatId(chat.id);
          setMessages([]);
          localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify([chat]));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }

    checkAuthAndLoadChats();
  }, []);

  // Persist chats whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('❌ [Memory] Failed to save chats:', error);
    }
  }, [chats]);

  // Sync messages into the active chat
  useEffect(() => {
    if (!activeChatId) return;
    setChats(prev => {
      const idx = prev.findIndex(c => c.id === activeChatId);
      if (idx === -1) return prev;
      const updated = [...prev];
      const current = updated[idx];
      const newTitle = current.title && current.title !== 'New Chat' ? current.title : deriveTitleFromMessages(messages);
      updated[idx] = {
        ...current,
        title: newTitle,
        messages: messages,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });

    // Save to database or localStorage
    if (activeChatId && messages.length > 0) {
      const chat = chats.find(c => c.id === activeChatId);
      if (chat) {
        saveChat(activeChatId, chat.title, messages, selectedModel);
      }
    }
  }, [messages, activeChatId, selectedModel]);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100); // Small delay for browser rendering
    }
  }, [open]);

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [messages, streamedContent, open]);

  // Global ESC key handler
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [open, onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelDropdown && !(event.target as Element).closest('.model-dropdown')) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelDropdown]);

  // Start a new chat
  const startNewChat = async () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: selectedModel,
    };

    if (isAuthenticated && currentUserId) {
      const { data, error } = await supabase
        .from('chat_histories')
        .insert({
          user_id: currentUserId,
          title: newChat.title,
          messages: newChat.messages,
          model: newChat.model,
        })
        .select()
        .single();
      if (!error && data) {
        newChat.id = data.id;
        newChat.createdAt = data.created_at;
        newChat.updatedAt = data.updated_at;
      }
    } else {
      localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify([newChat, ...chats]));
    }

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessages([]);
    setError(null);
    setStreamedContent("");
  };

  // Save chat to database or localStorage
  const saveChat = async (chatId: string, title: string, msgs: Message[], model: string) => {
    if (isAuthenticated && currentUserId) {
      await supabase
        .from('chat_histories')
        .update({
          title,
          messages: msgs.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
          model,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId)
        .eq('user_id', currentUserId);
    } else {
      const updatedChats = chats.map(c => 
        c.id === chatId 
          ? { ...c, title, messages: msgs, updatedAt: new Date().toISOString(), model }
          : c
      );
      localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(updatedChats));
    }
  };

  // Delete chat helper
  const deleteChat = async (chatId: string) => {
    if (isAuthenticated && currentUserId) {
      await supabase
        .from('chat_histories')
        .delete()
        .eq('id', chatId)
        .eq('user_id', currentUserId);
    }
    setChats(prev => prev.filter(c => c.id !== chatId));
  };

  // Start editing a chat title
  const startEditTitle = (chat: Chat) => {
    setEditingTitleId(chat.id);
    setEditingTitle(chat.title || "");
  };

  // Save the edited title
  const saveTitle = async () => {
    if (!editingTitleId || !editingTitle.trim()) return;
    
    const chat = chats.find(c => c.id === editingTitleId);
    if (chat) {
      await saveChat(editingTitleId, editingTitle.trim(), chat.messages, chat.model || selectedModel);
    }
    
    setChats(prev => prev.map(chat => 
      chat.id === editingTitleId 
        ? { ...chat, title: editingTitle.trim() }
        : chat
    ));
    
    setEditingTitleId(null);
    setEditingTitle("");
  };

  // Cancel title editing
  const cancelEditTitle = () => {
    setEditingTitleId(null);
    setEditingTitle("");
  };

  // Clear current chat messages
  const clearChat = () => {
    setMessages([]);
    setError(null);
    setStreamedContent("");
    setAttachedFiles([]);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 50000; // ~50KB max per file (roughly 12,000 tokens)
    const MAX_CHARS = 20000; // Max characters per file
    const newFiles: Array<{name: string; content: string; type: string}> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" is too large. Maximum size is 50KB. Please use a smaller file or text excerpt.`);
        continue;
      }

      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = (event) => {
          let content = event.target?.result as string;
          
          // Truncate if too long
          if (content.length > MAX_CHARS) {
            content = content.substring(0, MAX_CHARS) + '\n\n[... Content truncated due to length ...]';
            setError(`File "${file.name}" was truncated to fit token limits.`);
          }
          
          newFiles.push({
            name: file.name,
            content: content,
            type: file.type || 'text/plain'
          });
          resolve();
        };
        
        reader.onerror = () => {
          setError(`Failed to read file "${file.name}". Please try a text-based file.`);
          resolve();
        };
        
        reader.readAsText(file);
      });
    }

    if (newFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  async function handleSend() {
    if (!input.trim() && attachedFiles.length === 0) return;

    if (!activeChatId) startNewChat();

    const userMessage: Message = { 
      role: "user", 
      content: input, 
      timestamp: new Date(),
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Store attached files for this request
    const currentFiles = [...attachedFiles];
    setAttachedFiles([]); // Clear attachments after sending
    
    setLoading(true);
    setStreaming(true);
    setError(null);
    setStreamedContent("");

    // Detect if the user is explicitly asking for a blog post, brainstorm, or outline
    const blogKeywords = [
      "write a blog",
      "draft a blog",
      "blog post",
      "brainstorm",
      "outline",
      "article",
      "generate a post",
      "can you write",
      "please write",
      "create a blog"
    ];
    const isBlogRequest = blogKeywords.some(keyword =>
      input.toLowerCase().includes(keyword)
    );

    let prompt = input;
    
    if (isBlogRequest) {
      const blogInstruction = `Write the response as a ready-to-publish Markdown blog post written by the blog's human author. 
Use clear headings, bullet points or numbered lists when helpful, and include relevant links where appropriate. 
Maintain a warm, cozy, and professional tone throughout.

Do not refer to the AI or explain the writing process. 
Write naturally, as if the blog author is speaking directly to their readers. 
The final post should be polished and require little to no editing before publishing.`;
      prompt = `${blogInstruction}\n\n${prompt}`;
    }

    // Prepare conversation context for memory
    const conversationContext = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Debug logging for memory
    console.log('🔍 [Memory Debug] Sending conversation history:', {
      messageCount: messages.length,
      conversationContext: conversationContext,
      currentPrompt: prompt
    });

    abortControllerRef.current = new AbortController();
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          stream: true, 
          model: selectedModel,
          conversationHistory: conversationContext,
          attachedFiles: currentFiles
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let errorMsg = `Error: ${res.status} ${res.statusText}`;
        try {
          const errorJson = await res.json();
          errorMsg = errorJson.error || errorMsg;
        } catch {
          // Ignore if the response is not JSON
        }
        throw new Error(errorMsg);
      }

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          aiContent += chunk;
          setStreamedContent(aiContent);
        }
      }
      if (aiContent) {
        const assistantMessage: Message = { role: "assistant", content: aiContent, timestamp: new Date() };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      setStreamedContent("");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(`Sorry, an error occurred: ${err.message || "Please try again."}`);
      }
      setStreamedContent("");
    }
    setLoading(false);
    setStreaming(false);
    abortControllerRef.current = null;
  }

  function stopGenerating() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
      setLoading(false);
      setStreamedContent("");
    }
  }

  function handleInsert(content: string) {
    const html = typeof marked.parse === 'function' ? marked.parse(content) : marked(content);
    onInsert(html as string);
    setTimeout(() => textareaRef.current?.focus(), 100);
    onClose();
  }

  // Delete a specific message (and its response if it's a user message)
  function deleteMessage(index: number) {
    setMessages(prev => {
      const newMessages = [...prev];
      // If deleting a user message, also delete the next assistant message if it exists
      if (newMessages[index].role === 'user' && newMessages[index + 1]?.role === 'assistant') {
        newMessages.splice(index, 2);
      } else {
        newMessages.splice(index, 1);
      }
      return newMessages;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
    
    // Escape to close modal
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
    
    // Keyboard shortcuts for model selection
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          setSelectedModel('gpt-4o');
          break;
        case '2':
          e.preventDefault();
          setSelectedModel('gpt-4o-mini');
          break;
        case '3':
          e.preventDefault();
          setSelectedModel('gpt-4-turbo');
          break;
        case '4':
          e.preventDefault();
          setSelectedModel('gpt-3.5-turbo');
          break;
      }
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 xs:p-3 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-background dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full p-0 relative flex flex-col border border-border/50 h-[95vh] sm:h-[90vh] max-h-[850px]" onClick={(e) => e.stopPropagation()} style={{ animation: 'none' }}>
        <div className="flex items-center justify-between px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-5 border-b border-border/50 bg-primary/5 rounded-t-2xl">
          <div className="flex items-center gap-2 xs:gap-3 font-bold text-base xs:text-lg sm:text-xl">
            <div className="relative">
              <Sparkles className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-primary animate-pulse" />
              <div className="absolute inset-0 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-primary animate-ping opacity-20" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">AI Writing Assistant</span>
            {isAuthenticated && (
              <span className="hidden xs:inline-block text-[10px] xs:text-xs bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full font-medium backdrop-blur-sm">
                🔒 Synced
              </span>
            )}
            {!isAuthenticated && !authLoading && (
              <span className="hidden xs:inline-block text-[10px] xs:text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full font-medium backdrop-blur-sm">
                💾 Local Only
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 xs:gap-2">
            <button
              onClick={() => setShowHistory(v => !v)}
              className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 focus:outline-none transition-all duration-200 hover:scale-110"
              title="Chat history"
              aria-label="Chat history"
            >
              <History className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
            <button
              onClick={startNewChat}
              className="hidden xs:block p-1.5 xs:p-2 sm:p-2.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 focus:outline-none transition-all duration-200 hover:scale-110"
              title="New chat"
              aria-label="New chat"
            >
              <Plus className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="hidden xs:block p-1.5 xs:p-2 sm:p-2.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 focus:outline-none transition-all duration-200 hover:scale-110"
                title="Clear current chat"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4 xs:w-5 xs:h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 focus:outline-none transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>
          </div>
        </div>
        
        {/* History panel */}
        {showHistory && (
          <div className="absolute right-2 xs:right-3 top-14 xs:top-16 bottom-2 xs:bottom-3 w-64 xs:w-72 bg-background dark:bg-zinc-800 border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">Chat History</span>
                <div className="text-xs text-muted-foreground mt-1">
                  {isAuthenticated ? '🔒 Synced across devices' : '💾 Local storage only'}
                </div>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-red-600"
                aria-label="Close history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No chats yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {chats.map(chat => (
                    <li key={chat.id} className={`p-3 hover:bg-muted/40 cursor-pointer ${activeChatId === chat.id ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-start gap-2">
                        <button
                          className="flex-1 text-left"
                          onClick={() => {
                            setActiveChatId(chat.id);
                            setMessages(chat.messages || []);
                            setShowHistory(false);
                          }}
                          title={chat.title}
                        >
                          {editingTitleId === chat.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-border rounded bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveTitle();
                                  if (e.key === 'Escape') cancelEditTitle();
                                }}
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); saveTitle(); }}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); cancelEditTitle(); }}
                                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-sm line-clamp-2">{chat.title || 'New Chat'}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(chat.updatedAt || chat.createdAt).toLocaleString()} • {chat.messages?.length || 0} msg
                              </div>
                            </>
                          )}
                        </button>
                        <div className="flex gap-1">
                          {editingTitleId !== chat.id && (
                            <button
                              className="p-1 text-gray-500 hover:text-blue-600"
                              title="Rename chat"
                              aria-label="Rename chat"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditTitle(chat);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 1 1 2.828 2.828L11.828 15.828a2 2 0 0 1-2.828 0L9 13zm-2 6h6"/>
                              </svg>
                            </button>
                          )}
                          <button
                            className="p-1 text-gray-500 hover:text-red-600"
                            title="Delete chat"
                            aria-label="Delete chat"
                            onClick={() => {
                              deleteChat(chat.id);
                              if (activeChatId === chat.id) {
                                setTimeout(() => {
                                  if (chats.length > 1) {
                                    const next = chats.find(c => c.id !== chat.id);
                                    if (next) {
                                      setActiveChatId(next.id);
                                      setMessages(next.messages || []);
                                    } else {
                                      startNewChat();
                                    }
                                  } else {
                                    startNewChat();
                                  }
                                }, 0);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-3 border-t border-border">
              <button
                onClick={startNewChat}
                className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
              >
                New Chat
              </button>
            </div>
          </div>
        )}
        
        {/* Model Selection UI */}
        <div className="px-3 xs:px-4 sm:px-6 py-2 xs:py-3 border-b border-border/50 bg-muted/10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-xs xs:text-sm font-medium text-muted-foreground">AI Model:</span>
              <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5 xs:mt-1 truncate">
                {availableModels.find(m => m.id === selectedModel)?.description}
              </p>
            </div>
            <div className="relative model-dropdown flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm bg-background dark:bg-zinc-800 border border-border rounded-xl hover:bg-muted/50 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="font-medium truncate max-w-[80px] xs:max-w-none">
                  {availableModels.find(m => m.id === selectedModel)?.name}
                </span>
                <ChevronDown className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
              </button>
              
              {showModelDropdown && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-background dark:bg-zinc-800 border border-border rounded-2xl shadow-lg z-10 overflow-hidden">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${
                        selectedModel === model.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            {model.recommended && (
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="ai-chat-scroll-container flex-1 min-h-0 px-3 xs:px-4 sm:px-6 py-3 xs:py-4 space-y-3 xs:space-y-4 bg-muted/5"
          style={{ overflow: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
        >
          {messages.length === 0 && !streamedContent && (
            <div className="text-center text-muted-foreground text-sm space-y-3">
              <div className="mb-2 text-base font-semibold">⌨️ Keyboard Shortcuts</div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-w-md mx-auto text-xs">
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd>
                  <span className="ml-2">Send message</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift+Enter</kbd>
                  <span className="ml-2">New line</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+1</kbd>
                  <span className="ml-2">GPT-4 Omni</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+2</kbd>
                  <span className="ml-2">GPT-4 Mini</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+3</kbd>
                  <span className="ml-2">GPT-4 Turbo</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+4</kbd>
                  <span className="ml-2">GPT-3.5</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
                  <span className="ml-2">Close modal</span>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Click +</kbd>
                  <span className="ml-2">Insert to editor</span>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs opacity-75">
                <div>💡 <strong>Tip:</strong> Click the + button on any AI response to insert it into your blog editor</div>
                <div>🗑️ <strong>Tip:</strong> Hover over any message to delete it (deletes user message + AI response together)</div>
                <div>⌨️ <strong>Tip:</strong> Press ESC anywhere to close this modal</div>
              </div>
            </div>
          )}
          
          {messages.length > 0 && (
            <div className="text-center text-xs text-muted-foreground mb-4 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <span>🧠 Memory Active: AI remembers {messages.length} previous messages</span>
              <div className="mt-1 text-xs opacity-75">
                💾 Chat history is automatically saved • You can ask for improvements, changes, or iterations on previous responses
              </div>
            </div>
          )}
          
          {/* AI/Chat messages */}
          {messages.map((msg, idx) => {
            return (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300 group`}>
                <div className={`relative rounded-2xl px-5 py-3 max-w-[80%] whitespace-pre-line break-words shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card dark:bg-zinc-800/80 text-foreground border border-border/50"}`}>
                  {msg.role === "assistant" ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          className="p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-200 hover:scale-110"
                          title="Delete this message"
                          onClick={() => deleteMessage(idx)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        className="absolute bottom-0 -right-2 p-1 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110"
                        title="Insert this response into the blog editor"
                        onClick={() => handleInsert(msg.content)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          className="p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-200 hover:scale-110"
                          title="Delete this message and its response"
                          onClick={() => deleteMessage(idx)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {msg.attachedFiles.map((file, fileIdx) => (
                            <div key={fileIdx} className="flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl text-sm">
                              <FileText className="w-4 h-4" />
                              <span className="max-w-[200px] truncate">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.content}
                    </>
                  )}
                  <div className="text-xs opacity-60 mt-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          
          {loading && !streamedContent && (
            <div className="flex justify-start">
                <div className="rounded-xl px-4 py-2 bg-white dark:bg-zinc-800 border border-border">
                    <div className="flex items-center justify-center gap-2 h-6">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0s]"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
          )}
          
          {streamedContent && (
            <div className="flex justify-start">
              <div className="relative rounded-xl px-4 py-2 max-w-[80%] bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-border animate-pulse break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamedContent}</ReactMarkdown>
                <button
                  className="absolute bottom-0 -right-2 p-1 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110"
                  title="Insert this response into the blog editor"
                  onClick={() => handleInsert(streamedContent)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {error && <div className="text-red-600 px-6 pb-2 text-sm">{error}</div>}
        
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="px-6 py-3 border-t border-border/50 bg-primary/5">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-card border border-border/50 rounded-xl text-sm shadow-sm hover:shadow-md transition-shadow duration-200">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <form
          className="px-6 py-4 border-t border-border/50 bg-muted/5 rounded-b-2xl"
          onSubmit={e => { e.preventDefault(); if (!loading) handleSend(); }}
        >
          <div className="flex items-end gap-2">
            {/* File attachment button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl hover:bg-primary/10 transition-all duration-200 text-muted-foreground hover:text-primary self-end mb-1 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach text files (.txt only, max 50KB)"
              disabled={loading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            {/* ChatGPT-style input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                className="ai-chat-textarea w-full rounded-2xl border border-border/50 px-5 py-4 pr-14 resize-none bg-background dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground max-h-[200px] shadow-sm hover:shadow-md"
                rows={1}
                placeholder="Message AI Assistant..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{ minHeight: '56px' }}
              />
              {/* Send button inside textarea */}
              {streaming ? (
                <button
                  type="button"
                  className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  onClick={stopGenerating}
                  aria-label="Stop"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading || (!input.trim() && attachedFiles.length === 0)}
                  aria-label="Send"
                >
                  <Telegram className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}