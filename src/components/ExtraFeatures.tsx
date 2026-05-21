import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Flame, 
  Sparkles, 
  Plus, 
  ThumbsUp, 
  Cpu,
  Download,
  Image as ImageIcon,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  FileText,
  Terminal,
  Compass,
  Check,
  Calendar,
  Search,
  Clock,
  ArrowUpDown,
  Bot
} from "lucide-react";
import { Article } from "../data";

interface DebateTopic {
  id: string;
  title: string;
  sideA: string;
  sideB: string;
  sideAVotes: number;
  sideBVotes: number;
  aiVerdict?: string;
}

interface ExtraFeaturesProps {
  activeArticle?: Article;
  releases?: any[];
  onHype?: (id: string) => void;
  onAddRelease?: (newRel: any) => void;
}

export default function ExtraFeatures({ 
  activeArticle,
  releases = [],
  onHype,
  onAddRelease
}: ExtraFeaturesProps) {
  const [activeTab, setActiveTab] = useState<"debate" | "headline" | "hype">("debate");

  // --- Opção 3: Central de Hype e Calendário de Lançamentos ---
  const [releaseSearch, setReleaseSearch] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("all");
  const [releaseSort, setReleaseSort] = useState<"date" | "hype">("date");
  const [hypeReport, setHypeReport] = useState("");
  const [hypeReportLoading, setHypeReportLoading] = useState(false);
  const [singleAnalysis, setSingleAnalysis] = useState<Record<string, string>>({});
  const [analysisLoadingId, setAnalysisLoadingId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("games");
  const [newDate, setNewDate] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [addReleaseError, setAddReleaseError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- Opção 1: Arena de Debates Geeks ---
  const [debates, setDebates] = useState<DebateTopic[]>([
    {
      id: "d1",
      title: "Goku (Dragon Ball) vs Saitama (One Punch Man): Quem vence em soco puro?",
      sideA: "Saitama (O soco derrota qualquer um com 1 hit)",
      sideB: "Goku (Instinto Superior com poder divino)",
      sideAVotes: 1240,
      sideBVotes: 1118,
      aiVerdict: "Análise do DigaBot: Saitama possui um fator de força absurda de paródia absoluta, enquanto Goku escala infinitamente em força de vontade e transformações transcendentais. O debate de ki original sugere que eles provavelmente destruiriam o próprio universo antes de um vencedor claro emergir!"
    },
    {
      id: "d2",
      title: "PlayStation 5 vs Xbox Series X: Qual console tem a melhor biblioteca de exclusivos até agora?",
      sideA: "PlayStation (God of War, Spider-Man, Horizon)",
      sideB: "Xbox (FORZA, Halo, GamePass infinito)",
      sideAVotes: 980,
      sideBVotes: 820
    }
  ]);

  const [newDebateTitle, setNewDebateTitle] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, "A" | "B">>({});
  const [debateLoading, setDebateLoading] = useState(false);

  // --- Opção 2: Gerador de Manchetes e Capas com IA ---
  const [ideaInput, setIdeaInput] = useState("");
  const [styleType, setStyleType] = useState<"hq" | "sensacionalista" | "sincera">("hq");
  const [generatedResult, setGeneratedResult] = useState<{
    headline: string;
    subheadline: string;
    price: string;
    issueNo: string;
    cornerMeme: string;
    editorialNotes: string;
  } | null>(null);
  const [headlineLoading, setHeadlineLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [imageGenerating, setImageGenerating] = useState(false);

  // Safe helper to extract JSON
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

  // Option 1: AI Debate trigger
  const handleCreateAIDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebateTitle.trim() || debateLoading) return;
    setDebateLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Gere dois lados opostos curtos, divertidos e polarizados (Ex: Lado A contra Lado B) para debater esta polêmica nerd: "${newDebateTitle}".
              Retorne APENAS um objeto JSON válido, sem usar formatação de bloco de código markdown ou crases (JSON puro) no formato exato:
              { "sideA": "o argumento do lado A aqui", "sideB": "o argumento do lado B aqui", "aiVerdict": "um veredito humorístico do DigaBot em um parágrafo" }`
            }
          ]
        })
      });

      const data = await response.json();
      if (response.ok) {
        const parsed = extractJSON(data.reply);
        
        const generatedDebate: DebateTopic = {
          id: Date.now().toString(),
          title: newDebateTitle,
          sideA: parsed.sideA || "Defensores da Opção A",
          sideB: parsed.sideB || "Defensores da Opção B",
          sideAVotes: Math.floor(Math.random() * 50) + 10,
          sideBVotes: Math.floor(Math.random() * 50) + 10,
          aiVerdict: parsed.aiVerdict || "O debate está fervendo!"
        };

        setDebates(prev => [generatedDebate, ...prev]);
        setNewDebateTitle("");
      } else {
        alert("O portal cósmico oscilou! Tente reorganizar a frase de debate.");
      }
    } catch {
      const generatedDebate: DebateTopic = {
        id: Date.now().toString(),
        title: newDebateTitle,
        sideA: "Lado dos Puristas Hardcore",
        sideB: "Lado dos Modernos Casuais",
        sideAVotes: 25,
        sideBVotes: 22,
        aiVerdict: "DigaBot Verdict: A comunidade foi dividida de maneira letal! Ambos os lados possuem excelentes armaduras corporativas."
      };
      setDebates(prev => [generatedDebate, ...prev]);
      setNewDebateTitle("");
    } finally {
      setDebateLoading(false);
    }
  };

  const handleVote = (debateId: string, side: "A" | "B") => {
    if (userVotes[debateId]) return;
    setUserVotes(prev => ({ ...prev, [debateId]: side }));
    setDebates(prev => prev.map(d => {
      if (d.id === debateId) {
        return {
          ...d,
          sideAVotes: side === "A" ? d.sideAVotes + 1 : d.sideAVotes,
          sideBVotes: side === "B" ? d.sideBVotes + 1 : d.sideBVotes
        };
      }
      return d;
    }));
  };

  // Option 2: Headline Generation
  const handleGenerateComicHeadline = async () => {
    if (!ideaInput.trim() || headlineLoading) return;
    setHeadlineLoading(true);
    setCoverImageUrl("");

    try {
      const promptText = `Crie uma chamada de capa fictícia baseada nesta ideia de forma sátira para portal geek: "${ideaInput}".
      O estilo de humor deve ser: ${styleType === "hq" ? "Capa de Quadrinhos Retrô anos 80" : styleType === "sensacionalista" ? "Portal sensacionalista com clickbait absurdo" : "Reviewer rabugento sem filtros"}.
      Retorne APENAS um objeto JSON válido, sem usar formatação de bloco de código markdown ou crases (JSON puro) no formato exato:
      {
        "headline": "Uma manchete principal ultra chamativa em caixa alta",
        "subheadline": "Um subtítulo engraçado e complementar",
        "price": "Preço fictício engraçado, Ex: US$ 0.15 ou 10 Moedas de Ouro",
        "issueNo": "Nº de edição hilário, Ex: Vol. 99 ou Edição Proibida #42",
        "cornerMeme": "Uma frase de balão de fala dramática ou meme curto no topo",
        "editorialNotes": "Um pequeno comentário divertido da redação sobre esta loucura"
      }`;

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: promptText }] })
      });

      const data = await response.json();
      if (response.ok) {
        const parsed = extractJSON(data.reply);
        setGeneratedResult(parsed);
        
        // Now trigger cover illustration generation
        setImageGenerating(true);
        try {
          const imgResponse = await fetch("/api/gemini/generate-cover-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: parsed.headline + " - " + parsed.subheadline })
          });
          const imgData = await imgResponse.json();
          if (imgResponse.ok && imgData.imageUrl) {
            setCoverImageUrl(imgData.imageUrl);
          } else {
            setCoverImageUrl(`https://picsum.photos/seed/${encodeURIComponent(parsed.headline)}/500/500`);
          }
        } catch {
          setCoverImageUrl(`https://picsum.photos/seed/${encodeURIComponent(parsed.headline)}/500/500`);
        } finally {
          setImageGenerating(false);
        }

      } else {
        alert("Não conseguimos sintonizar o estúdio de do Gemini.");
      }
    } catch {
      const parsedError = {
        headline: "ERRO DE ROTEIRO INDISPENSÁVEL!",
        subheadline: `O multiverso colapsou tentando imaginar: ${ideaInput}`,
        price: "$ 0.00 CRÉDITOS",
        issueNo: "Vol. Error 404",
        cornerMeme: "Isso é canônico?",
        editorialNotes: "O sistema estelar oscilou ao simular essa ideia bizarra."
      };
      setGeneratedResult(parsedError);
      setCoverImageUrl(`https://picsum.photos/seed/error_${Date.now()}/500/500`);
    } finally {
      setHeadlineLoading(false);
    }
  };

  // Regeneration helper
  const handleRegenerateImage = async (customPrompt?: string) => {
    if (!generatedResult) return;
    setImageGenerating(true);
    try {
      const promptToUse = customPrompt || `${generatedResult.headline} - ${generatedResult.subheadline}`;
      const response = await fetch("/api/gemini/generate-cover-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse })
      });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setCoverImageUrl(data.imageUrl);
      } else {
        setCoverImageUrl(`https://picsum.photos/seed/${encodeURIComponent(promptToUse)}_${Date.now()}/500/500`);
      }
    } catch {
      setCoverImageUrl(`https://picsum.photos/seed/${encodeURIComponent(generatedResult.headline)}_${Date.now()}/500/500`);
    } finally {
      setImageGenerating(false);
    }
  };

  // Custom vector and content canvas downloader to avoid CORS SecurityError
  const handleDownloadAsImage = () => {
    if (!generatedResult) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (styleType === "hq") {
      // 1. HQ Retro style
      const grad = ctx.createLinearGradient(0, 0, 0, 960);
      grad.addColorStop(0, "#facc15"); // yellow-400
      grad.addColorStop(1, "#d97706"); // amber-600
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 720, 960);

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 706, 946);

      // Comic Top Box
      ctx.fillStyle = "#dc2626"; // red-600
      ctx.fillRect(14, 14, 692, 110);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.strokeRect(14, 14, 692, 110);

      // White comic series stamp
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 28px 'Impact', 'Arial Black', sans-serif";
      ctx.fillText("DIGANEWS COMICS", 40, 60);
      
      ctx.fillStyle = "#fef08a"; // yellow-200
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.fillText(`${generatedResult.issueNo} | PREÇO: ${generatedResult.price}`, 40, 95);

      // Huge headline title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px 'Impact', 'Arial Black', sans-serif";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 9;
      
      const titleLines = wrapTextText(ctx, `"${generatedResult.headline}"`, 640);
      let currentY = 190;
      titleLines.forEach(line => {
        ctx.strokeText(line, 40, currentY);
        ctx.fillText(line, 40, currentY);
        currentY += 50;
      });

      // Subtitle
      ctx.fillStyle = "#000000";
      ctx.font = "italic bold 23px 'Georgia', serif";
      const subLines = wrapTextText(ctx, generatedResult.subheadline, 640);
      currentY += 15;
      subLines.forEach(line => {
        ctx.fillText(line, 40, currentY);
        currentY += 28;
      });

      // Illustration representation
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(40, currentY + 10, 640, 240);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, currentY + 10, 640, 240);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText("[ ESPAÇO ILUSTRAÇÃO HQ ]", 250, currentY + 130);

      // Dialogue Speech Bubble represented digitally
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(40, 750, 640, 110);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;
      ctx.strokeRect(40, 750, 640, 110);
      
      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.fillText("💬 BALÃO DE COMENTÁRIO COLETIVO:", 60, 780);
      
      ctx.fillStyle = "#1e293b";
      ctx.font = "italic bold 17px 'Georgia', serif";
      const memeLines = wrapTextText(ctx, generatedResult.cornerMeme, 600);
      memeLines.slice(0, 2).forEach((line, idx) => {
        ctx.fillText(line, 60, 810 + (idx * 24));
      });

      // Editorial fine print
      ctx.fillStyle = "#1e293b";
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText(`Redação: ${generatedResult.editorialNotes.slice(0, 70)}...`, 40, 915);

    } else if (styleType === "sensacionalista") {
      // 2. Tabloid Pink-Red Alarm
      ctx.fillStyle = "#090514";
      ctx.fillRect(0, 0, 720, 960);

      ctx.strokeStyle = "#db2777"; // pink-600
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 708, 948);

      // Warning hazard ribbon top
      ctx.fillStyle = "#f59e0b"; // yellow hazard background
      ctx.fillRect(12, 12, 696, 75);
      
      ctx.fillStyle = "#000000";
      ctx.font = "900 24px 'Arial Black', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🚨 ALERTA GEEK SENSACIONALISTA 🚨", 360, 56);
      ctx.textAlign = "left"; // reset

      // Massive screaming toxic title
      ctx.fillStyle = "#ec4899"; // pink text
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.font = "900 46px 'Arial Black', sans-serif";
      
      const titleLines = wrapTextText(ctx, `"${generatedResult.headline}"`, 640);
      let currentY = 170;
      titleLines.forEach(line => {
        ctx.strokeText(line, 40, currentY);
        ctx.fillText(line, 40, currentY);
        currentY += 52;
      });

      // Clickbait subtitle
      ctx.fillStyle = "#c084fc"; // lavender
      ctx.font = "bold italic 23px 'Georgia', serif";
      const subLines = wrapTextText(ctx, generatedResult.subheadline, 640);
      currentY += 15;
      subLines.forEach(line => {
        ctx.fillText(line, 40, currentY);
        currentY += 28;
      });

      // Illustration mock
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(40, currentY + 10, 640, 240);
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, currentY + 10, 640, 240);
      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("[ ILUSTRAÇÃO BOMBÁSTICA INTERATIVO ]", 180, currentY + 130);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "16px monospace";
      ctx.fillText(`FAÇÃO: ${generatedResult.issueNo} | TARIFA: ${generatedResult.price}`, 40, 730);

      // Meme speech bubble
      ctx.fillStyle = "#111827";
      ctx.fillRect(40, 760, 640, 110);
      ctx.strokeStyle = "#f59e0b";
      ctx.strokeRect(40, 760, 640, 110);
      
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.fillText("🔥 RENOVAÇÃO GEEK EXTREMA:", 60, 790);
      
      ctx.fillStyle = "#f3f4f6";
      ctx.font = "italic 16px sans-serif";
      const memeLines = wrapTextText(ctx, generatedResult.cornerMeme, 600);
      memeLines.slice(0, 2).forEach((line, idx) => {
        ctx.fillText(line, 60, 815 + (idx * 24));
      });

      // Editorial
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px monospace";
      ctx.fillText(`REDAÇÃO: ${generatedResult.editorialNotes.slice(0, 75)}`, 40, 915);

    } else {
      // 3. Notebook / Raw Reviewer Sincera
      ctx.fillStyle = "#0c0a09"; // warm stone-950
      ctx.fillRect(0, 0, 720, 960);

      ctx.strokeStyle = "#44403c";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 706, 946);

      // Star grid
      ctx.strokeStyle = "rgba(120, 113, 108, 0.4)";
      ctx.lineWidth = 1.5;
      for (let y = 110; y < 900; y += 45) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(680, y);
        ctx.stroke();
      }

      // Title header
      ctx.fillStyle = "#a8a29e";
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.fillText("// CRÍTICA SINCERA GEEK REGIONAL", 40, 60);
      ctx.fillText(`STAMP: ${generatedResult.issueNo}`, 480, 60);

      // Large crisp title
      ctx.fillStyle = "#fafaf9";
      ctx.font = "bold 38px 'Courier New', monospace";
      const titleLines = wrapTextText(ctx, generatedResult.headline, 640);
      let currentY = 160;
      titleLines.forEach(line => {
        ctx.fillText(line, 40, currentY);
        currentY += 46;
      });

      // Subtitle
      ctx.fillStyle = "#d6d3d1";
      ctx.font = "italic 21px 'Courier New', monospace";
      const subLines = wrapTextText(ctx, generatedResult.subheadline, 640);
      currentY += 15;
      subLines.forEach(line => {
        ctx.fillText(line, 40, currentY);
        currentY += 28;
      });

      // Custom illustration box outline
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(40, currentY + 15, 640, 230);
      ctx.strokeStyle = "#44403c";
      ctx.lineWidth = 2;
      ctx.strokeRect(40, currentY + 15, 640, 230);
      ctx.fillStyle = "#a8a29e";
      ctx.font = "15px 'Courier New', monospace";
      ctx.fillText("[ ANALISE DE PROVA GRÁFICA GEEK ]", 210, currentY + 130);

      ctx.fillStyle = "#f87171";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(`TAXA: ${generatedResult.price}`, 40, 725);

      // Reviews box
      ctx.fillStyle = "rgba(28, 25, 23, 0.8)";
      ctx.fillRect(40, 755, 640, 110);
      ctx.strokeStyle = "#78716c";
      ctx.strokeRect(40, 755, 640, 110);
      
      ctx.fillStyle = "#e7e5e4";
      ctx.fillText("> OPINIÃO SINCERA DO LEITORES DA GUILDA:", 60, 785);
      ctx.fillStyle = "#a8a29e";
      const memeLines = wrapTextText(ctx, generatedResult.cornerMeme, 600);
      memeLines.slice(0, 2).forEach((line, idx) => {
        ctx.fillText(line, 60, 815 + (idx * 24));
      });

      // NOTES
      ctx.fillStyle = "#78716c";
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText(`NOTAS E PENSAMENTOS DA REDAÇÃO: ${generatedResult.editorialNotes}`, 40, 915);
    }

    // Trigger download of standard canvas blob
    const link = document.createElement("a");
    link.download = `capa_diganews_${styleType}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Helper function to warp text inside canvas nicely
  const wrapTextText = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(currentLine.trim());
        currentLine = words[n] + " ";
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    return lines;
  };

  // --- Opção 3 Functions ---
  const handleGenerateHypeReport = async () => {
    if (hypeReportLoading) return;
    setHypeReportLoading(true);
    setHypeReport("");
    try {
      const response = await fetch("/api/gemini/hype-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releases })
      });
      const data = await response.json();
      if (response.ok && data.report) {
         setHypeReport(data.report);
      } else {
         setHypeReport("O DigaBot não conseguiu sintonizar o multiverso astral do Hype. Tente novamente clicando no botão!");
      }
    } catch {
       setHypeReport("Ocorreu uma interferência magnética cósmica ao rastrear os sinais de Hype no momento.");
    } finally {
       setHypeReportLoading(false);
    }
  };

  const handleAnalyzeRelease = async (rel: any) => {
    if (analysisLoadingId) return;
    setAnalysisLoadingId(rel.id);
    try {
      const response = await fetch("/api/gemini/analyze-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rel.title,
          category: rel.category,
          releaseDate: rel.releaseDate,
          platformOrWhere: rel.platformOrWhere
        })
      });
      const data = await response.json();
      if (response.ok && data.analysis) {
        setSingleAnalysis(prev => ({ ...prev, [rel.id]: data.analysis }));
      } else {
        setSingleAnalysis(prev => ({ ...prev, [rel.id]: "Não conseguimos sintonizar os canais de previsão temporal. Algo colidiu no Multiverso." }));
      }
    } catch {
      setSingleAnalysis(prev => ({ ...prev, [rel.id]: "Interferência temporal catastrófica. Previsão indisponível." }));
    } finally {
      setAnalysisLoadingId(null);
    }
  };

  const handleAddNewReleaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddReleaseError("");
    if (!newTitle.trim()) {
      setAddReleaseError("O título do lançamento é vital!");
      return;
    }
    if (!newDate) {
      setAddReleaseError("A data prevista é requerida para sintonizar a data!");
      return;
    }

    const randomHype = Math.floor(Math.random() * 300) + 15;
    const placeholderImages = [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80"
    ];
    const finalImage = newImageUrl.trim() || placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    const newRel = {
      id: "usr-" + Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      releaseDate: newDate,
      platformOrWhere: newPlatform.trim() || "Multiverso Digital",
      imageUrl: finalImage,
      hypeCount: randomHype
    };

    if (onAddRelease) {
      onAddRelease(newRel);
    }

    // Reset fields
    setNewTitle("");
    setNewDate("");
    setNewPlatform("");
    setNewImageUrl("");
    setAddReleaseError("");
    setIsFormOpen(false);

    // Call single predictions instantly
    handleAnalyzeRelease(newRel);
  };

  const getCountdownText = (dateStr: string) => {
    try {
      const today = new Date("2026-05-20");
      const target = new Date(dateStr);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return { text: "🎉 ESTREIA HOJE!", color: "text-emerald-400 font-extrabold animate-pulse" };
      } else if (diffDays > 0) {
        return { text: `Faltam ${diffDays} dias!`, color: "text-cyan-400 font-bold" };
      } else {
        return { text: `Lançado há ${Math.abs(diffDays)} dias!`, color: "text-slate-500 font-medium" };
      }
    } catch {
      return { text: "Estreia em breve", color: "text-slate-400" };
    }
  };

  return (
    <div className="bg-[#111318] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* 3 Multi-Tab Navigation header */}
      <div className="grid grid-cols-3 border-b border-white/10 bg-[#07080a]">
        <button
          id="extra-tab-debate"
          type="button"
          onClick={() => setActiveTab("debate")}
          className={`py-4 text-[10px] md:text-xs font-black tracking-wider md:tracking-widest border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "debate"
              ? "border-cyan-500 text-cyan-400 bg-[#111318]/50"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          🤺 DEBATES GEEK
        </button>

        <button
          id="extra-tab-headline"
          type="button"
          onClick={() => setActiveTab("headline")}
          className={`py-4 text-[10px] md:text-xs font-black tracking-wider md:tracking-widest border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "headline"
              ? "border-purple-500 text-purple-400 bg-[#111318]/50"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          🎨 CAPAS COM IA
        </button>

        <button
          id="extra-tab-hype"
          type="button"
          onClick={() => setActiveTab("hype")}
          className={`py-4 text-[10px] md:text-xs font-black tracking-wider md:tracking-widest border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "hype"
              ? "border-amber-500 text-amber-400 bg-[#111318]/50"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500 animate-bounce" />
          🚀 RADAR & HIGH HYPE
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="p-6">
        {activeTab === "debate" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span className="text-xl">🤺</span>
                  A Grande Fogueira de Debates
                </h3>
                <p className="text-xs text-slate-400">Vote nas maiores dúvidas existenciais geeks ou insira sua própria polêmica para debater!</p>
              </div>

              {/* Form to propose a debate */}
              <form onSubmit={handleCreateAIDebate} className="flex gap-2 w-full md:w-auto">
                <input
                  id="propose-debate-input"
                  type="text"
                  placeholder="Ex: Harry Potter vs Percy Jackson..."
                  value={newDebateTitle}
                  onChange={(e) => setNewDebateTitle(e.target.value)}
                  className="bg-slate-950 text-xs px-3 py-2 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 flex-1 md:w-64"
                  required
                />
                <button
                  id="propose-debate-btn"
                  type="submit"
                  disabled={debateLoading || !newDebateTitle.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black text-xs font-black uppercase px-4 py-2 rounded-lg flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {debateLoading ? "Conjurando..." : "Desafiar"}
                </button>
              </form>
            </div>

            {/* Debates List */}
            <div className="space-y-4">
              {debates.map((debate) => {
                const totalVotes = debate.sideAVotes + debate.sideBVotes;
                const pctA = totalVotes > 0 ? Math.round((debate.sideAVotes / totalVotes) * 100) : 50;
                const pctB = totalVotes > 0 ? 100 - pctA : 50;
                const hasVoted = userVotes[debate.id];

                return (
                  <div key={debate.id} className="p-5 bg-slate-900/60 border border-white/5 rounded-xl space-y-4 hover:border-white/15 transition-all">
                    <h5 className="font-extrabold text-white text-sm">
                      {debate.title}
                    </h5>

                    {/* Interactive voting bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Option A */}
                      <button
                        id={`debate-option-A-${debate.id}`}
                        type="button"
                        onClick={() => handleVote(debate.id, "A")}
                        disabled={!!hasVoted}
                        className={`p-3 text-left text-xs rounded-lg border transition-all flex flex-col justify-between ${
                          hasVoted === "A"
                            ? "bg-cyan-950/20 border-cyan-500 text-cyan-200"
                            : "bg-slate-950 border-white/5 hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <span className="font-semibold">{debate.sideA}</span>
                        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/5 w-full text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-cyan-400" /> Votar
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">{debate.sideAVotes} votos ({pctA}%)</span>
                        </div>
                      </button>

                      {/* Option B */}
                      <button
                        id={`debate-option-B-${debate.id}`}
                        type="button"
                        onClick={() => handleVote(debate.id, "B")}
                        disabled={!!hasVoted}
                        className={`p-3 text-left text-xs rounded-lg border transition-all flex flex-col justify-between ${
                          hasVoted === "B"
                            ? "bg-purple-950/20 border-purple-500 text-purple-200"
                            : "bg-slate-950 border-white/5 hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <span className="font-semibold">{debate.sideB}</span>
                        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/5 w-full text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-purple-400" /> Votar
                          </span>
                          <span className="font-mono text-purple-400 font-bold">{debate.sideBVotes} votos ({pctB}%)</span>
                        </div>
                      </button>
                    </div>

                    {/* Progress vote visualization bar */}
                    {hasVoted && (
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                          <div className="h-full bg-cyan-500" style={{ width: `${pctA}%` }} />
                          <div className="h-full bg-purple-500" style={{ width: `${pctB}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono text-center">A comunidade está dividida! Obrigado pelo seu voto.</p>
                      </div>
                    )}

                    {/* AI explanation and verdict */}
                    {debate.aiVerdict && (
                      <div className="p-3 bg-slate-950 border-l-2 border-amber-500 rounded-r-lg text-xs leading-relaxed text-slate-300">
                        <div className="flex items-center gap-1.5 font-extrabold text-[#d97706] mb-1 font-mono uppercase text-[10px]">
                          <Cpu className="w-3 h-3 animate-bounce" /> Veredito Real do DigaBot IA
                        </div>
                        {debate.aiVerdict}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "headline" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 mb-1">
                <span>🎨</span> Conjurador de Capas e Manchetes Meme por IA
              </h3>
              <p className="text-xs text-slate-400">Transforme qualquer assunto louco ou ideia absurda em uma capa satírica geek gerada pelo Gemini!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                id="comic-idea-input"
                type="text"
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="Insira sua ideia geek (Crossover, rumor de jogo, ideia boba)..."
                className="bg-slate-950 text-xs px-3 py-2 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 col-span-2"
              />
              <select
                id="comic-style-select"
                value={styleType}
                onChange={(e) => setStyleType(e.target.value as any)}
                className="bg-slate-950 text-xs font-semibold px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none"
              >
                <option value="hq">Quadrinho Retrô Anos 80</option>
                <option value="sensacionalista">Meme Clickbait Sensacionalista</option>
                <option value="sincera">Review Rabugenta e Sincera</option>
              </select>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                id="trigger-headline-generator-btn"
                type="button"
                onClick={handleGenerateComicHeadline}
                disabled={headlineLoading || !ideaInput.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-950/40 opacity-100 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                {headlineLoading ? "Criando Capa de Colecionador..." : "Conjurar Capa Geek por IA"}
              </button>
            </div>

            {/* Generated Cover mock UI */}
            {generatedResult && (
              <div className="space-y-4">
                {/* 1. RETRO COMIC / HQ STYLE */}
                {styleType === "hq" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-5 md:p-6 bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-500 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden max-w-xl mx-auto text-black"
                  >
                    {/* Comic Header Stamp */}
                    <div className="border-b-4 border-black pb-3 mb-4 flex justify-between items-center text-xs font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-red-600 text-white px-2.5 py-1 text-[10px] border-2 border-black font-extrabold select-none rotate-[-2deg]">
                          DIGANEWS PRESS
                        </span>
                        <span className="text-black font-mono font-black text-[11px]">{generatedResult.issueNo}</span>
                      </div>
                      <div className="bg-black text-yellow-300 px-3 py-1 font-mono text-[12px] border-2 border-black font-extrabold rounded">
                        {generatedResult.price}
                      </div>
                    </div>

                    <div className="text-center py-2 space-y-4 relative z-10">
                      {/* Badge sticker */}
                      <span className="inline-block py-1 px-3 bg-red-600 text-white text-[10px] font-black uppercase border-2 border-black tracking-widest transform -rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1">
                        💥 EDIÇÃO COLECIONADOR
                      </span>

                      {/* Headline wrapped in iconic quotes */}
                      <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-[1] text-black font-sans select-all border-b border-black/10 pb-2 drop-shadow-[1px_1px_0px_#fff]">
                        "{generatedResult.headline}"
                      </h3>

                      {/* Subheadline styling */}
                      <p className="text-slate-900 font-serif italic text-base font-semibold leading-snug px-2">
                        {generatedResult.subheadline}
                      </p>

                      {/* Cover illustration illustration wrapper */}
                      <div className="my-5 border-4 border-black bg-yellow-200/50 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] aspect-square max-w-sm mx-auto relative group">
                        {imageGenerating ? (
                          <div className="absolute inset-0 bg-yellow-400/30 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-10 h-10 rounded-full border-4 border-black border-t-red-600 animate-spin mb-2" />
                            <span className="text-xs font-mono font-black uppercase text-black">A IA está desenhando...</span>
                          </div>
                        ) : coverImageUrl ? (
                          <img 
                            src={coverImageUrl} 
                            alt="Capa HQ" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <ImageIcon className="w-10 h-10 text-black/50 mb-2 animate-bounce" />
                            <span className="text-xs font-mono font-black">NENHUMA IMAGEM GERADA</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-2 bg-black text-white text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-widest leading-none">
                          REF_FIG_01
                        </div>
                      </div>
                    </div>

                    {/* Speech Bubble */}
                    <div className="relative mt-4 p-4 bg-white rounded-2xl border-4 border-black text-xs font-bold text-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2.5">
                      <span className="text-2xl mt-0.5 shrink-0">💬</span>
                      <div>
                        <span className="font-mono text-amber-700 font-black text-[9px] uppercase tracking-widest block mb-0.5">Comentários dos Leitores:</span>
                        <p className="font-sans text-stone-900 select-all leading-normal text-[12px]">
                          "{generatedResult.cornerMeme}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t-2 border-black/30 text-[10px] text-black/80 font-black leading-relaxed font-mono">
                      📝 NOTA DO EDITOR: {generatedResult.editorialNotes}
                    </div>
                  </motion.div>
                )}

                {/* 2. SENSACIONALISTA / MEME TABLOID STYLE */}
                {styleType === "sensacionalista" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 bg-gradient-to-br from-rose-950 via-[#120816] to-[#0a0410] rounded-2xl border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)] relative overflow-hidden max-w-xl mx-auto text-white"
                  >
                    {/* Glowing yellow hazard stripes at the top */}
                    <div className="h-4 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#000_10px,#000_20px)] w-full" />

                    <div className="p-6">
                      <div className="border-b border-rose-500/30 pb-3 mb-4 flex justify-between items-start text-xs font-mono">
                        <div>
                          <span className="text-black font-extrabold uppercase bg-rose-500 px-2 py-0.5 text-[9px] mr-2">NOTÍCIA DE CHOQUE</span>
                          <span className="text-rose-300 font-mono font-bold text-[10px]">{generatedResult.issueNo}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-yellow-400 font-bold font-mono">{generatedResult.price}</span>
                        </div>
                      </div>

                      <div className="text-center py-2 space-y-4 relative z-10">
                        <div className="inline-block py-1 px-3 bg-rose-500 text-white text-[9px] font-mono font-black uppercase rounded-sm animate-pulse tracking-widest mb-1">
                          🚨 ABSURDO TOTAL DETECTADO
                        </div>

                        {/* Scream title with heavy text shadow */}
                        <h3 className="text-3xl md:text-4xl font-black text-rose-400 tracking-tighter uppercase leading-[1.05] font-sans select-all drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]">
                          "{generatedResult.headline}"
                        </h3>

                        {/* Subtitle clickbait */}
                        <p className="text-slate-300 font-sans text-sm font-semibold max-w-lg mx-auto">
                          {generatedResult.subheadline}
                        </p>

                        {/* Centered illustration aspect-square frame */}
                        <div className="my-5 border-2 border-[#ec4899] bg-[#0d0914] rounded-2xl overflow-hidden aspect-square max-w-xs mx-auto relative">
                          {imageGenerating ? (
                            <div className="absolute inset-0 bg-[#0c0410]/85 flex flex-col items-center justify-center p-4 text-center">
                              <div className="w-10 h-10 rounded-full border-4 border-rose-950 border-t-rose-500 animate-spin mb-2" />
                              <span className="text-xs font-mono uppercase text-rose-300">Desenhando capa com IA...</span>
                            </div>
                          ) : coverImageUrl ? (
                            <img 
                              src={coverImageUrl} 
                              alt="Ilustração Sensacionalista" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              <ImageIcon className="w-8 h-8 text-rose-500/40 mb-2 animate-pulse" />
                              <span className="text-xs text-rose-400 font-mono font-bold uppercase leading-none">SEM ILUSTRAÇÃO</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dialogue Bubble */}
                      <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/60 text-xs italic text-slate-300 flex items-start gap-2.5">
                        <span className="text-xl">🔥</span>
                        <div>
                          <span className="font-extrabold text-rose-400 not-italic block text-[9px] uppercase font-mono tracking-wider mb-0.5">PROTESTOS NA INTERNET:</span>
                          <span className="select-all block leading-relaxed text-[#f1f5f9]">
                            "{generatedResult.cornerMeme}"
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-rose-500/20 text-[10px] text-rose-300/80 leading-relaxed font-mono">
                        📢 MONITORIA DO MULTIVERSO: {generatedResult.editorialNotes}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. SINCERA / TYPEWRITER GEEK FILE */}
                {styleType === "sincera" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-5 md:p-6 bg-[#0f1115] rounded-2xl border-2 border-stone-800 shadow-2xl relative overflow-hidden max-w-xl mx-auto text-stone-300 font-mono"
                  >
                    {/* Simulated notebook lines pattern overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_28px]" />

                    <div className="border-b border-stone-800 pb-3 mb-4 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-sky-400 font-extrabold uppercase bg-sky-950/80 px-2 py-0.5 border border-sky-900 text-[9px]">
                          CRITIQUE FILE
                        </span>
                        <span>{generatedResult.issueNo}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-400 font-bold">{generatedResult.price}</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-4 relative z-10">
                      <span className="inline-block py-0.5 px-2 bg-stone-900 text-stone-400 text-[10px] border border-stone-800 uppercase tracking-widest rounded mb-1">
                        // ANÁLISE COMPLETA SEM ADORNOS
                      </span>

                      {/* Typewriter raw title */}
                      <h3 className="text-2xl md:text-3xl font-bold text-amber-100 tracking-tight leading-snug select-all">
                        {generatedResult.headline}
                      </h3>

                      {/* Notebook feedback */}
                      <p className="text-stone-400 italic text-sm leading-relaxed font-sans pl-2 border-l border-amber-600/50">
                        {generatedResult.subheadline}
                      </p>

                      {/* Monospaced grey-toned illustration */}
                      <div className="my-5 border border-stone-700 bg-stone-950 overflow-hidden aspect-square max-w-xs mx-auto relative">
                        {imageGenerating ? (
                          <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-10 h-10 rounded border-2 border-sky-500 animate-pulse mb-2" />
                            <span className="text-[10px] uppercase text-sky-400 font-mono tracking-widest">CARREGANDO REGISTRO GRÁFICO...</span>
                          </div>
                        ) : coverImageUrl ? (
                          <img 
                            src={coverImageUrl} 
                            alt="Desenho Sincero" 
                            className="w-full h-full object-cover filter grayscale"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <ImageIcon className="w-8 h-8 text-stone-600 mb-2" />
                            <span className="text-[9px] text-stone-500 font-mono">REGISTRO_VAGO_01_EMPTY</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 left-2 bg-stone-900 text-stone-400 text-[9px] px-2 font-mono">
                          ATTACHMENT_ID_0A
                        </div>
                      </div>
                    </div>

                    {/* Speech comments */}
                    <div className="p-4 bg-stone-950 rounded-xl border border-stone-850 text-xs text-stone-400 flex items-start gap-2">
                      <span className="text-sky-400 font-extrabold shrink-0">{">"}</span>
                      <div>
                        <span className="font-extrabold text-sky-400 block text-[9px] uppercase tracking-wider mb-0.5">RESPOSTA DO FÓRUM GEEK:</span>
                        <p className="select-all block leading-relaxed text-stone-300 bg-black/40 p-2 border border-stone-900 rounded font-sans">
                          "{generatedResult.cornerMeme}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-850 text-[10px] text-stone-500 leading-relaxed">
                      🤖 RELATÓRIO DO MONITOR DE DADOS: {generatedResult.editorialNotes}
                    </div>
                  </motion.div>
                )}

                {/* VISUAL COVER CONTROLS TOOLBAR */}
                <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center max-w-xl mx-auto">
                  <button
                    id="downloader-cover-btn"
                    onClick={handleDownloadAsImage}
                    title="Baixar como PNG"
                    className="flex-1 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-700/60 text-xs font-bold px-4 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all shadow-md leading-none"
                  >
                    <Download className="w-4 h-4 text-amber-400 animate-bounce" />
                    Salvar Capa PNG (Alta Resignação)
                  </button>
                  <button
                    id="regenerator-cover-btn"
                    onClick={() => handleRegenerateImage()}
                    disabled={imageGenerating}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold px-4 py-3 rounded-xl text-slate-300 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <RefreshCw className={`w-4 h-4 text-purple-400 ${imageGenerating ? 'animate-spin' : ''}`} />
                    {imageGenerating ? "Ilustrando..." : "Mudar Ilustração com IA"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- OPÇÃO 3: CENTRAL DE HYPE & CALENDÁRIO DE LANÇAMENTOS PANEL --- */}
        {activeTab === "hype" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span className="text-lg">🚀</span> Central de High Hype & Calendário Geek
                </h3>
                <p className="text-xs text-slate-400">
                  Acompanhe e influencie as temperaturas de lançamentos mais aguardados! Adicione estreias e consulte o futuro com o DigaBot Inteligente.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full lg:w-auto shrink-0">
                <button
                  id="btn-trigger-hype-report"
                  type="button"
                  onClick={handleGenerateHypeReport}
                  disabled={hypeReportLoading}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-black text-xs font-black uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md flex-1 lg:flex-none cursor-pointer"
                >
                  <Bot className={`w-4 h-4 ${hypeReportLoading ? "animate-spin" : ""}`} />
                  {hypeReportLoading ? "Espreitando o Amanhã..." : "Análise do Termômetro Geral (IA)"}
                </button>

                <button
                  id="btn-toggle-add-release-form"
                  type="button"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className={`text-xs font-black uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all border flex-1 lg:flex-none cursor-pointer ${
                    isFormOpen 
                      ? "bg-rose-950/50 border-rose-500 text-rose-300 hover:bg-rose-900/50" 
                      : "bg-[#161a23] border-white/10 text-white hover:bg-[#1f2533]"
                  }`}
                >
                  {isFormOpen ? "Fechar Conjurador" : "➕ Conjurar Lançamento"}
                </button>
              </div>
            </div>

            {/* AI Generated Hype Report Presentation */}
            {hypeReport && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 border-l-4 border-amber-500 p-5 rounded-r-xl space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#d97706] flex items-center gap-1.5 font-mono">
                    <Cpu className="w-4 h-4 text-amber-50 animate-pulse" />
                    BOLETIM DE HYPE DO DIGABOT (GEMINI AI ACTIVE)
                  </h4>
                  <button
                    onClick={() => setHypeReport("")}
                    className="text-[10px] text-slate-500 hover:text-white font-mono bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
                  >
                    Ocultar Boletim
                  </button>
                </div>
                
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {hypeReport.split("\n").map((line, idx) => {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith("###")) {
                      return <h5 key={idx} className="text-xs font-black text-amber-400 mt-3 mb-1 uppercase tracking-wider">{cleanLine.replace("###", "").replace(/[*#]/g, "").trim()}</h5>;
                    }
                    if (cleanLine.startsWith("##")) {
                      return <h4 key={idx} className="text-sm font-black text-cyan-400 mt-4 mb-2 pb-1 border-b border-white/5 uppercase tracking-wide">{cleanLine.replace("##", "").replace(/[*#]/g, "").trim()}</h4>;
                    }
                    if (cleanLine.startsWith("#")) {
                      return <h3 key={idx} className="text-base font-black text-rose-500 mt-5 mb-3 uppercase tracking-wider">{cleanLine.replace("#", "").replace(/[*#]/g, "").trim()}</h3>;
                    }
                    if (cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
                      return (
                        <li key={idx} className="ml-3 list-disc text-slate-300 text-xs my-1 leading-relaxed">
                          {cleanLine.substring(1).replace(/[*#]/g, "").trim()}
                        </li>
                      );
                    }
                    if (cleanLine === "") return <div key={idx} className="h-1" />;
                    
                    // Parse double asterisks in line
                    const parts = cleanLine.split(/(\*\*.*?\*\*)/);
                    return (
                      <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">
                        {parts.map((part, pIdx) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={pIdx} className="font-extrabold text-white text-[12px]">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* REGISTER NEW RELEASE FORM CARD (COLLAPSIBLE / ACCORDION) */}
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-slate-900 border border-white/10 rounded-xl p-5 shadow-lg space-y-4"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    🌌 Portal do Conjurador: Agendar Novo Lançamento
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Estreias personalizadas aparecem instantaneamente no calendário com direito e votos e análise preditiva do DigaBot.
                  </p>
                </div>

                <form onSubmit={handleAddNewReleaseSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Título Oficial *</label>
                    <input
                      id="form-release-title"
                      type="text"
                      placeholder="Ex: Spider-Man 4, Matrix 5..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 w-full"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Categoria *</label>
                    <select
                      id="form-release-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 w-full font-semibold"
                    >
                      <option value="games">🎮 Games & Jogos</option>
                      <option value="filmes">🎬 Filmes & Cinema</option>
                      <option value="series">📺 Séries de TV</option>
                      <option value="animes">👾 Animes & Mangás</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Data Prevista *</label>
                    <input
                      id="form-release-date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 w-full font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Plataforma / Onde Assistir</label>
                    <input
                      id="form-release-platform"
                      type="text"
                      placeholder="Ex: PS5, Netflix, Cinemas..."
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 w-full"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">URL da Imagem de Banner (Opcional)</label>
                    <input
                      id="form-release-image"
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 w-full font-mono"
                    />
                  </div>

                  {addReleaseError && (
                    <div className="col-span-1 md:col-span-2 text-xs font-mono font-bold text-rose-500 bg-rose-950/20 p-2.5 rounded border border-rose-900/40">
                      ⚠️ Alerta Temporal: {addReleaseError}
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-2.5 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase py-2 px-4 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      id="btn-submit-new-release"
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase py-2 px-6 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Invocar Lançamento & Obter Previsão IA
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* FILTER CONTROLS & SEARCH BAR PILLS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3.5 bg-[#151821]/80 p-3 border border-white/5 rounded-xl">
              {/* Search bar */}
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  id="release-search-bar"
                  type="text"
                  placeholder="Pesquisar lançamentos..."
                  value={releaseSearch}
                  onChange={(e) => setReleaseSearch(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-full"
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1 w-full justify-start md:justify-center overflow-x-auto select-none custom-scrollbar pb-1 md:pb-0">
                {[
                  { id: "all", label: "Tudo" },
                  { id: "games", label: "🎮 Games" },
                  { id: "filmes", label: "🎬 Filmes" },
                  { id: "series", label: "📺 Séries" },
                  { id: "animes", label: "👾 Animes" }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setReleaseFilter(pill.id)}
                    className={`py-1 px-3 text-[10px] font-extrabold uppercase rounded-full transition-all cursor-pointer ${
                      releaseFilter === pill.id
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-950/40"
                        : "bg-slate-950/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Sorting buttons */}
              <div className="flex bg-slate-950 rounded-lg p-0.5 border border-white/5 shrink-0 self-end md:self-auto">
                <button
                  onClick={() => setReleaseSort("date")}
                  className={`flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold uppercase rounded-md transition-all cursor-pointer ${
                    releaseSort === "date"
                      ? "bg-slate-800 text-cyan-400"
                      : "text-slate-500 hover:text-white"
                  }`}
                  title="Ordenar por data prevista"
                >
                  <Clock className="w-3 h-3" />
                  Data
                </button>
                <button
                  onClick={() => setReleaseSort("hype")}
                  className={`flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold uppercase rounded-md transition-all cursor-pointer ${
                    releaseSort === "hype"
                      ? "bg-slate-800 text-amber-500"
                      : "text-slate-500 hover:text-white"
                  }`}
                  title="Ordenar pelos mais empolgados (Hype)"
                >
                  <Flame className="w-3 h-3 text-red-500" />
                  Hype
                </button>
              </div>
            </div>

            {/* RELEASES BANNER GRID LIST */}
            {(() => {
              const itemsToRender = releases.filter(rel => {
                const matchesSearch = rel.title.toLowerCase().includes(releaseSearch.toLowerCase()) || 
                                      (rel.platformOrWhere && rel.platformOrWhere.toLowerCase().includes(releaseSearch.toLowerCase()));
                const matchesCategory = releaseFilter === "all" || rel.category === releaseFilter;
                return matchesSearch && matchesCategory;
              }).sort((a, b) => {
                if (releaseSort === "hype") {
                  return b.hypeCount - a.hypeCount;
                } else {
                  return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                }
              });

              if (itemsToRender.length === 0) {
                return (
                  <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl bg-slate-905/30">
                    <p className="text-slate-500 text-xs font-mono">
                      Nenhum lançamento pop sintonizado sob esses critérios de escaneamento.
                    </p>
                    <button
                      onClick={() => { setReleaseSearch(""); setReleaseFilter("all"); }}
                      className="text-cyan-400 hover:underline text-[10px] font-mono mt-2"
                    >
                      Resetar filtros de escaneamento
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemsToRender.map((rel) => {
                    const countdown = getCountdownText(rel.releaseDate);
                    const formattedDate = () => {
                      try {
                        const parts = rel.releaseDate.split("-");
                        return `${parts[2]}/${parts[1]}/${parts[0]}`;
                      } catch {
                        return rel.releaseDate;
                      }
                    };

                    const isAnalyzingThis = analysisLoadingId === rel.id;
                    const hasAnalysis = !!singleAnalysis[rel.id];

                    return (
                      <div
                        key={rel.id}
                        className="p-4 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col justify-between gap-3 hover:border-white/15 hover:bg-slate-900/80 transition-all shadow-md group relative overflow-hidden"
                      >
                        {/* Background Category Glow */}
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-10 pointer-events-none ${
                          rel.category === "games" ? "bg-indigo-500" :
                          rel.category === "filmes" ? "bg-rose-500" :
                          rel.category === "animes" ? "bg-cyan-500" : "bg-teal-500"
                        }`} />

                        <div className="flex gap-4 items-start relative z-10">
                          {/* Banner image or icon fallback */}
                          <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden shrink-0 bg-slate-950 relative">
                            {rel.imageUrl ? (
                              <img
                                src={rel.imageUrl}
                                alt={rel.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback gracefully on broken images
                                  (e.target as any).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-cyan-400 font-mono text-base bg-slate-950">
                                {rel.category === "games" ? "🎮" : rel.category === "filmes" ? "🎬" : rel.category === "series" ? "📺" : "👾"}
                              </div>
                            )}
                            {/* Category badge */}
                            <span className="absolute bottom-0 right-0 py-0.5 px-1 bg-black/80 font-mono text-[7px] text-zinc-400 font-bold border-t border-l border-white/10 rounded-tl-md uppercase">
                              {rel.category}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="space-y-1 overflow-hidden flex-1">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors uppercase leading-tight line-clamp-1">
                              {rel.title}
                            </h4>
                            
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block truncate">
                                🔌 {rel.platformOrWhere || "Multiverso Digital"}
                              </span>
                              
                              <span className="text-[10px] font-mono leading-none flex items-center gap-1.5 pt-0.5">
                                <span className="text-[9px] text-slate-400">📅 {formattedDate()}</span>
                                <span className={`text-[9px] uppercase px-1 rounded bg-black/40 border border-white/5 font-extrabold ${countdown.color}`}>
                                  {countdown.text}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Button control actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5 relative z-10">
                          {/* Hype Vote button */}
                          <button
                            id={`hype-vote-${rel.id}`}
                            onClick={() => onHype && onHype(rel.id)}
                            className="flex-1 shrink-0 flex items-center justify-center gap-1.5 bg-[#161a23] hover:bg-red-950/20 text-slate-200 hover:text-red-400 border border-white/5 rounded-lg py-1.5 px-3 text-[10px] font-black uppercase transition-all cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            Up Hype ({rel.hypeCount})
                          </button>

                          {/* DigaBot Prediction trigger */}
                          <button
                            id={`hype-analyze-${rel.id}`}
                            onClick={() => handleAnalyzeRelease(rel)}
                            disabled={isAnalyzingThis}
                            className={`flex-1 shrink-0 flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-[10px] font-black uppercase transition-all cursor-pointer ${
                              hasAnalysis 
                                ? "bg-slate-950 border border-white/10 text-slate-400 hover:text-white" 
                                : "bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/20"
                            }`}
                          >
                            <Bot className={`w-3.5 h-3.5 ${isAnalyzingThis ? "animate-spin" : ""}`} />
                            {isAnalyzingThis ? "Vigiando..." : hasAnalysis ? "Ver Previsão IA" : "Veredito Cósmico"}
                          </button>
                        </div>

                        {/* Collapsible predictive review analysis */}
                        {hasAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2.5 p-3 bg-slate-950 rounded-lg border-l-2 border-cyan-400 text-[11px] leading-relaxed relative"
                          >
                            <button
                              onClick={() => setSingleAnalysis(prev => {
                                const copy = { ...prev };
                                delete copy[rel.id];
                                return copy;
                              })}
                              className="absolute top-1 right-2 text-[9px] font-mono text-slate-600 hover:text-white"
                            >
                              Sair
                            </button>
                            <div className="font-extrabold text-[#22d3ee] mb-1 font-mono uppercase text-[9px] flex items-center gap-1">
                              <Bot className="w-3 h-3 text-cyan-400" /> Previsão de Rota do DigaBot:
                            </div>
                            <div className="text-slate-300 space-y-1 mt-1 pr-4">
                              {singleAnalysis[rel.id].split("\n").map((line, idx) => {
                                const pt = line.trim();
                                if (pt.startsWith("-") || pt.startsWith("*")) {
                                  return <li key={idx} className="ml-2 list-disc my-0.5">{pt.substring(1).trim()}</li>;
                                }
                                return <p key={idx} className="my-0.5">{pt}</p>;
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
