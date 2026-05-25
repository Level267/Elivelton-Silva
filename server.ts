import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { INITIAL_ARTICLES, Article } from "./src/data";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS so external sites can load articles as sintonizadas by the user
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Simple in-memory synchronized database for sintonizadas articles
let serverArticles: Article[] = [...INITIAL_ARTICLES];

// GET: Load sintonizadas articles simultaneously
app.get("/api/articles", (req, res) => {
  res.json(serverArticles);
});

// POST: Register a new sintonizada article
app.post("/api/articles", (req, res) => {
  const newArticle = req.body;
  if (!newArticle || !newArticle.id) {
    res.status(400).json({ error: "Invalid article data" });
    return;
  }
  const exists = serverArticles.find(art => art.id === newArticle.id);
  if (!exists) {
    serverArticles = [newArticle, ...serverArticles];
  }
  res.json({ success: true, article: newArticle });
});

// PUT: Update a sintonizada article
app.put("/api/articles/:id", (req, res) => {
  const { id } = req.params;
  const updatedArticle = req.body;
  if (!updatedArticle) {
    res.status(400).json({ error: "Invalid article data" });
    return;
  }
  serverArticles = serverArticles.map(art => art.id === id ? updatedArticle : art);
  res.json({ success: true, article: updatedArticle });
});

// DELETE: Remove a sintonizada article
app.delete("/api/articles/:id", (req, res) => {
  const { id } = req.params;
  serverArticles = serverArticles.filter(art => art.id !== id);
  res.json({ success: true });
});

// Initialize Gemini Client Lazily/Safely to avoid crashing if API key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please supply it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Custom Geek Summary or Debate
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { title, content, style } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required." });
      return;
    }

    const gemini = getGemini();
    
    let prompt = "";
    if (style === "geek") {
      prompt = `Resuma a seguinte notícia gamer/geek em um parágrafo cheio de gírias geeks, referências de cultura pop e memes nerd. Termine com uma piada curta ou trocadilho relacionado.\nTítulo: ${title}\nConteúdo: ${content}`;
    } else if (style === "debate") {
      prompt = `Crie duas posições conflitantes e divertidas (um geek que AMOU e um fã cético irritado que RECLAMA de tudo) disputando sobre este fato. Retorne em formato dialogado curto e bem-humorado.\nTítulo: ${title}\nConteúdo: ${content}`;
    } else {
      prompt = `Faça um resumo rápido, direto e informativo em tópicos (bullet points) para um fã que quer ler as notícias principais em 15 segundos.\nTítulo: ${title}\nConteúdo: ${content}`;
    }

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ output: response.text });
  } catch (error: any) {
    console.error("Gemini summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI summary." });
  }
});

// 2. API: Dynamic Quiz Generator
app.post("/api/gemini/generate-quiz", async (req, res) => {
  try {
    const { topic, difficulty = "Médio" } = req.body;
    if (!topic) {
      res.status(400).json({ error: "Topic is required." });
      return;
    }

    const gemini = getGemini();
    const prompt = `Gere 5 perguntas de múltipla escolha interativas, criativas e divertidas em português brasileiro sobre o tema: ${topic}. 
    A dificuldade desejada para as perguntas é: **${difficulty}** (fácil, médio ou difícil).
    Guia de elaboração de perguntas por dificuldade:
    - fácil: perguntas simples, engraçadas e amplamente conhecidas sobre o tema, amigável para curiosos e casuais.
    - médio: curiosidades que requerem conhecimento padrão de quem realmente consumiu/jogou/assistiu a obra.
    - difícil: perguntas sobre lore profundo, segredos dos bastidores, datas, referências ocultas ou detalhes ultra-específicos para fãs hardcore e especialistas!
    Retorne estritamente um JSON estruturado seguindo as regras explicadas, sem formatações adicionais de markdown (não use blocos de código markdown ou crases, apenas o JSON puro).`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Lista de perguntas do quiz",
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "O texto da pergunta geek"
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array de exatamente 4 alternativas"
              },
              answerIndex: {
                type: Type.INTEGER,
                description: "O índice da resposta correta dentro do array (0 a 3)"
              },
              explanation: {
                type: Type.STRING,
                description: "Uma explicação curta e divertida sobre o porquê da resposta estar certa"
              }
            },
            required: ["question", "options", "answerIndex", "explanation"]
          }
        }
      }
    });

    res.json({ quiz: JSON.parse(response.text || "[]") });
  } catch (error: any) {
    console.error("Gemini quiz error:", error);
    res.status(500).json({ error: error.message || "Failed to generate dynamic quiz." });
  }
});

