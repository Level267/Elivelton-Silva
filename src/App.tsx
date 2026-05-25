import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, 
  Film, 
  Tv, 
  BookOpen, 
  Layers, 
  Flame, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Cpu, 
  Sparkles, 
  Search, 
  Bot, 
  TrendingUp, 
  Calendar, 
  Send,
  Plus,
  Compass,
  Mic,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Bookmark,
  Share2,
  SlidersHorizontal,
  Volume2,
  Play,
  Pause,
  Square,
  Gift,
  Award,
  Youtube,
  Instagram,
  Music,
  Globe,
  Check,
  Edit,
  Video,
  Trash2
} from "lucide-react";
import { INITIAL_ARTICLES, RELEASES_CALENDAR, Article } from "./data";
import QuizGame from "./components/QuizGame";
import AIBox from "./components/AIBox";
import ExtraFeatures from "./components/ExtraFeatures";
import AdminPanel from "./components/AdminPanel";
import NewsletterClub from "./components/NewsletterClub";

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function App() {
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem("diganews_articles");
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  React.useEffect(() => {
    localStorage.setItem("diganews_articles", JSON.stringify(articles));
  }, [articles]);

  // Sync simultaneous sintonizador articles at startup
  React.useEffect(() => {
    let active = true;
    fetch("/api/articles")
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(data => {
        if (active && Array.isArray(data) && data.length > 0) {
          setArticles(data);
          setActiveArticle(prev => {
            const stillExists = data.find(art => art.id === prev.id);
            return stillExists || data[0];
          });
        }
      })
      .catch(err => {
        console.warn("Relying on offline/local storage fallback for articles.", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeArticle, setActiveArticle] = useState<Article>(() => {
    try {
      const saved = localStorage.getItem("diganews_articles");
      const parsed = saved ? JSON.parse(saved) : INITIAL_ARTICLES;
      return parsed[0] || INITIAL_ARTICLES[0];
    } catch {
      return INITIAL_ARTICLES[0];
    }
  });
  const [releases, setReleases] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("diganews_releases");
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Sync any default items with their updated values from RELEASES_CALENDAR
        const synced = parsed.map((item: any) => {
          const original = RELEASES_CALENDAR.find((r) => r.id === item.id);
          if (original) {
            return {
              ...item,
              title: original.title,
              category: original.category,
              releaseDate: original.releaseDate,
              platformOrWhere: original.platformOrWhere,
              imageUrl: original.imageUrl,
              hypeCount: Math.max(item.hypeCount || 0, original.hypeCount || 0)
            };
          }
          return item;
        });

        const syncedIds = new Set(synced.map((item: any) => item.id));
        // Add default releases that don't exist yet in the user's localStorage
        const missingFromInitial = RELEASES_CALENDAR.filter(item => !syncedIds.has(item.id));
        return [...synced, ...missingFromInitial];
      }
      return RELEASES_CALENDAR;
    } catch {
      return RELEASES_CALENDAR;
    }
  });

  React.useEffect(() => {
    localStorage.setItem("diganews_releases", JSON.stringify(releases));
  }, [releases]);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Immersive reading mode toggle
  const [isReadingArticle, setIsReadingArticle] = useState(false);

  // Pagination state and page limit constant
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Open article in focused reading mode & scroll up smoothly
  const handleOpenArticle = (art: Article) => {
    setActiveArticle(art);
    setIsReadingArticle(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset pagination & close read mode on active filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
    setIsReadingArticle(false);
  }, [selectedCategory, searchTerm]);
  
  // Comments state for currently selected article
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // Bookmarks persistence state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("diganews_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem("diganews_bookmarks", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  // Reading customize states
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base");
  const [readingTheme, setReadingTheme] = useState<"dark" | "sepia" | "terminal">("dark");

  // Share dialog state
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Social Links State with localStorage persistence
  const [socialLinks, setSocialLinks] = useState(() => {
    const defaultSocials = {
      youtube: "https://www.youtube.com/@Digaac%C3%A3o",
      instagram: "https://www.instagram.com/digaacao.podcast?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      tiktok: "https://www.tiktok.com/@digaacao.podcast?is_from_webapp=1&sender_device=pc",
      spotify: "https://open.spotify.com/show/6VuajYlMFBOurqejVpNKcO?si=5b1084e6295440e1"
    };

    try {
      const saved = localStorage.getItem("diganews_socials");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.twitter && !parsed.tiktok) {
          parsed.tiktok = parsed.twitter.replace("twitter.com", "tiktok.com/@");
          delete parsed.twitter;
        }
        // Force upgrade if using old default domain placeholders
        if (
          parsed &&
          (parsed.instagram?.includes("diganews") ||
            parsed.youtube?.includes("dQw4w9WgXcQ") ||
            parsed.tiktok?.includes("diganews") ||
            parsed.spotify === "https://open.spotify.com")
        ) {
          return defaultSocials;
        }
        return parsed || defaultSocials;
      }
      return defaultSocials;
    } catch {
      return defaultSocials;
    }
  });

  const handleUpdateSocialLinks = (newSocials: typeof socialLinks) => {
    setSocialLinks(newSocials);
    localStorage.setItem("diganews_socials", JSON.stringify(newSocials));
  };

  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [tempSocials, setTempSocials] = useState(socialLinks);

  const handleStartEditingSocials = () => {
    setTempSocials(socialLinks);
    setIsEditingSocials(true);
  };

  const handleSaveSocials = () => {
    handleUpdateSocialLinks(tempSocials);
    setIsEditingSocials(false);
  };

  const handleCopyShareLink = (art: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?article=${art.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(art.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Detect shared article on mount
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get("article");
      if (sharedId) {
        const found = articles.find(art => art.id === sharedId);
        if (found) {
          handleOpenArticle(found);
        }
      }
    } catch (err) {}
  }, []);

  // AI panel visibility state
  const [isAiOpen, setIsAiOpen] = useState(true);

  // Admin Panel modal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Hidden admin access from URL parameters (?admin=true)
  const [showAdminButton, setShowAdminButton] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("admin") === "true";
    } catch {
      return false;
    }
  });

  // Hotkey listener: Ctrl + Shift + A to open Admin Panel secretly
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handler to publish a new article from Admin panel
  const handleAddNewArticle = async (newArt: Article) => {
    setArticles(prev => [newArt, ...prev]);
    setActiveArticle(newArt);
    setIsReadingArticle(true);
    try {
      await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArt)
      });
    } catch (err) {
      console.error("Failed to sync new article in real time:", err);
    }
  };

  // Handler to edit/update an existing article from Admin panel
  const handleUpdateArticle = async (updatedArt: Article) => {
    setArticles(prev => prev.map(art => art.id === updatedArt.id ? updatedArt : art));
    if (activeArticle.id === updatedArt.id) {
      setActiveArticle(updatedArt);
    }
    try {
      await fetch(`/api/articles/${updatedArt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedArt)
      });
    } catch (err) {
      console.error("Failed to sync edited article in real time:", err);
    }
  };

  // Handler to delete an article from Admin panel
  const handleDeleteArticle = async (id: string) => {
    setArticles(prev => {
      const updated = prev.filter(art => art.id !== id);
      if (activeArticle.id === id) {
        if (updated.length > 0) {
          setActiveArticle(updated[0]);
        } else {
          setActiveArticle(INITIAL_ARTICLES[0]);
          setIsReadingArticle(false);
        }
      }
      return updated;
    });
    try {
      await fetch(`/api/articles/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Failed to sync deleted article in real time:", err);
    }
  };

  // Helper to return to the home page or start of the website
  const handleGoHome = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setIsReadingArticle(false);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter articles by category & search term
  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === "all" || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get 3 related articles based on category and tags of the active article
  const getRelatedArticles = (currentArticle: Article): Article[] => {
    if (!currentArticle) return [];
    return articles
      .filter((art) => art.id !== currentArticle.id)
      .map((art) => {
        let score = 0;
        // High priority to category match
        if (art.category === currentArticle.category) {
          score += 5;
        }
        // Score based on tags intersection
        const currentTags = currentArticle.tags || [];
        const artTags = art.tags || [];
        if (currentTags.length > 0 && artTags.length > 0) {
          const commonTags = currentTags.filter(t => artTags.includes(t));
          score += commonTags.length * 3;
        }
        return { article: art, score };
      })
      .sort((a, b) => b.score - a.score || b.article.views - a.article.views)
      .slice(0, 3)
      .map((x) => x.article);
  };

  // Handle post liking
  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles(prev => prev.map(art => {
      if (art.id === id) {
        return { ...art, likes: art.likes + 1 };
      }
      return art;
    }));
    // Also update selected if it's the active one
    if (activeArticle.id === id) {
      setActiveArticle(prev => ({ ...prev, likes: prev.likes + 1 }));
    }
  };

  // Upvote release hype
  const handleHype = (id: string) => {
    setReleases(prev => prev.map(rel => {
      if (rel.id === id) {
        return { ...rel, hypeCount: rel.hypeCount + 1 };
      }
      return rel;
    }));
  };

  const handleDeleteRelease = (id: string) => {
    setReleases(prev => prev.filter(rel => rel.id !== id));
  };

  const handleUpdateRelease = (updatedRel: any) => {
    setReleases(prev => prev.map(rel => rel.id === updatedRel.id ? updatedRel : rel));
  };

  const handleResetReleases = () => {
    setReleases(RELEASES_CALENDAR);
  };

  // Submit comment to active article
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      username: newCommentName.trim(),
      avatar: ["👾", "🧝‍♂️", "🦸‍♂️", "🪚", "💀", "🎮"][Math.floor(Math.random() * 6)],
      text: newCommentText.trim(),
      time: "Agora mesmo"
    };

    setArticles(prev => prev.map(art => {
      if (art.id === activeArticle.id) {
        const updated = { ...art, comments: [newComment, ...art.comments] };
        return updated;
      }
      return art;
    }));

    setActiveArticle(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments]
    }));

    setNewCommentName("");
    setNewCommentText("");
  };

  // Helper function to return icon by category
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "games": return <Gamepad2 className="w-3.5 h-3.5" />;
      case "filmes": return <Film className="w-3.5 h-3.5" />;
      case "series": return <Tv className="w-3.5 h-3.5" />;
      case "animes": return <Layers className="w-3.5 h-3.5" />;
      case "quadrinhos": return <BookOpen className="w-3.5 h-3.5" />;
      case "podcast": return <Mic className="w-3.5 h-3.5" />;
      default: return <Compass className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "games": return "👾";
      case "filmes": return "🎬";
      case "series": return "📺";
      case "animes": return "💮";
      case "quadrinhos": return "📚";
      case "podcast": return "🎙️";
      default: return "🌟";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans flex flex-col antialiased">
      {/* Modern, Compact and Clean Top Navigation Bar */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 lg:px-8 py-2.5 border-b border-white/5 bg-[#0a0a0c]/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 w-full md:w-auto">
          {/* Logo */}
          <button
            id="logo-btn"
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95 transition-all text-left outline-none bg-transparent border-none p-0"
            title="Voltar para a página inicial"
          >
            <span className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">
              DIGANEWS
            </span>
            <span className="text-[8px] font-mono border border-cyan-500/30 text-cyan-400 font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide">
              GEEK
            </span>
          </button>

          {/* Navigation links & Filters */}
          <nav className="flex flex-wrap gap-1 items-center overflow-x-auto py-0.5">
            {[
              { id: "all", label: "Tudo" },
              { id: "games", label: "Games" },
              { id: "filmes", label: "Filmes" },
              { id: "series", label: "Séries" },
              { id: "animes", label: "Animes" },
              { id: "quadrinhos", label: "HQs" },
              { id: "podcast", label: "Podcast" }
            ].map(cat => (
              <button
                key={cat.id}
                id={`nav-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all flex items-center gap-1 border ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-md shadow-cyan-500/20"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {cat.id !== "all" && getCategoryIcon(cat.id)}
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Top bar search and status */}
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end">
          <div className="relative w-full sm:w-44 md:w-52">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-500" />
            <input
              id="search-articles-input"
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 text-[11px] border border-white/10 rounded-lg py-1 pl-8 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-all font-mono"
            />
          </div>

          {showAdminButton && (
            <button
              id="open-admin-panel-btn"
              onClick={() => setIsAdminOpen(true)}
              className="px-2.5 py-1 bg-slate-950 border border-red-500/20 text-red-400 hover:text-white hover:border-red-500 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
            >
              <ShieldCheck className="w-3 h-3" />
              Painel ADM
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
        
        {/* Left Side: Article list & Detail read view */}
        <main className="lg:col-span-8 p-4 lg:p-8 space-y-8 border-r border-white/10 w-full">
          
          <AnimatePresence mode="wait">
            {!isReadingArticle ? (
              <motion.div
                key="home-feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* 1. FEATURED BENTO GRID (Critical Hits Style - Destaques da Semana) */}
                <section className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#a855f7] flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    DESTAQUES DO PORTAL
                  </h3>
                  
                  {filteredArticles.length >= 3 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left: Giant main hero card (covers 2 cols) */}
                      <div 
                        id={`featured-card-0`}
                        onClick={() => handleOpenArticle(filteredArticles[0])}
                        className="md:col-span-2 relative h-80 sm:h-90 md:h-96 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl flex flex-col justify-end text-left"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent z-10" />
                        <img 
                          src={filteredArticles[0].imageUrl} 
                          alt={filteredArticles[0].title}
                          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                        />
                        <div className="p-4 sm:p-6 z-20 space-y-1.5 md:space-y-2">
                          <div className="flex gap-2">
                            <span className="px-2.5 py-0.5 bg-cyan-500 text-black font-extrabold text-[9px] uppercase tracking-tighter rounded">
                              {filteredArticles[0].category}
                            </span>
                            <span className="px-2 py-0.5 bg-red-650 text-white font-extrabold text-[9px] uppercase tracking-widest rounded">
                              ★ EM DESTAQUE
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white hover:text-cyan-300 leading-tight uppercase line-clamp-2">
                            {filteredArticles[0].title}
                          </h2>
                          <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                            {filteredArticles[0].excerpt}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono pt-1">
                            <span>Por {filteredArticles[0].author.split(" ")[0]}</span>
                            <span className="text-slate-600">•</span>
                            <span>{filteredArticles[0].date}</span>
                            <span className="text-slate-600">•</span>
                            <span>{filteredArticles[0].readTime} de leitura</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side stack: 2 smaller cards */}
                      <div className="flex flex-col gap-4">
                        {filteredArticles.slice(1, 3).map((art) => (
                          <div 
                            key={art.id}
                            id={`featured-card-sub-${art.id}`}
                            onClick={() => handleOpenArticle(art)}
                            className="relative h-[184px] rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-xl flex flex-col justify-end"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-transparent z-10" />
                            <img 
                              src={art.imageUrl} 
                              alt={art.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                            />
                            <div className="p-4 z-20 space-y-1.5">
                              <span className="px-2 py-0.5 bg-purple-650 text-white font-extrabold text-[8px] uppercase tracking-tighter rounded">
                                {art.category}
                              </span>
                              <h3 className="text-xs font-extrabold text-white group-hover:text-cyan-400 uppercase leading-snug line-clamp-2">
                                {art.title}
                              </h3>
                              <div className="text-[9px] text-slate-404 font-mono flex gap-2">
                                <span>Por {art.author.split(" ")[0]}</span>
                                <span>• {art.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : filteredArticles.length > 0 ? (
                    /* Fallback simpler hero when there's only 1 or 2 items matching search/filter */
                    <div 
                      id={`featured-card-fallback-${filteredArticles[0].id}`}
                      onClick={() => handleOpenArticle(filteredArticles[0])}
                      className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl flex flex-col justify-end"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/55 to-transparent z-10" />
                      <img 
                        src={filteredArticles[0].imageUrl} 
                        alt={filteredArticles[0].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      />
                      <div className="p-6 z-20 space-y-2">
                        <span className="px-2.5 py-0.5 bg-cyan-400 text-black font-extrabold text-[9px] uppercase tracking-tighter rounded">
                          {filteredArticles[0].category}
                        </span>
                        <h2 className="text-xl md:text-2xl font-black text-white hover:text-cyan-300 leading-tight uppercase line-clamp-2">
                          {filteredArticles[0].title}
                        </h2>
                        <p className="text-slate-300 text-xs line-clamp-2">
                          {filteredArticles[0].excerpt}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </section>

                {/* 2. CATEGORIZED NEWS FEED (Cards Grid with pagination - Critical Hits style) */}
                <section className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 id="feeds-title" className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Mais Matérias de {selectedCategory === "all" ? "Todas as Seções" : selectedCategory.toUpperCase()}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">Página {currentPage}</span>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12 font-mono">
                      🔍 Nenhuma notícia encontrada no setor solar especificado.
                    </p>
                  ) : (
                    <>
                      {/* Gorgeous styled grid of posts resembling Critical Hits */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {(() => {
                          const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                          const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
                          const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
                          const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
                          
                          return paginatedArticles.map((art) => (
                            <div
                              key={art.id}
                              id={`article-card-${art.id}`}
                              onClick={() => handleOpenArticle(art)}
                              className="group bg-[#0d0f14] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-950/20 hover:border-cyan-500/40 transition-all duration-300 flex flex-col cursor-pointer"
                            >
                              {/* Image section with relative float tags */}
                              <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-white/5">
                                <img 
                                  src={art.imageUrl} 
                                  alt={art.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                                />
                                <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-cyan-500 text-black font-extrabold text-[9px] uppercase tracking-wider rounded shadow-md">
                                  {art.category}
                                </div>
                                {art.rating && (
                                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#0f1115]/90 border border-yellow-500/30 rounded text-yellow-400 text-[10px] font-black shadow">
                                    ★ {art.rating.toFixed(1)}
                                  </div>
                                )}
                              </div>

                              {/* Info Content Section */}
                              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                                    <span>{art.date}</span>
                                    <span>•</span>
                                    <span>{art.readTime}</span>
                                  </div>
                                  <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase leading-snug line-clamp-2">
                                    {art.title}
                                  </h4>
                                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                                    {art.excerpt}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] md:text-xs">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-[9px] text-slate-300">
                                      {art.author[0]}
                                    </div>
                                    <span className="font-semibold text-slate-300 text-[11px]">{art.author}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      id={`like-mini-btn-${art.id}`}
                                      onClick={(e) => handleLike(art.id, e)}
                                      className="hover:text-cyan-400 text-slate-400 transition-colors flex items-center gap-1 font-mono text-[11px] bg-slate-900 border border-white/5 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                                    >
                                      👍 {art.likes}
                                    </button>

                                    <button
                                      id={`bookmark-mini-btn-${art.id}`}
                                      type="button"
                                      onClick={(e) => handleToggleBookmark(art.id, e)}
                                      className="hover:text-amber-400 text-slate-450 transition-colors flex items-center justify-center p-1.5 rounded bg-slate-900 border border-white/5 hover:bg-slate-800 cursor-pointer"
                                      title={bookmarkedIds.includes(art.id) ? "Remover dos marcadores" : "Salvar para ler depois"}
                                    >
                                      <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(art.id) ? "fill-amber-400 text-amber-400 animate-pulse" : "text-slate-400"}`} />
                                    </button>

                                    <div className="relative inline-block">
                                      <button
                                        id={`share-mini-btn-${art.id}`}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveShareId(activeShareId === art.id ? null : art.id);
                                        }}
                                        className="hover:text-cyan-400 text-slate-450 transition-colors flex items-center justify-center p-1.5 rounded bg-slate-900 border border-white/5 hover:bg-slate-800 cursor-pointer"
                                        title="Compartilhar matéria"
                                      >
                                        <Share2 className="w-3.5 h-3.5 text-slate-450" />
                                      </button>
                                      
                                      <AnimatePresence>
                                        {activeShareId === art.id && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                            className="absolute right-0 bottom-full mb-2 w-44 bg-[#0a0c10] border border-white/10 rounded-xl p-2.5 shadow-2xl z-25 space-y-1.5 text-left"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <p className="text-[8px] font-mono uppercase text-slate-500 border-b border-white/5 pb-1 font-bold">📡 COMPARTILHAR</p>
                                            
                                            <button
                                              type="button"
                                              onClick={(e) => handleCopyShareLink(art, e)}
                                              className="w-full text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5 hover:bg-white/5 p-1 px-1.5 rounded transition-all font-mono text-left cursor-pointer"
                                            >
                                              📋 {copiedId === art.id ? "Link Copiado! (✓)" : "Copiar Link"}
                                            </button>
                                            
                                            <a
                                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(art.title + " - DigaNews: " + window.location.origin + window.location.pathname + "?article=" + art.id)}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="w-full text-[10px] text-slate-350 hover:text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-950/20 p-1 px-1.5 rounded transition-all font-mono text-left cursor-pointer"
                                            >
                                              💬 WhatsApp
                                            </a>

                                            <a
                                              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + window.location.pathname + "?article=" + art.id)}&text=${encodeURIComponent(art.title)}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="w-full text-[10px] text-slate-350 hover:text-cyan-400 flex items-center gap-1.5 hover:bg-cyan-950/20 p-1 px-1.5 rounded transition-all font-mono text-left cursor-pointer"
                                            >
                                              ✈️ Telegram
                                            </a>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Pagination Controls */}
                      {(() => {
                        const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                        const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
                        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
                        if (totalPages <= 1) return null;

                        return (
                          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/10 gap-4 mt-2">
                            <div className="text-xs text-slate-400 font-mono">
                              Exibindo <span className="text-cyan-400 font-bold">{startIndex + 1}</span>-
                              <span className="text-cyan-400 font-bold">
                                {Math.min(startIndex + ITEMS_PER_PAGE, filteredArticles.length)}
                              </span>{" "}
                              de <span className="text-white font-bold">{filteredArticles.length}</span> matérias
                            </div>

                            <div className="flex items-center gap-1.5 self-center sm:self-auto">
                              <button
                                id="prev-page-btn"
                                type="button"
                                disabled={safeCurrentPage === 1}
                                onClick={() => {
                                  setCurrentPage(prev => Math.max(1, prev - 1));
                                  const el = document.getElementById("feeds-title");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="p-2 bg-slate-900 border border-white/10 rounded-lg hover:border-cyan-400/40 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-slate-400 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                const isActive = pageNum === safeCurrentPage;
                                return (
                                  <button
                                    key={pageNum}
                                    id={`page-btn-${pageNum}`}
                                    type="button"
                                    onClick={() => {
                                      setCurrentPage(pageNum);
                                      const el = document.getElementById("feeds-title");
                                      if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${
                                      isActive
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-650 text-white border-purple-400 shadow-md shadow-purple-600/20 scale-105"
                                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}

                              <button
                                id="next-page-btn"
                                type="button"
                                disabled={safeCurrentPage === totalPages}
                                onClick={() => {
                                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                  const el = document.getElementById("feeds-title");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="p-2 bg-slate-900 border border-white/10 rounded-lg hover:border-cyan-400/40 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-slate-400 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </section>

                {/* 3. INTERACTIVE QUIZ & ARENA GAMES ALWAYS VISIBLE ON HOME FEED */}
                <QuizGame />
                
                {/* 4. CLUB VIP NEWSLETTER SIGNUP */}
                <NewsletterClub />
                
                <ExtraFeatures 
                  activeArticle={activeArticle} 
                  releases={releases}
                  onHype={handleHype}
                  onAddRelease={(newRel) => setReleases(prev => [newRel, ...prev])}
                  onUpdateRelease={handleUpdateRelease}
                  onDeleteRelease={handleDeleteRelease}
                  onResetReleases={handleResetReleases}
                />
              </motion.div>
            ) : (
              <motion.div
                key="immersive-reader"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                {/* BACK BUTTON RETRO GLOW */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <button
                    id="back-to-home-feed-btn"
                    onClick={() => {
                      setIsReadingArticle(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/40 py-2 px-4 rounded-xl shadow-lg cursor-pointer animate-pulse"
                  >
                    ← VOLTAR PARA O PORTAL PRINCIPAL
                  </button>
                  <span className="text-[10px] font-mono uppercase bg-slate-950 px-2.5 py-1 border border-white/5 rounded-lg text-slate-400 hidden sm:inline">
                    MODO IMPRENSA ATIVO
                  </span>
                </div>

                {/* Cover Highlight section inside reading view */}
                <section className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 group min-h-[380px] md:min-h-[440px] flex flex-col justify-end">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-transparent z-10" />
                  <img 
                    src={activeArticle.imageUrl} 
                    alt={activeArticle.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                  />
                  
                  <div className="p-6 md:p-8 z-20 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-cyan-500 text-black font-extrabold text-[10px] uppercase tracking-tighter">
                        {activeArticle.category}
                      </span>
                      {activeArticle.rating && (
                        <span className="px-2.5 py-1 bg-purple-600 font-extrabold text-[10px] uppercase tracking-widest text-white rounded">
                          Avaliação: {activeArticle.rating} / 10
                        </span>
                      )}
                      <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {activeArticle.views} visualizações
                      </span>
                    </div>

                    <h2 className="text-xl md:text-3xl lg:text-4.5xl font-black leading-tight text-white uppercase max-w-3xl">
                      {activeArticle.title}
                    </h2>

                    <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed font-semibold">
                      {activeArticle.excerpt}
                    </p>

                    {/* Article Metadata and controls */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs border border-white/20">
                          {activeArticle.author[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{activeArticle.author}</p>
                          <p className="text-[10px] text-slate-400">{activeArticle.date} • {activeArticle.readTime} de leitura</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          id={`like-hero-btn-${activeArticle.id}`}
                          onClick={(e) => handleLike(activeArticle.id, e)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-extrabold text-xs uppercase flex items-center gap-1.5 transition-colors rounded-lg cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                          Curtir ({activeArticle.likes})
                        </button>

                        <button
                          id="invoke-summarize-magic-btn"
                          onClick={() => {
                            setIsAiOpen(true);
                            setTimeout(() => {
                              const actGeek = document.getElementById("action-geek");
                              if (actGeek) actGeek.click();
                            }, 100);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase flex items-center gap-1.5 transition-all rounded-lg shadow-lg shadow-purple-900/40 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                          Resumidor IA
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 📖 CENTRO DE EXPERIÊNCIA DE LEITURA CUSTOMIZÁVEL */}
                <div className="bg-[#121319] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Tamanho da Fonte */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono uppercase flex items-center gap-1 font-extrabold text-slate-500">
                        <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Tamanho do Texto
                      </p>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5">
                        {[
                          { id: "fs-base", value: "base", label: "A" },
                          { id: "fs-lg", value: "lg", label: "A+" },
                          { id: "fs-xl", value: "xl", label: "A++" }
                        ].map((btn) => (
                          <button
                            key={btn.value}
                            id={btn.id}
                            type="button"
                            onClick={() => setFontSize(btn.value as any)}
                            className={`w-8 h-7 text-xs font-black rounded-md flex items-center justify-center transition-all cursor-pointer ${
                              fontSize === btn.value
                                ? "bg-cyan-500 text-black font-black"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Paleta de Cores */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono uppercase flex items-center gap-1 font-extrabold text-slate-500">
                        🎨 Paleta de Fundo
                      </p>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5 gap-0.5">
                        {[
                          { id: "th-dark", value: "dark", bg: "bg-slate-900", label: "Escuro" },
                          { id: "th-sepia", value: "sepia", bg: "bg-amber-950/70", label: "Sépia" },
                          { id: "th-terminal", value: "terminal", bg: "bg-emerald-950/60", label: "Hacker" }
                        ].map((btn) => (
                          <button
                            key={btn.value}
                            id={btn.id}
                            type="button"
                            onClick={() => setReadingTheme(btn.value as any)}
                            className={`px-2 py-0.5 text-[9px] font-semibold rounded transition-all flex items-center gap-1 cursor-pointer ${
                              readingTheme === btn.value
                                ? "bg-purple-650 text-white font-extrabold"
                                : "text-slate-550 hover:text-slate-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${btn.bg}`} />
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive YouTube Embed Player for Podcast episodes */}
                {activeArticle.videoUrl && (
                  <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-4 md:p-6 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        </span>
                        <div>
                          <h4 className="text-xs font-mono font-black uppercase text-slate-300 tracking-wider">
                            Player de Transmissão do YouTube
                          </h4>
                          <p className="text-[9px] text-slate-500 font-mono">Assista ou escute o podcast integrado diretamente no portal</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#ff0000]/10 border border-[#ff0000]/30 text-[#ff0000] uppercase px-2 py-0.5 rounded animate-pulse">
                        • Sintonizado
                      </span>
                    </div>

                    {getYoutubeId(activeArticle.videoUrl) ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-black shadow-inner">
                        <iframe
                          src={`https://www.youtube.com/embed/${getYoutubeId(activeArticle.videoUrl)}?autoplay=0&rel=0`}
                          title={activeArticle.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 text-center">
                        <p className="text-xs text-slate-400">
                          Link externo de mídia sintonizado: <br />
                          <a
                            href={activeArticle.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono mt-1 inline-block"
                          >
                            {activeArticle.videoUrl} ↗
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed Full Content Area  */}
                <div className={`border rounded-2xl p-6 md:p-8 space-y-6 transition-all duration-350 ${
                  readingTheme === "dark" 
                    ? "bg-[#0f1013] border-white/10 text-slate-200" 
                    : readingTheme === "sepia" 
                      ? "bg-[#18120c] border-[#382618]/70 text-[#eae0cd]" 
                      : "bg-[#040804] border-[#103010]/70 text-[#22c55e]"
                }`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-2 ${
                    readingTheme === "dark" 
                      ? "text-cyan-400 border-white/5" 
                      : readingTheme === "sepia" 
                        ? "text-amber-500 border-amber-950/20" 
                        : "text-green-500 border-green-950/20"
                  }`}>
                    <span>📖</span> Matéria Completa
                  </h3>
                  <div className={`whitespace-pre-line leading-relaxed space-y-4 ${
                    fontSize === "base" 
                      ? "text-sm md:text-base" 
                      : fontSize === "lg" 
                        ? "text-base md:text-lg" 
                        : "text-lg md:text-xl font-medium"
                  } ${
                    readingTheme === "dark" 
                      ? "text-slate-350" 
                      : readingTheme === "sepia" 
                        ? "text-[#dfd5c2]" 
                        : "text-[#3ee671] font-mono"
                  }`}>
                    {activeArticle.content}
                  </div>

                  {/* Dynamic Comments System */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      Comentários ({activeArticle.comments.length})
                    </h4>

                    {/* Comment Form */}
                    <form onSubmit={handleAddComment} className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          id="comment-author-input"
                          type="text"
                          placeholder="Seu Apelido Geek (Ex: ObiWan99)"
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          className="bg-slate-900 text-xs py-2 px-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                          required
                        />
                      </div>
                      <div className="relative">
                        <textarea
                          id="comment-text-textarea"
                          placeholder="Deixe sua opinião gamer/nerd polêmica aqui!"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="w-full bg-slate-900 text-xs py-2 px-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 h-16 resize-none"
                          required
                        />
                        <button
                          id="submit-comment-btn"
                          type="submit"
                          className="absolute right-2.5 bottom-2.5 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Display Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {activeArticle.comments.map(c => (
                        <div key={c.id} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex gap-3 text-xs">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                            {c.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-cyan-400">{c.username}</span>
                              <span className="text-[10px] text-slate-500">{c.time}</span>
                            </div>
                            <p className="text-slate-350 mt-1">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Related Articles Suggestions */}
                <div className="bg-[#0f1013] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
                    <Sparkles className="w-4 h-4 text-cyan-450" /> Matérias Relacionadas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getRelatedArticles(activeArticle).map(art => (
                      <div
                        key={art.id}
                        id={`related-card-${art.id}`}
                        onClick={() => {
                          setActiveArticle(art);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group bg-[#07080a]/60 hover:bg-[#13151a] border border-white/5 hover:border-cyan-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full hover:shadow-[0_4px_25px_rgba(6,182,212,0.15)]"
                      >
                        <div className="relative h-28 overflow-hidden bg-slate-900 border-b border-white/5">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-cyan-500 text-black font-extrabold text-[8px] uppercase tracking-tighter rounded">
                            {art.category}
                          </span>
                        </div>
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 uppercase leading-snug line-clamp-2 transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {art.excerpt}
                            </p>
                          </div>
                          
                          {/* Mini Tags */}
                          {art.tags && art.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 pt-1.5 border-t border-white/5">
                              {art.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="bg-slate-950 text-slate-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[8px] font-mono text-slate-600 uppercase pt-1 px-1">
                              #geek
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Back Button below content too */}
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setIsReadingArticle(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono bg-[#0f1013] border border-white/5 hover:border-white/20 py-2.5 px-5 rounded-xl cursor-pointer"
                  >
                    ← Voltar ao Portal Principal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar: Releases and Reviews */}
        <div className="lg:col-span-4 flex flex-col bg-[#07080a]/20 space-y-px">

          {/* Top: Sintonize Nossas Redes (Creator's Social Media) */}
          <div className="p-6 border-b border-white/10 bg-[#0c0d10] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-[40px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-3.5 relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500 animate-[bounce_2s_infinite]" />
                Sintonize Nossas Redes
              </h3>
              
              {!isEditingSocials ? (
                <button
                  type="button"
                  onClick={handleStartEditingSocials}
                  className="p-1 text-slate-500 hover:text-cyan-400 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border border-white/5 hover:border-cyan-500/20 rounded bg-slate-900/50"
                  title="Editar links sociais"
                >
                  <Edit className="w-2.5 h-2.5" />
                  Editar
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingSocials(false)}
                    className="py-0.5 px-1.5 text-slate-400 hover:text-slate-250 text-[9px] font-mono border border-white/5 rounded cursor-pointer"
                  >
                    Excluir
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSocials}
                    className="py-0.5 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[9px] font-mono rounded font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-2.5 h-2.5" />
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {!isEditingSocials ? (
              <div className="space-y-2.5 relative z-10">
                <p className="text-[10px] text-slate-400 leading-normal mb-2">
                  Acompanhe os episódios completos do nosso Podcast e debates geeks sintonizados nas plataformas de streaming.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-red-500/20 hover:bg-red-950/5 transition-all group"
                  >
                    <span className="w-7 h-7 bg-red-600/10 border border-red-600/20 text-red-500 text-xs rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Youtube className="w-4 h-4 fill-red-500 text-red-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-white group-hover:text-red-400 transition-colors block uppercase tracking-tight">YouTube</span>
                      <span className="text-[8px] text-slate-500 font-mono block truncate">Podcasts & Vídeos</span>
                    </div>
                  </a>

                  <a
                    href={socialLinks.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-emerald-500/20 hover:bg-emerald-950/5 transition-all group"
                  >
                    <span className="w-7 h-7 bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 text-xs rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Music className="w-4 h-4 text-emerald-400" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-white group-hover:text-emerald-400 transition-colors block uppercase tracking-tight">Spotify</span>
                      <span className="text-[8px] text-slate-500 font-mono block truncate">Podcast RSS</span>
                    </div>
                  </a>

                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-pink-500/20 hover:bg-pink-950/5 transition-all group"
                  >
                    <span className="w-7 h-7 bg-pink-600/10 border border-pink-600/20 text-pink-400 text-xs rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Instagram className="w-4 h-4 text-pink-400" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-white group-hover:text-pink-400 transition-colors block uppercase tracking-tight">Instagram</span>
                      <span className="text-[8px] text-slate-500 font-mono block truncate">Bastidores Geek</span>
                    </div>
                  </a>

                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-purple-500/20 hover:bg-purple-950/5 transition-all group"
                  >
                    <span className="w-7 h-7 bg-purple-600/10 border border-purple-600/20 text-purple-400 text-xs rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Video className="w-4 h-4 text-purple-400" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-white group-hover:text-purple-400 transition-colors block uppercase tracking-tight">TikTok</span>
                      <span className="text-[8px] text-slate-500 font-mono block truncate">Cortes & Vídeos Curtos</span>
                    </div>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3 relative z-10 bg-slate-950/80 p-3.5 border border-white/5 rounded-xl">
                <span className="text-[9px] font-mono uppercase bg-slate-900 border border-white/10 text-cyan-400 px-1.5 py-0.5 rounded block text-center font-bold">
                  Painel de Configuração Rápida
                </span>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-mono uppercase text-slate-400 block mb-1">🔗 Canal do YouTube</label>
                    <input
                      type="text"
                      className="w-full bg-[#1b1c23] border border-white/10 text-[10px] rounded px-2 py-1 text-white focus:outline-none focus:border-red-500 font-mono text-zinc-100"
                      value={tempSocials.youtube}
                      onChange={(e) => setTempSocials({ ...tempSocials, youtube: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono uppercase text-slate-400 block mb-1">🔗 Feed do Spotify</label>
                    <input
                      type="text"
                      className="w-full bg-[#1b1c23] border border-white/10 text-[10px] rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500 font-mono text-zinc-100"
                      value={tempSocials.spotify}
                      onChange={(e) => setTempSocials({ ...tempSocials, spotify: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono uppercase text-slate-400 block mb-1">🔗 Perfil do Instagram</label>
                    <input
                      type="text"
                      className="w-full bg-[#1b1c23] border border-white/10 text-[10px] rounded px-2 py-1 text-white focus:outline-none focus:border-pink-500 font-mono text-zinc-100"
                      value={tempSocials.instagram}
                      onChange={(e) => setTempSocials({ ...tempSocials, instagram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono uppercase text-slate-400 block mb-1">🔗 Perfil do TikTok</label>
                    <input
                      type="text"
                      className="w-full bg-[#1b1c23] border border-white/10 text-[10px] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-400 font-mono text-zinc-100"
                      value={tempSocials.tiktok}
                      onChange={(e) => setTempSocials({ ...tempSocials, tiktok: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top: Bookmark and Read Later List */}
          <div className="p-6 border-b border-white/10 bg-[#0f0f12]">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                Matérias Marcadas ({bookmarkedIds.length})
              </span>
              {bookmarkedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBookmarkedIds([])}
                  className="text-[9px] font-mono text-slate-500 hover:text-rose-400 hover:underline cursor-pointer"
                >
                  Limpar Tudo
                </button>
              )}
            </h3>

            {bookmarkedIds.length === 0 ? (
              <div className="p-4 border border-dashed border-white/5 bg-[#07080a]/40 rounded-xl text-center">
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">
                  Nenhum marcador salvo.<br/>
                  Clique no ícone de marcador nas matérias para salvar e ler depois!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {articles.filter(art => bookmarkedIds.includes(art.id)).map(art => (
                  <div
                    key={art.id}
                    onClick={() => handleOpenArticle(art)}
                    className="group flex gap-2 items-center p-2 bg-[#12131a]/60 hover:bg-[#181926]/80 border border-white/5 hover:border-cyan-500/20 rounded-lg cursor-pointer transition-all"
                  >
                    <span className="text-xs shrink-0">
                      {art.category === "games" ? "🎮" : art.category === "filmes" ? "🎬" : art.category === "series" ? "📺" : "👾"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-300 group-hover:text-cyan-400 transition-colors uppercase truncate">
                        {art.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono">Por {art.author.split(" ")[0]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggleBookmark(art.id, e)}
                      className="text-slate-500 hover:text-rose-500 p-1 shrink-0 cursor-pointer"
                      title="Excluir"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Latest geek ratings (Reviews) */}
          <div className="p-6 border-b border-white/10 bg-[#0f0f12]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                DigaRatings & reviews
              </h3>
              <span className="text-[10px] text-cyan-400 font-bold underline cursor-default font-mono">2026</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center font-black text-lg text-white font-mono shrink-0 shadow-lg shadow-indigo-900/30">
                  9.8
                </div>
                <div>
                  <p className="text-[9px] uppercase font-extrabold text-[#7c3aed] tracking-wider">GTA VI Alpha</p>
                  <h4 className="text-xs font-bold leading-tight text-white hover:text-cyan-400 cursor-pointer">Inovadora mecânica de exploração marinha em Vice City.</h4>
                </div>
              </div>

              <div className="flex items-center gap-4 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <div className="w-11 h-11 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-lg text-black shrink-0 font-mono shadow-lg shadow-yellow-500/10">
                  9.2
                </div>
                <div>
                  <p className="text-[9px] uppercase font-extrabold text-yellow-500 tracking-wider">Senhor dos Anéis: Mortos</p>
                  <h4 className="text-xs font-bold leading-tight text-white hover:text-cyan-400 cursor-pointer">Uma atmosfera densa de fantasia sombria imersiva.</h4>
                </div>
              </div>

              <div className="flex items-center gap-4 p-2 bg-[#1b1c23]/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <div className="w-11 h-11 bg-rose-600 rounded-lg flex items-center justify-center font-black text-lg text-white shrink-0 font-mono shadow-lg shadow-rose-600/15">
                  9.6
                </div>
                <div>
                  <p className="text-[9px] uppercase font-extrabold text-rose-500 tracking-wider">Cyberpunk Live-Action</p>
                  <h4 className="text-xs font-bold leading-tight text-white hover:text-cyan-400 cursor-pointer">Fidelidade aos becos sujos e batida de synthwave.</h4>
                </div>
              </div>
            </div>
          </div>


        </div>

      </div>

      {/* Editorial Aesthetic Bottom News Ticker (Breaking News) */}
      <footer className="h-16 bg-[#13151a] border-t border-white/10 flex items-center px-4 lg:px-8 shrink-0 select-none z-10 overflow-hidden">
        <div className="bg-cyan-500 text-black px-3 py-1 font-black text-[10px] lg:text-xs uppercase mr-4 lg:mr-6 italic tracking-tighter shrink-0 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" /> ÚLTIMA HORA
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap text-xs text-slate-400 inline-block">
            {articles.map((art) => (
              <span key={art.id} className="inline-block px-10 border-r border-white/5 uppercase font-semibold">
                {getCategoryEmoji(art.category)} {art.title}
              </span>
            ))}
            {/* Duplication to ensure infinite smooth seamless looping animation */}
            {articles.map((art) => (
              <span key={`dup-${art.id}`} className="inline-block px-10 border-r border-white/5 uppercase font-semibold">
                {getCategoryEmoji(art.category)} {art.title}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden md:flex gap-3 ml-6 font-mono font-bold text-[10px]">
          <span className="text-emerald-400">● PORTAL SINTONIZADO</span>
          <span className="text-slate-500">DIGANEWS V1.4</span>
        </div>
      </footer>

      {/* Tailwind inline raw marquee animation definition in head fallback or custom styling */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Admin Panel Modal Overlay */}
      {isAdminOpen && (
        <AdminPanel 
          articles={articles}
          onAddArticle={handleAddNewArticle} 
          onUpdateArticle={handleUpdateArticle}
          onDeleteArticle={handleDeleteArticle}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      {/* Modern Floating DigaBot Chat Widget */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Chat Window Popup Container */}
        <AnimatePresence>
          {isAiOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.85, rotate: -1 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 35, scale: 0.85, rotate: 1 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="pointer-events-auto w-[calc(100vw-2rem)] sm:w-[380px] md:w-[430px] h-[540px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.15)] bg-[#13151a] flex flex-col mb-2"
              id="digabot-floating-window"
            >
              <AIBox 
                activeArticle={activeArticle} 
                articles={articles}
                isReadingArticle={isReadingArticle}
                onClose={() => setIsAiOpen(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Holographic Floating Toggle Button (FAB) */}
        <motion.button
          id="floating-bot-toggle-btn"
          type="button"
          onClick={() => setIsAiOpen(!isAiOpen)}
          whileHover={{ scale: 1.08, shadow: "0px 0px 15px rgb(6, 182, 212)" }}
          whileTap={{ scale: 0.92 }}
          className="pointer-events-auto w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black hover:text-white rounded-full shadow-[0_8px_30px_rgb(6,182,212,0.3)] hover:shadow-[0_10px_35px_rgb(6,182,212,0.45)] flex items-center justify-center relative border border-cyan-300/40 cursor-pointer transition-all duration-350"
        >
          {isAiOpen ? (
            <X className="w-5.5 h-5.5 font-bold text-white" />
          ) : (
            <>
              <Bot className="w-6.5 h-6.5 text-black" />
              {/* LED Active Pulse */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0a0a0c] rounded-full animate-bounce" />
              
              {/* Floating Help Banner (Badge) */}
              <span className="absolute right-16 bg-slate-950/95 border border-cyan-500/40 text-cyan-400 text-[9px] font-black uppercase py-1.5 px-3 rounded-lg whitespace-nowrap shadow-2xl flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                DigaBot IA
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
