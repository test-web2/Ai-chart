import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, ChevronDown, Image as ImageIcon, X, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (Preview)", desc: "Advanced reasoning for complex tasks" },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", desc: "Best for overall performance" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", desc: "Fast and lightweight" },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "model",
  content: "مرحباً! أنا المساعد الذكي، مدعوم بنماذج Gemini المتطورة. كيف يمكنني مساعدتك اليوم في التحليل أو التداول أو أي استفسار آخر؟ (يمكنك إرفاق صور أيضاً)"
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Image handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, selectedImage]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // clear input
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    const currentInput = input;
    const currentImage = selectedImage;
    
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      content: currentInput,
      imageBase64: currentImage || undefined
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          imageBase64: currentImage,
          history: messages.filter(m => m.id !== "initial"),
          model: model
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "فشل في الاتصال بالخادم");
      }
      const data = await res.json();
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.text || "لا يوجد رد."
      }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `⚠️ ${error.message || "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى التحقق من اتصالك والمحاولة مرة أخرى."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setSelectedImage(null);
    setInput("");
  };

  const selectedModel = MODELS.find(m => m.id === model);

  return (
    <div className="w-full max-w-5xl mx-auto h-[80vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">مساعد الذكاء الاصطناعي</h2>
            <p className="text-xs text-slate-400">تحدث مع أقوى نماذج Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-slate-800 rounded-full transition-colors text-sm font-medium text-slate-400"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">مسح</span>
          </button>
          
          {/* Custom Model Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <span className="text-slate-300">{selectedModel?.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModel(m.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-right px-4 py-3 hover:bg-slate-900 transition-colors flex flex-col gap-1 border-b border-slate-800/50 last:border-0",
                        model === m.id ? "bg-blue-500/10" : ""
                      )}
                    >
                      <span className={cn("font-bold text-sm", model === m.id ? "text-blue-400" : "text-slate-200")}>{m.name}</span>
                      <span className="text-xs text-slate-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-slate-950/50"
      >
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          return (
            <div 
              key={msg.id} 
              className={cn("flex gap-4 w-full", isModel ? "justify-start" : "justify-end")}
            >
              {isModel && (
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
              )}
              
              <div 
                className={cn(
                  "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 leading-relaxed",
                  isModel 
                    ? "bg-slate-900 border border-slate-800 text-slate-200 rounded-tr-none markdown-body" 
                    : "bg-blue-600 text-white rounded-tl-none"
                )}
                dir="auto"
              >
                {msg.imageBase64 && (
                  <img 
                    src={msg.imageBase64} 
                    alt="مرفق" 
                    className="max-w-full h-auto rounded-lg mb-3 shadow-sm"
                  />
                )}
                {isModel ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>

              {!isModel && (
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
          )
        })}

        {isLoading && (
          <div className="flex gap-4 w-full justify-start animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tr-none p-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
        {/* Image Preview */}
        {selectedImage && (
          <div className="relative inline-block self-end animate-in fade-in slide-in-from-bottom-2">
            <img src={selectedImage} alt="Preview" className="h-24 rounded-lg border border-slate-700 shadow-md object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-700 hover:bg-red-500 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative max-w-5xl w-full mx-auto flex gap-2 items-center"
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors shrink-0"
            title="إرفاق صورة"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-6 py-3 md:py-4 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6 rtl:-scale-x-100" />}
          </button>
        </form>
      </div>
    </div>
  );
}