// 3. API: Assistant Advisor / Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, articleContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const gemini = getGemini();

    const systemInstruction = `Você é o DigaBot, o assistente virtual oficial e mascote geek brincalhão do portal de notícias DigaNews. 
    Seu tom é extremamente amigável, entusiasmado, entupido de referências nerds (Star Wars, Marvel, Animes, Games, RPG de mesa, Senhor dos Anéis). 
    Sempre fale em português brasileiro. Use emojis geeks apropriados 🕹️👾🐉⚡🎬.
    Se o usuário estiver visualizando uma notícia específica em tela, você receberá esse contexto. Use-o para puxar assunto, debater ou responder dúvidas se solicitado pelo usuário.
    ${articleContext ? `\nContexto da notícia atual que o usuário está lendo: "${articleContext}"` : ""}`;

    // Map historical messages into Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve reply." });
  }
});

// 4. API: Generate Comic/Meme Card Illustration
app.post("/api/gemini/generate-cover-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const gemini = getGemini();
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `High-quality artistic geek comic book cover illustration or cartoon about: "${prompt}". Pop art style, vibrant colors, defined ink outlines, comic style, poster concept, highly styled visual graphic, no frame, pure graphic artwork.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
    } else {
      res.status(500).json({ error: "No image content was returned from model." });
    }
  } catch (error: any) {
    console.error("Gemini image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// 5. API: Hype Report Analyzer
app.post("/api/gemini/hype-report", async (req, res) => {
  try {
    const { releases } = req.body;
    if (!releases || !Array.isArray(releases)) {
      res.status(400).json({ error: "Releases array is required." });
      return;
    }

    const gemini = getGemini();
    const releasesSummary = releases
      .map((r: any) => `- **${r.title}** (${r.category}), lançamento: ${r.releaseDate} no canal/local **${r.platformOrWhere}**, índice de Hype: **${r.hypeCount} chamas** 🔥`)
      .join("\n");

    const promptText = `Você é o DigaBot, o analista oficial de Hype Cósmico e mestre supremo do Portal DigaNews.
    Analise a lista de próximos lançamentos de forma super nerd, empolgada, espirituosa, e com muitas analogias geeks engraçadas.
    
    Escreva um Boletim sobre a Onda de Hype de Lançamentos composto de:
    1. 👑 O REI DO HYPE: Encontre o item da lista com MAIOR "hypeCount" (chamas). Faça piada, preveja se os servidores vão cair ou os ingressos vão esgotar em 2 segundos e use gírias nerds engraçadas.
    2. 💎 JOIA SECRETA DO SUBSOLO: Escolha um dos itens da lista de menor hype (com menor "hypeCount") e argumente por que o mundo está dormindo num tesouro.
    3. 🌡️ HIGIENE TERMÔMETRO DE HYPE: Dê uma nota fictícia engraçada para o estado geral de empolgação mundial com esses anúncios (Ex: 'Nível 10 Super Saiyajin' ou 'Freezer no Zero Absoluto de Hoth').
    4. 🔮 DICA CÓSMICA DO DIGABOT: Um conselho bem engraçado para os nerds ansiosos sobreviverem até a data de estreia!

    Escreva em PORTUGUÊS BRASILEIRO com formatação markdown rica, usando negritos, cabeçalhos amigáveis, listas organizadas e muitos emojis geeks. Seja divertido, carismático e entusiasmado!

    Lista de lançamentos:
    ${releasesSummary}`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error("Gemini hype-report error:", error);
    res.status(500).json({ error: error.message || "Falha ao gerar o relatório geral de hype cósmico." });
  }
});

// 6. API: Predict Single Release Hype Veredict
app.post("/api/gemini/analyze-release", async (req, res) => {
  try {
    const { title, category, releaseDate, platformOrWhere } = req.body;
    if (!title) {
      res.status(400).json({ error: "Title is required." });
      return;
    }

    const gemini = getGemini();
    const promptText = `Você é o DigaBot, conselheiro de viagens espaciais de tempo e sintonizador de portais geeks do DigaNews.
    Faça uma previsão bem-humorada sobre este lançamento específico:
    - Obra: "${title}"
    - Tipo: "${category || 'Geral'}"
    - Data prevista: "${releaseDate || 'Temporalmente Flutuante'}"
    - Destino/Plataforma: "${platformOrWhere || 'Nenhum canal sintonizável'}"
    
    Analise as chances dele se tornar um "Clássico Supremo Digno de Estátua" ou um "Flop Atômico dos Becos de Night City". 
    Determine um "Percentual de Sucesso" bem exagerado e crie um veredito humorístico em até 4 parágrafos pequenos. Use do maior teor nerd e referências divertidas! Fale em português brasileiro brasileiro e coloque emojis.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini analyze-release error:", error);
    res.status(500).json({ error: error.message || "Falha ao analisar o hype do lançamento." });
  }
});

// Serve frontend assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DigaNews] Server listening and ready on http://0.0.0.0:${PORT}`);
  });
}

start();
