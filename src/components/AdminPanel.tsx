import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Plus, Sparkles, Image, User, Layout, Eye, HelpCircle, FileText, X } from "lucide-react";
import { Article } from "../data";

interface AdminPanelProps {
  onAddArticle: (article: Article) => void;
  onClose: () => void;
}

export default function AdminPanel({ onAddArticle, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Article creation form states
  const [category, setCategory] = useState<Article["category"]>("games");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState<number>(9.0);

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
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const defaultImagesByCat = {
      games: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      filmes: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      series: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      animes: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      quadrinhos: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&w=800&q=80"
    };

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
      comments: []
    };

    onAddArticle(newArt);
    alert("🚀 Matéria publicada e sintonizada com sucesso no feed principal!");
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setAuthor("");
    setImageUrl("");
    setRating(9.0);
    setAiDraftPrompt("");
  };

  // Helper to extract JSON from markdown or arbitrary strings reliably
  const extractJSON = (text: string) => {
    try {
      // Find JSON block first
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = text.match(jsonBlockRegex);
      const stringToParse = match ? match[1] : text;
      
      // Clean up common issues
      const cleanText = stringToParse
        .trim()
        .replace(/^[^{]*/, "") // Remove everything up to the first {
        .replace(/[^}]*$/, ""); // Remove everything after the last }
        
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
      } else {
        alert("O mentor mental de IA está indisponível para rascunhos rápidos.");
      }
    } catch {
      alert("Falha com a conexão sintonizadora de rascunhos do Gemini.");
    } finally {
      setGeneratingWithAi(false);
    }
  };

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
              <p className="text-[10px] text-rose-450 font-mono text-center">❌ {loginError}</p>
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
        className="bg-[#0f1115] border-2 border-cyan-500/20 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header styling */}
        <div className="p-5 border-b border-white/10 bg-[#14181f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-cyan-500 text-black font-black px-2 py-0.5 rounded uppercase tracking-wider">ADM PRIVADO</span>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">Adicionar matéria e Furo de Notícia</h3>
          </div>
          <button 
            id="admin-form-close-btn"
            onClick={onClose} 
            className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* AI Drafting Feature */}
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
                placeholder="Ex fora da curva: Vazamento do Switch 2 com IA integrada em Zelda"
                value={aiDraftPrompt}
                onChange={(e) => setAiDraftPrompt(e.target.value)}
                className="bg-slate-900 border border-purple-900/40 text-xs px-3 py-2 text-white placeholder-slate-600 rounded-lg flex-1 focus:outline-none focus:border-purple-400"
              />
              <button
                id="ai-draft-generation-btn"
                onClick={handleAiDraftGenerator}
                disabled={generatingWithAi || !aiDraftPrompt.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg shrink-0 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generatingWithAi ? "Escrevendo..." : "Escrever com IA"}
              </button>
            </div>
          </div>

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
                          
                          // Use dynamic Unsplash featured search query endpoint with keyword query params
                          const customUrl = `https://images.unsplash.com/featured/1200x675/?${query}&sig=${randomId}`;
                          setImageUrl(customUrl);
                          alert(`✨ IA escolheu e integrou o tema de capa: "${parsed.description || parsed.keywords}"`);
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
                    className="text-[10px] font-extrabold uppercase text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all disabled:opacity-50"
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
                  className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                />
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
                          // Fallback
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                        <Image className="w-6 h-6 stroke-[1.5]" />
                        <span className="text-[10px] font-mono">Nenhuma imagem carregada</span>
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
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-white font-extrabold text-xs uppercase rounded-lg"
                >
                  Limpar
                </button>
                <button
                  id="publish-news-to-feed-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase rounded-lg tracking-wider transition-all shadow-md active:scale-[0.98]"
                >
                  🚀 Publicar Furo de Notícia !
                </button>
              </div>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}
