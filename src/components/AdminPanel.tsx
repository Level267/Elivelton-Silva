import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Image, 
  User, 
  Layout, 
  Eye, 
  HelpCircle, 
  FileText, 
  X,
  Search,
  Trash2,
  Edit2,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import { Article } from "../data";

interface AdminPanelProps {
  articles: Article[];
  onAddArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onClose: () => void;
}

export default function AdminPanel({ 
  articles, 
  onAddArticle, 
  onUpdateArticle, 
  onDeleteArticle, 
  onClose 
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tabs for backoffice: "manage" (list and edit/delete) or "write" (create/update form)
  const [activeTab, setActiveTab] = useState<"manage" | "write">("manage");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [manageSearchTerm, setManageSearchTerm] = useState("");

  // Toast / Custom alert notifications state
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  // Custom confirmation modal state for deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; title: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) => current?.message === message ? null : current);
    }, 4000);
  };

  // Article creation/editing form states
  const [category, setCategory] = useState<Article["category"]>("games");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState<number>(9.0);
  const [videoUrl, setVideoUrl] = useState("");

  // IA helper states
  const [aiDraftPrompt, setAiDraftPrompt] = useState("");
  const [generatingWithAi, setGeneratingWithAi] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "admin" || password === "1234") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Senha incorreta! Use 'admin' ou '1234' para simular.");
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim() || !author.trim()) {
      showToast("Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    const defaultImagesByCat = {
      games: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      filmes: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      series: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      animes: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      quadrinhos: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&w=800&q=80",
      podcast: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"
    };

    if (editingArticleId) {
      // Find original values to keep likes, comments, views
      const original = articles.find(art => art.id === editingArticleId);
      const updatedArt: Article = {
        ...original,
        id: editingArticleId,
        category,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim(),
        readTime: `${Math.max(1, Math.round(content.split(" ").length / 150))} min`,
        imageUrl: imageUrl.trim() || (original?.imageUrl || defaultImagesByCat[category]),
        rating: rating,
        videoUrl: videoUrl.trim() || undefined
      } as Article;

      onUpdateArticle(updatedArt);
      showToast("Matéria atualizada com sucesso!", "success");
      resetForm();
      setEditingArticleId(null);
      setActiveTab("manage");
    } else {
      const newArt: Article = {
        id: "art-user-" + Date.now().toString(),
        category,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim(),
        date: "Hoje mesmo",
        readTime: `${Math.max(1, Math.round(content.split(" ").length / 150))} min`,
        imageUrl: imageUrl.trim() || defaultImagesByCat[category],
        views: 12,
        likes: 1,
        rating: rating,
        comments: [],
        videoUrl: videoUrl.trim() || undefined
      };

      onAddArticle(newArt);
      showToast("Matéria publicada com sucesso!", "success");
      resetForm();
      setActiveTab("manage");
    }
  };

  const startEditing = (art: Article) => {
    setEditingArticleId(art.id);
    setCategory(art.category);
    setTitle(art.title);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setAuthor(art.author);
    setImageUrl(art.imageUrl || "");
    setRating(art.rating || 9.0);
    setVideoUrl(art.videoUrl || "");
    setActiveTab("write");
  };

  const cancelFormOrEditing = () => {
    resetForm();
    setEditingArticleId(null);
    setActiveTab("manage");
  };

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setAuthor("");
    setImageUrl("");
    setRating(9.0);
    setVideoUrl("");
    setAiDraftPrompt("");
  };

  // Helper to extract JSON from markdown or arbitrary strings reliably
  const extractJSON = (text: string) => {
    try {
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = text.match(jsonBlockRegex);
      const stringToParse = match ? match[1] : text;
      
      const cleanText = stringToParse
        .trim()
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "");
        
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parsing failed", e, text);
      throw e;
    }
  };

  // Option to automate story draft generation using Gemini
  const handleAiDraftGenerator = async () => {
    if (!aiDraftPrompt.trim()) return;
    setGeneratingWithAi(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Com base nesta ideia original: "${aiDraftPrompt}", gere uma matéria com um tom altamente profissional, jornalístico, sério, informativo e imparcial, de acordo com o padrão de grandes portais de tecnologia e entretenimento (como IGN, G1, Tecnoblog ou Meio Bit). Evite gírias informais ou brincadeiras bobas. Foque na clareza informativa dos fatos apresentados.
              Retorne um objeto JSON no formato abaixo. Certifique-se de retornar APENAS o JSON válido:
              {
                "title": "Um título jornalístico, informativo, claro e de forte impacto técnico ou editorial",
                "excerpt": "Um subtítulo de apoio sucinto e profissional (linha fina) que resume as principais conclusões",
                "content": "A reportagem completa e bem estruturada, dividida formalmente em parágrafos de análise técnica e jornalística profunda",
                "author": "Nome de um jornalista profissional independente ou Redação DigaNews"
              }`
            }
          ]
        })
      });

      const data = await response.json();
      if (response.ok) {
        const parsed = extractJSON(data.reply);
        setTitle(parsed.title || "");
        setExcerpt(parsed.excerpt || "");
        setContent(parsed.content || "");
        setAuthor(parsed.author || "Redação DigaNews");
        showToast("Rascunho gerado com sucesso pela IA!", "success");
      } else {
        showToast("Roteiro indisponível no momento.", "error");
      }
    } catch {
      showToast("Falha ao comunicar com o sintonizador do Gemini.", "error");
    } finally {
      setGeneratingWithAi(false);
    }
  };

  const filteredManageArticles = articles.filter(art => 
    art.title.toLowerCase().includes(manageSearchTerm.toLowerCase()) ||
    art.author.toLowerCase().includes(manageSearchTerm.toLowerCase()) ||
    art.category.toLowerCase().includes(manageSearchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#12141a] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative"
        >
          <button 
            id="close-admin-login-btn"
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold uppercase tracking-widest text-white">Console da Redação (ADM)</h3>
            <p className="text-xs text-slate-400 mt-1">Apenas editores sintonizados podem registrar novos furos.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Senha de Acesso</label>
              <input
                id="admin-passcode-input"
                type="password"
                placeholder="Insira 'admin' ou '1234'"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1b1e26] border border-white/15 focus:border-cyan-400 rounded-lg text-xs py-2.5 px-3 text-white focus:outline-none"
                required
              />
            </div>

            {loginError && (
              <p className="text-[10px] text-rose-500 font-mono text-center">❌ {loginError}</p>
            )}

            <button
              id="submit-admin-login-btn"
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase rounded-lg tracking-wider transition-colors"
            >
              Liberar Painel
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 lg:p-10 z-50 overflow-y-auto backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f1115] border-2 border-cyan-500/20 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
      >
        {/* Floating Custom Toast Notification */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-55 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-[#12141c] shadow-2xl">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              {notification.type === "success" ? "👾" : "⚠️"} {notification.message}
            </span>
            <button 
              onClick={() => setNotification(null)}
              className="p-0.5 hover:bg-white/10 rounded ml-2 text-slate-455 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Custom Delete Confirmation Modal Overlay */}
        {deleteConfirmId && (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#12141a] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="text-center">
                <span className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 mb-3">
                  <Trash2 className="w-6 h-6" />
                </span>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">Excluir Matéria?</h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Deseja mesmo sintonizar fora a matéria <span className="text-white font-semibold">"{deleteConfirmId.title}"</span>? Esta ação de exclusão é definitiva.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteArticle(deleteConfirmId.id);
                    setDeleteConfirmId(null);
                    showToast("Matéria deletada do feed principal!", "success");
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header styling */}
        <div className="p-5 border-b border-white/10 bg-[#14181f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-cyan-500 text-black font-black px-2 py-0.5 rounded uppercase tracking-wider">ADM PRIVADO</span>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">Mesa de Redação & Backoffice</h3>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* View Switch Toggles */}
            <button
              type="button"
              onClick={() => { setActiveTab("manage"); setEditingArticleId(null); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                activeTab === "manage" 
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400" 
                  : "bg-slate-900 text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              📋 Gerenciar Matérias
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("write"); resetForm(); setEditingArticleId(null); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                activeTab === "write" && !editingArticleId
                  ? "bg-cyan-500 text-black font-black" 
                  : "bg-slate-900 text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              ➕ Escrever Nova
            </button>

            <button 
              id="admin-form-close-btn"
              onClick={onClose} 
              className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors ml-auto sm:ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === "manage" ? (
            <div className="space-y-6">
              {/* Manage Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13151a] p-4 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Todas as Matérias Sintonizadas ({articles.length})</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Clique em editar para modificar o texto ou apague matérias do rodapé.</p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por título ou autor..."
                    value={manageSearchTerm}
                    onChange={(e) => setManageSearchTerm(e.target.value)}
                    className="w-full bg-[#1b1e26] border border-white/10 rounded-lg text-[11px] py-1.5 pl-8 pr-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/30 font-mono"
                  />
                </div>
              </div>

              {/* Articles Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredManageArticles.length > 0 ? (
                  filteredManageArticles.map((art) => (
                    <div 
                      key={art.id} 
                      className="bg-[#12141c] border border-white/5 hover:border-cyan-500/20 rounded-xl p-3.5 flex gap-4 transition-all hover:bg-[#151821]"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                        <img 
                          src={art.imageUrl} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                      </div>

                      {/* Info and Actions */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase mb-1">
                            <span className="text-cyan-400">{art.category}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">★ {art.rating?.toFixed(1) || "10"}</span>
                          </div>
                          
                          <h5 className="text-xs font-extrabold text-white line-clamp-1 leading-snug">{art.title}</h5>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Por {art.author}</p>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex gap-2 pt-2.5">
                          <button
                            type="button"
                            onClick={() => startEditing(art)}
                            className="flex-1 py-1 px-2.5 bg-[#1b1c23] hover:bg-cyan-500 hover:text-black border border-white/5 rounded-lg text-[10px] font-bold text-cyan-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmId({ id: art.id, title: art.title });
                            }}
                            className="py-1 px-2.5 bg-rose-950/20 hover:bg-rose-600 text-rose-450 hover:text-white border border-rose-900/30 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Apagar matéria"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#13151a]">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-mono">Nenhuma matéria encontrada na busca.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back to list or Editor State */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 bg-[#111218] p-3 rounded-xl border">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelFormOrEditing}
                    className="p-1 px-2 rounded bg-slate-900 text-slate-400 hover:text-white text-[10px] font-mono border border-white/5 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Voltar pro Gerenciamento
                  </button>
                  <span className="text-slate-600">/</span>
                  <span className="text-xs font-mono font-bold uppercase tracking-tight text-cyan-400">
                    {editingArticleId ? "📝 Modo de Edição Ativo" : "➕ Escrever Nova Matéria"}
                  </span>
                </div>

                {editingArticleId && (
                  <span className="text-[9px] font-mono uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-black">
                    Editando ID: {editingArticleId}
                  </span>
                )}
              </div>

              {/* AI Drafting Feature (Disabled in edit mode to preserve original content stream or optionally allowed) */}
              {!editingArticleId && (
                <div className="p-4 bg-purple-950/20 border border-purple-500/25 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    Rascunho Rápido de Matéria com IA (Opcional)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Diga o assunto rápido e de forma simples. O Gemini escreverá uma matéria inteira com título, resumo chamativo e corpo de reportagem!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="ai-draft-guideline-input"
                      type="text"
                      placeholder="Ex: Vazamento do Switch 2 com IA integrada em Zelda"
                      value={aiDraftPrompt}
                      onChange={(e) => setAiDraftPrompt(e.target.value)}
                      className="bg-slate-900 border border-purple-900/40 text-xs px-3 py-2 text-white placeholder-slate-600 rounded-lg flex-1 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      id="ai-draft-generation-btn"
                      onClick={handleAiDraftGenerator}
                      disabled={generatingWithAi || !aiDraftPrompt.trim()}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {generatingWithAi ? "Escrevendo..." : "Escrever com IA"}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Categoria da Seção</label>
                    <select
                      id="new-article-cat-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    >
                      <option value="games">💻 Games</option>
                      <option value="filmes">🎬 Filmes</option>
                      <option value="series">📺 Séries</option>
                      <option value="animes">🍥 Animes</option>
                      <option value="quadrinhos">📚 Quadrinhos</option>
                      <option value="podcast">🎙️ Podcast</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Título Principal</label>
                    <input
                      id="new-article-title-input"
                      type="text"
                      placeholder="Incrível furo do século"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Resumo da Chamada (Excerpt)</label>
                    <textarea
                      id="new-article-excerpt-input"
                      placeholder="Subtítulo chamativo de 1-2 linhas para o feed"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400 h-16 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Autor</label>
                      <input
                        id="new-article-author-input"
                        type="text"
                        placeholder="Seu Nome Geek"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Nota da Avaliação (Padrão: 9.0)</label>
                      <input
                        id="new-article-rating-input"
                        type="number"
                        step="0.1"
                        min="1"
                        max="10"
                        placeholder="9.0"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value) || 9.0)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Link da Imagem de Capa (Opcional)</label>
                      <button
                        id="ai-generate-cover-btn"
                        type="button"
                        disabled={!title.trim() || generatingWithAi}
                        onClick={async () => {
                          if (!title.trim()) return;
                          setGeneratingWithAi(true);
                          try {
                            const response = await fetch("/api/gemini/chat", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                messages: [
                                  {
                                    role: "user",
                                    content: `Com base em uma matéria de portal de notícias geek chamada: "${title}", selecione 4 termos ou palavras-chave em inglês perfeitos para buscar uma imagem fotorrealista de alta qualidade no Unsplash.
                                    Retorne APENAS um objeto JSON válido, sem usar formatação de bloco de código markdown ou crases (JSON puro) no formato exato:
                                    { "keywords": "cyberpunk city neon", "description": "Uma breve descrição da imagem sugerida" }`
                                  }
                                ]
                              })
                            });

                            const data = await response.json();
                            if (response.ok) {
                              const parsed = extractJSON(data.reply);
                              const query = encodeURIComponent(parsed.keywords || "geek,technology");
                              const randomId = Math.floor(Math.random() * 1000) + 1;
                              
                              const customUrl = `https://images.unsplash.com/featured/1200x675/?${query}&sig=${randomId}`;
                              setImageUrl(customUrl);
                              showToast(`Capa IA selecionada: ${parsed.description || parsed.keywords}`, "success");
                            } else {
                              setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80&sig=${Date.now()}`);
                            }
                          } catch (err) {
                            console.error("Cover image generation error", err);
                            setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80&sig=${Date.now()}`);
                          } finally {
                            setGeneratingWithAi(false);
                          }
                        }}
                        className="text-[10px] font-extrabold uppercase text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Gerar Capa por IA
                      </button>
                    </div>
                    <input
                      id="new-article-cover-input"
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  {/* YouTube Embed Link input */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-[#ff3333] font-bold">
                        📺 Código/Link do YouTube (Opcional)
                      </label>
                      <span className="text-[8px] text-slate-500 font-mono">Para Podcasts e Vídeos</span>
                    </div>
                    <input
                      id="new-article-youtube-input"
                      type="text"
                      placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-red-500/10 rounded-lg text-xs py-2 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                    />
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Adicione o link do seu podcast do YouTube. Ele será sintonizado no reprodutor multimídia interativo!
                    </p>
                  </div>
                </div>

                {/* Right Side: Full Body and Live Preview */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5 flex flex-col flex-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Conteúdo Completo</label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {content.split(/\s+/).filter(Boolean).length} palavras | ~{Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 150))} min de leitura
                      </span>
                    </div>
                    <textarea
                      id="new-article-body-textarea"
                      placeholder="Escreva a matéria com todos os parágrafos e detalhes da notícia..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400 flex-1 min-h-[120px]"
                      required
                    />
                  </div>

                  {/* Dynamic Live Preview Card */}
                  <div className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-3">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      Visualização da Matéria em Tempo Real
                    </h4>
                    
                    <div className="bg-[#12141c] border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
                      <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=850&q=80";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                            <Image className="w-6 h-6 stroke-[1.5]" />
                            <span className="text-[10px] font-mono font-bold">Nenhuma imagem carregada</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500 rounded text-[9px] font-black text-black uppercase tracking-wider">
                          {category}
                        </div>
                        {rating && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#0f1115]/90 border border-yellow-500/30 rounded text-yellow-400 text-[10px] font-bold">
                            ★ {rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3.5 space-y-1.5">
                        <h5 className="text-xs font-bold text-white line-clamp-1">
                          {title || "Sem título definido"}
                        </h5>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {excerpt || "Defina um resumo marcante de introdução para o seu leitor."}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-cyan-400" /> Por {author || "Autor Anônimo"}
                          </span>
                          <span>Hoje • {Math.max(1, Math.round(content.split(" ").length / 150))} min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      id="discard-inputs-btn"
                      type="button"
                      onClick={cancelFormOrEditing}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-white font-extrabold text-xs uppercase rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      id="publish-news-to-feed-btn"
                      type="submit"
                      className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase rounded-lg tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      {editingArticleId ? "✏️ Salvar Alterações" : "🚀 Publicar Furo de Notícia !"}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
