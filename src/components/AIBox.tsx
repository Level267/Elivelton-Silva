import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Sparkles, Send, X, ShieldAlert, Cpu, Bot, ThumbsUp, Radio, ChevronDown, Check, RotateCcw, BookOpen } from "lucide-react";
import { INITIAL_ARTICLES, Article } from "../data";

interface AIBoxProps {
  activeArticle: Article | null;
  articles?: Article[];
  isReadingArticle?: boolean;
  onClose?: () => void;
}

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function AIBox({ 
  activeArticle, 
  articles = INITIAL_ARTICLES, 
  isReadingArticle = false, 
  onClose 
}: AIBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "E aí, nobre aventureiro! Sou o **DigaBot**, seu fiel conselheiro geek. Pergunte-me qualquer curiosidade nerd ou selecione uma notícia na aba CONJURAÇÃO IA para gerar resumos instantâneos de diferentes estilos baseados em inteligência artificial corporativa!",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "magic">("chat");
  const [magicOutput, setMagicOutput] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicStyle, setMagicStyle] = useState<"geek" | "debate" | "bullets">("geek");

  // Selection states
  const [selectedMagicArticle, setSelectedMagicArticle] = useState<Article | null>(activeArticle || articles[0] || null);
  const [chatContextArticle, setChatContextArticle] = useState<Article | null>(isReadingArticle ? activeArticle : null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle active article change from parent page
  useEffect(() => {
    if (activeArticle) {
      setSelectedMagicArticle(activeArticle);
      if (isReadingArticle) {
        setChatContextArticle(activeArticle);
      }
    }
  }, [activeArticle, isReadingArticle]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg = userInput;
    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }].map(m => ({
            role: m.role,
            content: m.content
          })),
          articleContext: chatContextArticle ? `${chatContextArticle.title} - ${chatContextArticle.excerpt}` : undefined
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", content: `⚔️ *Erro no servidor da guilda:* ${data.error || "Não consegui conexão no momento."}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "📡 *Falha na transmissão:* Não consegui estabelecer conexão de longa distância. Verifique os servidores locais." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicGeneration = async (style: "geek" | "debate" | "bullets") => {
    if (!selectedMagicArticle) return;
    setMagicLoading(true);
    setMagicStyle(style);
    setMagicOutput("");

    try {
      const response = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedMagicArticle.title,
          content: selectedMagicArticle.content,
          style: style
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMagicOutput(data.output);
      } else {
        setMagicOutput(`⚠️ Falha na conjuração de IA: ${data.error}`);
      }
    } catch (error) {
      setMagicOutput("💀 Portal indisponível. Reabra e certifique-se que a chave sintonizadora está funcionando.");
    } finally {
      setMagicLoading(false);
    }
  };

  const sendSuggestedMessage = (text: string) => {
    setUserInput(text);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "bot",
        content: "Histórico limpo! Com o que posso ajudar você agora, nobre herói?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#13151a] text-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-[#242b35] flex items-center justify-between bg-[#191d24]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-tight text-sm flex items-center gap-1.5">
              DigaBot <span className="text-[10px] bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 px-1.5 rounded-full py-0.5">IA AGENT</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-mono font-medium">Guia de Viagem Nerd</p>
          </div>
        </div>
        {onClose && (
          <button 
            id="close-bot-btn"
            onClick={onClose} 
            className="p-1 hover:bg-[#2c333f] text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#242b35] bg-[#0f1115]">
        <button
          id="tab-chat"
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "chat" 
              ? "border-cyan-500 text-white bg-[#13151a]" 
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#161a22]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          CONVERSA
        </button>
        <button
          id="tab-magic"
          type="button"
          onClick={() => setActiveTab("magic")}
          className={`flex-1 py-2 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "magic" 
              ? "border-purple-500 text-white bg-[#13151a]" 
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#161a22]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          CONJURAÇÃO IA
        </button>
      </div>

      {/* Active Chat Context Advisor Header Block */}
      {activeTab === "chat" && (
        <div className="px-4 py-2 bg-[#0c0d12]/70 border-b border-[#242b35] flex items-center justify-between text-[10px] text-gray-400">
          {chatContextArticle ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <p className="truncate text-[10.5px]">
                Sintonizado: <span className="font-bold text-slate-100">{chatContextArticle.title}</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
              <p className="text-slate-400">Canal Geral (Livre de contexto)</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 shrink-0">
            {chatContextArticle ? (
              <button
                type="button"
                onClick={() => setChatContextArticle(null)}
                className="text-cyan-400 hover:text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
                title="Limpar contexto do chat"
              >
                Limpar
              </button>
            ) : (
              activeArticle && (
                <button
                  type="button"
                  onClick={() => setChatContextArticle(activeArticle)}
                  className="text-purple-400 hover:text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                >
                  Sintonizar Matéria
                </button>
              )
            )}
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#232b38] transition-colors"
              title="Limpar chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content scroll window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {activeTab === "chat" ? (
          <>
            {/* Messages */}
            <div className="space-y-4 min-h-full">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-cyan-600 text-white rounded-br-none" 
                      : "bg-[#191d24] border border-[#2b3341] text-gray-200 rounded-bl-none"
                  }`}>
                    {m.role === "bot" && (
                      <div className="text-[9px] text-cyan-400 font-mono mb-1 uppercase tracking-wider flex items-center gap-1 font-bold">
                        <Cpu className="w-2.5 h-2.5" /> DIGABOT
                      </div>
                    )}
                    <div className="whitespace-pre-line prose prose-invert max-w-none text-[11.5px] leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#191d24] border border-[#2b3341] rounded-2xl p-3 rounded-bl-none max-w-[85%] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-gray-400 font-mono">Consultando o Codex...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* News Selector block */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider block">
                Selecionar Notícia para IA
              </label>
              
              <button
                id="article-select-dropdown-btn"
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#191d24] border border-[#2b3341] hover:border-purple-500/50 rounded-xl p-2.5 flex items-center justify-between transition-all text-left animate-none"
              >
                {selectedMagicArticle ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={selectedMagicArticle.imageUrl}
                      alt=""
                      className="w-7 h-7 rounded object-cover border border-white/10 shrink-0 pointer-events-none"
                    />
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase font-mono tracking-wide text-purple-400 font-extrabold leading-none mb-0.5 animate-none">
                        {selectedMagicArticle.category}
                      </p>
                      <p className="text-xs font-bold text-white truncate leading-tight">
                        {selectedMagicArticle.title}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Selecione uma matéria...</span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#191d24] border border-[#2b3341] rounded-xl shadow-2xl max-h-56 overflow-y-auto z-30 divide-y divide-white/5 scrollbar-thin overflow-x-hidden"
                  >
                    {articles.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => {
                          setSelectedMagicArticle(art);
                          setIsDropdownOpen(false);
                          setMagicOutput(""); // Clear past output
                        }}
                        className={`w-full p-2.5 flex items-center gap-2 text-left hover:bg-[#232b38] transition-colors ${
                          selectedMagicArticle?.id === art.id ? "bg-purple-950/20" : ""
                        }`}
                      >
                        <img
                          src={art.imageUrl}
                          alt=""
                          className="w-6 h-6 rounded object-cover shrink-0 pointer-events-none"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-mono uppercase bg-purple-900/30 text-purple-300 px-1 py-0.5 rounded mr-1">
                            {art.category}
                          </span>
                          <span className="text-xs font-semibold text-gray-200 truncate block mt-1">
                            {art.title}
                          </span>
                        </div>
                        {selectedMagicArticle?.id === art.id && (
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedMagicArticle ? (
              <div className="space-y-4">
                {/* Generation Options/Triggers */}
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    id="action-geek"
                    type="button"
                    onClick={() => handleMagicGeneration("geek")}
                    className={`py-2 px-1 text-[10px] font-bold tracking-wider rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                      magicStyle === "geek" && magicOutput
                        ? "bg-purple-600/20 border-purple-500 text-purple-200"
                        : "bg-[#191d24] border-[#252c38] hover:border-purple-600/50"
                    }`}
                  >
                    <span className="text-base">🤪</span>
                    <span>Meme</span>
                  </button>
                  <button 
                    id="action-debate"
                    type="button"
                    onClick={() => handleMagicGeneration("debate")}
                    className={`py-2 px-1 text-[10px] font-bold tracking-wider rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                      magicStyle === "debate" && magicOutput
                        ? "bg-purple-600/20 border-purple-500 text-purple-200"
                        : "bg-[#191d24] border-[#252c38] hover:border-purple-600/50"
                    }`}
                  >
                    <span className="text-base">⚔️</span>
                    <span>Debate</span>
                  </button>
                  <button 
                    id="action-bullets"
                    type="button"
                    onClick={() => handleMagicGeneration("bullets")}
                    className={`py-2 px-1 text-[10px] font-bold tracking-wider rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                      magicStyle === "bullets" && magicOutput
                        ? "bg-purple-600/20 border-purple-500 text-purple-200"
                        : "bg-[#191d24] border-[#252c38] hover:border-purple-600/50"
                    }`}
                  >
                    <span className="text-base">⚡</span>
                    <span>Tópicos</span>
                  </button>
                </div>

                {/* AI Result Terminal Area */}
                <div className="min-h-[160px] bg-[#0c0d12] border border-[#212733] rounded-xl p-3 text-xs leading-relaxed overflow-y-auto text-gray-300">
                  {magicLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-purple-400 font-mono animate-pulse">Consultando APIs do DigaBot...</p>
                    </div>
                  ) : magicOutput ? (
                    <div className="whitespace-pre-line text-[11.5px] leading-relaxed">
                      <div className="text-[9px] font-mono text-purple-400 uppercase tracking-widest border-b border-purple-950 pb-1 mb-2 flex items-center justify-between font-bold">
                        <span>Conjuração {magicStyle === "geek" ? "Meme" : magicStyle === "debate" ? "Debate" : "Tópicos"}</span>
                        <Radio className="w-2.5 h-2.5 animate-pulse text-purple-400" />
                      </div>
                      {magicOutput}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-10 flex flex-col items-center gap-1 animate-none">
                      <span className="text-xl">🔮</span>
                      <p className="font-semibold text-gray-400 text-xs">Aguardando Conjuração</p>
                      <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto leading-relaxed mt-1">Selecione um estilo acima para decodificar esta notícia com a inteligência do DigaBot!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 p-4">
                <Radio className="w-8 h-8 text-gray-700 mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-gray-400">Nenhuma Notícia Disponível</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Prompts when in chat */}
      {activeTab === "chat" && messages.length <= 2 && (
        <div className="px-4 py-2 bg-[#0c0d12]/60 border-t border-[#1a1f27] space-y-1.5 shrink-0">
          <p className="text-[9px] font-extrabold font-mono text-gray-500 flex items-center gap-1">⚡ SUGESTÕES RÁPIDAS:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              ...(chatContextArticle ? [`Resuma o artigo "${chatContextArticle.title.slice(0,18)}..."`, "O que você acha disso?"] : []),
              "Qual o anime mais hypado de 2026?",
              "Diga 3 curiosidades sobre GTA 6",
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                id={`suggested-prompt-${idx}`}
                onClick={() => sendSuggestedMessage(p)}
                className="text-[10px] bg-[#1a1e27] hover:bg-cyan-950/40 border border-[#2b3341] hover:border-cyan-800/60 rounded-full px-2.5 py-1 text-gray-300 transition-colors text-left truncate max-w-full font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box for chat */}
      {activeTab === "chat" && (
        <form 
          onSubmit={handleSendMessage}
          className="p-3 border-t border-[#242b35] bg-[#111317] flex gap-2 items-center shrink-0"
        >
          <input
            id="bot-input-field"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Pergunte ao DigaBot ou comente..."
            className="flex-1 bg-[#191d24] text-xs py-2 px-3 rounded-lg border border-[#252c38] focus:border-cyan-500 focus:outline-none transition-colors text-white"
          />
          <button
            id="send-bot-msg-btn"
            type="submit"
            disabled={!userInput.trim() || loading}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-cyan-600"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
