export interface Article {
  id: string;
  category: "games" | "filmes" | "series" | "animes" | "quadrinhos" | "podcast";
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  views: number;
  likes: number;
  comments: Comment[];
  rating?: number; // reviewer score e.g. 9.5
  tags?: string[];
  videoUrl?: string; // e.g. YouTube URL or video ID for Podcasts/videos
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
}

export interface ReleaseItem {
  id: string;
  title: string;
  category: Article["category"];
  releaseDate: string; // YYYY-MM-DD
  platformOrWhere: string; // Steam, PS5, Netflix, Cinema, Crunchyroll etc
  imageUrl: string;
  hypeCount: number;
}

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "g1",
    category: "games",
    title: "Vazou tudo sobre GTA VI? Novo trailer foca em Vice City debaixo d'agua!",
    excerpt: "Rumores apontam mecânicas submarinas avançadas e expansão inédita do mapa com recifes de corais detalhados.",
    content: `Os fãs de Grand Theft Auto estão em polvorosa esta semana. Informações de fontes internas e dataminers experientes sugerem que a Rockstar Games preparou um fôlego incrível para as águas azuis de Vice City em GTA VI. 

Aparentemente, o jogo contará com uma física marinha hiper-realista, incluindo correntes oceânicas dinâmicas, tempestades marinhas que afetam embarcações menores e uma fauna subaquática tão complexa que rivaliza com simuladores ecológicos independentes.

Rumores afirmam que uma das missões principais envolverá um roubo cinematográfico a um iate afundado nos anos 80, repleto de tesouros de cartéis antigos. O protagonista Lucia terá que gerenciar equipamentos de mergulho de alta tecnologia para navegar em correntes escuras e profundas enquanto evita tubarões-touro agressivos.

A Rockstar não comentou oficialmente, mas fóruns no Reddit já acumulam milhares de análises minuciosas sobre os assets que suportariam essas teorias de exploração de águas profundas.`,
    author: "Felipe 'Kraken' Silva",
    date: "19 de Maio, 2026",
    readTime: "4 min",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    views: 4821,
    likes: 312,
    rating: 9.8,
    tags: ["gta6", "vice-city", "rockstar", "mundo-aberto", "subaquatico"],
    comments: [
      { id: "c1", username: "GamerBr99", avatar: "👾", text: "Vice City precisa de uma praia viva, mal posso esperar para bater jet-ski nos iates dos ricos!", time: "Há 10 min" },
      { id: "c2", username: "Nerd_Cético", avatar: "🧐", text: "Física marinha hiper-realista? Tomara que não seja chato igual guiar o submarino do GTA V.", time: "Há 25 min" }
    ]
  },
  {
    id: "f1",
    category: "filmes",
    title: "O Retorno do Rei: Nova adaptação de Senhor dos Anéis promete focar no Exército dos Mortos",
    excerpt: "Novos conceitos artísticos revelam batalhas expandidas e tons muito mais sombrios para a senda dos mortos.",
    content: `Uma nova produção cinematográfica do universo da Terra Média acaba de ganhar luz verde e trará uma estética de fantasia sombria (dark fantasy). A história será centrada na jornada de Aragorn, Legolas e Gimli pelas profundezas ocultas sob as Montanhas Brancas, detalhando a terrível aliança das sombras com os traidores de Dunharrow.

Segundo relatos do estúdio de design, a nova roupagem visual é inspirada em ilustrações clássicas de horror gótico, mostrando a cidade subterrânea dos mortos como um labirinto fantasmagórico de ossos e pedras ancestrais. 

O diretor escalado comentou: 'Queremos que o público sinta o frio congelante que emana dos jurados quebrados. Na trilogia original, fomos direto à batalha, mas aqui veremos a tortura de séculos dos espíritos que aguardavam o verdadeiro herdeiro de Isildur.' No elenco, grandes nomes do teatro britânico já negociam para dar vozes marcantes e teatrais aos fantasmas de Dunharrow.`,
    author: "Mariana 'Elf' Ramos",
    date: "18 de Maio, 2026",
    readTime: "5 min",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    views: 3120,
    likes: 245,
    rating: 9.2,
    tags: ["senhor-dos-aneis", "lotr", "terra-media", "fantasia-sombria", "cinema"],
    comments: [
      { id: "c3", username: "TolkienLover", avatar: "🧝‍♀️", text: "Dessa vez espero ver o Forte da Trombeta e a canção de Isildur detalhados, por favor!", time: "Há 2 horas" }
    ]
  },
  {
    id: "s1",
    category: "series",
    title: "Sucesso Absoluto: Série live-action de Cyberpunk confirms segunda temporada em Night City",
    excerpt: "Showrunners indicam trama focada nos distritos industriais poluídos de Santo Domingo e novas implantes cerebrais mortais.",
    content: `A aclamada série cyberpunk que arrebatou os espectadores este ano foi renovada para uma segunda temporada explosiva. O anúncio oficial da distribuidora veio acompanhado de um poster dinâmico banhado por luzes de neon azul e magenta, mostrando um implante óptico hackeado brilhando na escuridão.

Os criadores prometeram mergulhar nos becos mais esquecidos de Santo Domingo e Pacifica, mostrando a extrema disparidade social entre os executivos da megacorporação Arasaka e os rebeldes locais.

Novos implantes cibernéticos como o 'Rage-Overclock V3' serão introduzidos na trama, detalhando a rápida e amarga espiral em direção à psicose cibernética dos lutadores clandestino. Além disso, a trilha sonora será composta por DJs e produtores de synthwave underground de Berlim e Tóquio, garantindo a atmosfera perfeita para pancadarias frenéticas no meio da chuva ácida de Night City.`,
    author: "Bruno 'Neon' Aguiar",
    date: "17 de Maio, 2026",
    readTime: "3 min",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    views: 5210,
    likes: 412,
    rating: 9.6,
    tags: ["cyberpunk", "night-city", "scifi", "series", "synthwave"],
    comments: [
      { id: "c4", username: "Netrunner_V", avatar: "🕶️", text: "Trilha sonora pesada de synthwave é um dever de casa cumprido! Mal posso esperar.", time: "Há 1 hora" }
    ]
  },
  {
    id: "a1",
    category: "animes",
    title: "Chainsaw Man: Filme do Arco de Reze quebra recordes de pré-vendas com trailer eletrizante",
    excerpt: "Estúdio MAPPA entrega animação ultradetalhada e cenas de ação fluidas dignas de cinema.",
    content: `O arco de Reze de Chainsaw Man, adaptado para as telonas, causou um frenesi nas bilheterias mundiais logo no primeiro dia de vendas antecipadas. Fóruns de anime indicam que esta é uma das animações mais caras e bem planejadas do estúdio MAPPA dos últimos anos.

O trailer recém lançado mostrou mais do relacionamento inusitado entre Denji e a misteriosa garota da cafeteria, Reze. No entanto, o ápice são os cortes dinâmicos de animação tradicional combinados com efeitos digitais 3D que criam a espetacular coreografia de explosões e lâminas cortantes ao luar.

Especialistas da indústria de animação ressaltaram a impressionante física de fluidos e fogo implementada nas cenas de destruição urbana, prometendo uma experiência imersiva sem paralelos nos cinemas IMAX.`,
    author: "Aline 'Otaku' Costa",
    date: "16 de Maio, 2026",
    readTime: "4 min",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    views: 6540,
    likes: 580,
    rating: 9.7,
    tags: ["chainsaw-man", "anime", "mappa", "shonen", "reze", "cinema"],
    comments: [
      { id: "c5", username: "DenjiKun", avatar: "🪚", text: "Vou assistir na estreia, com certeza! O MAPPA acertou demais na paleta de cores da Reze.", time: "Há 5 min" }
    ]
  },
  {
    id: "q1",
    category: "quadrinhos",
    title: "Futuro Distópico de Spawn é anunciado pela Image Comics em nova minissérie espetacular",
    excerpt: "Inspirada no cyberpunk, minissérie trará Al Simmons lutando no ano 2099 contra ciborgues infernais.",
    content: `O criador de Spawn anunciou uma reinterpretação revolucionária do soldado dos infernos. Em 'Spawn 2099', o clássico manto se funde com nanotecnologia biológica para enfrentar uma corporação corporativa corrupta controlada por anjos mercenários ciborgues.

A arte ficará a cargo de novatos célebres do cenário independente europeu, que trazem um traço agressivo e sombrio com cores frias contrastadas por lodo estigio luminoso e cabos de fibra óptica derramando ectoplasma pelas sarjetas.

Segundo o roteiro, Spawn não usará apenas poderes demoníacos tradicionais, mas precisará infundir seu traje com circuitos digitais de carbono para invadir os servidores criptografados da corporação celestial 'Halo-Tech'.`,
    author: "Gustavo 'Comic' Neto",
    date: "15 de Maio, 2026",
    readTime: "3 min",
    imageUrl: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&w=800&q=80",
    views: 2901,
    likes: 198,
    rating: 8.9,
    tags: ["spawn", "quadrinhos", "cyberpunk", "scifi", "image-comics", "geek"],
    comments: [
      { id: "c6", username: "AlSimmonsFan", avatar: "💀", text: "Spawn futurista cyberpunk? Comprei a ideia num piscar de olhos! Essa arte tá insana.", time: "Há 3 horas" }
    ]
  },
  {
    id: "p1",
    category: "podcast",
    title: "DigaCast #42: O Futuro da Realidade Virtual e o Destino dos Consolas Físicos",
    excerpt: "No episódio de hoje, debatemos o poder da imersão em RV e se as telas micro-OLED vão finalmente substituir as televisões convencionais.",
    content: `Sejam bem-vindos ao DigaCast, o seu ponto de encontro semanal para discutir tudo o que há de mais quente no universo geek!

No episódio de hoje, nossos hosts debatem as novas fronteiras da Realidade Virtual (RV). Com o lançamento iminente de novos óculos de imersão de baixo custo e telas micro-OLED hiper-realistas, a pergunta que não quer calar é: estamos finalmente próximos de um mundo no estilo do filme Jogador Nº 1 (Ready Player One)?

Também trouxemos convidados especiais da indústria de games independentes para analisar até onde o poder de processamento na nuvem pode ditar os consoles da próxima década. Será que os consoles físicos irão desaparecer completamente para dar lugar ao streaming puramente descentralizado?

Coloque seu fone de ouvido espacial, prepare a bebida e venha conosco nessa viagem cibernética pelos canais de áudio da DigaNews. Disponível completo no player acoplado ou nas plataformas de streaming parceiras!`,
    author: "Equipe DigaCast",
    date: "21 de Maio, 2026",
    readTime: "12 min de áudio",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    views: 1245,
    likes: 98,
    rating: 9.5,
    tags: ["podcast", "vr", "digacast", "novidade", "tecnologia"],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    comments: [
      { id: "c_p1", username: "CastLover", avatar: "🎧", text: "Esse episódio resumiu perfeitamente minhas dúvidas sobre os novos painéis micro-OLED. Sensacional!", time: "Há 4 horas" }
    ]
  }
];

const getRelativeDateStr = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const RELEASES_CALENDAR: ReleaseItem[] = [
  {
    id: "r-today",
    title: "The Witcher 4: Polaris (Teaser Oficial)",
    category: "games",
    releaseDate: getRelativeDateStr(0),
    platformOrWhere: "YouTube & Steam",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
    hypeCount: 7850
  },
  {
    id: "r-yesterday",
    title: "Demon Slayer: Infinity Castle Movie 1",
    category: "animes",
    releaseDate: getRelativeDateStr(-1),
    platformOrWhere: "Cinema (Crunchyroll)",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80",
    hypeCount: 9110
  },
  {
    id: "r-expired",
    title: "Minecraft 2 (Beta Fechada)",
    category: "games",
    releaseDate: getRelativeDateStr(-3),
    platformOrWhere: "Microsoft Store",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80",
    hypeCount: 15400
  },
  {
    id: "r1",
    title: "Grand Theft Auto VI",
    category: "games",
    releaseDate: "2026-10-15",
    platformOrWhere: "PS5, Xbox Series X/S",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
    hypeCount: 9422
  },
  {
    id: "r2",
    title: "Doom Eternal sequel (The Dark Ages)",
    category: "games",
    releaseDate: "2026-06-20",
    platformOrWhere: "PC, PS5, Xbox",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80",
    hypeCount: 5210
  },
  {
    id: "r3",
    title: "Spider-Man: Beyond the Spider-Verse",
    category: "filmes",
    releaseDate: "2026-07-03",
    platformOrWhere: "Estreia nos Cinemas",
    imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=400&q=80",
    hypeCount: 8812
  },
  {
    id: "r4",
    title: "Solo Leveling - Temporada 2",
    category: "animes",
    releaseDate: "2026-08-11",
    platformOrWhere: "Crunchyroll",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80",
    hypeCount: 6750
  },
  {
    id: "r5",
    title: "Daredevil: Born Again (T2)",
    category: "series",
    releaseDate: "2026-09-02",
    platformOrWhere: "Disney+",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    hypeCount: 4120
  }
];

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const FALLBACK_QUIZZES: { [key: string]: QuizQuestion[] } = {
  "Geral": [
    {
      question: "Qual o nome da inteligência artificial que auxilia Tony Stark após o falecimento de JARVIS?",
      options: ["FRIDAY", "EDITH", "LISA", "HAL"],
      answerIndex: 0,
      explanation: "FRIDAY (Sexta-Feira) assume o controle das armaduras do Homem de Ferro a partir de Vingadores: Era de Ultron."
    },
    {
      question: "Qual deste estúdio produziu o jogo Elden Ring?",
      options: ["Ubisoft", "CD Projekt Red", "FromSoftware", "Bethesda"],
      answerIndex: 2,
      explanation: "Elden Ring é a obra-prima eletrizante desenvolvida pela FromSoftware e dirigida por Hidetaka Miyazaki."
    },
    {
      question: "Em qual clássico anime de ficção científica encontramos a moto vermelha futurista de Kaneda?",
      options: ["Neon Genesis Evangelion", "Akira", "Ghost in the Shell", "Cowboy Bebop"],
      answerIndex: 1,
      explanation: "A moto vermelha de Kaneda tornou-se um dos maiores ícones da cultura pop e do cyberpunk no filme Akira, de 1988."
    }
  ],
  "Animes": [
    {
      question: "Qual é o objetivo principal de Tanjiro Kamado em Demon Slayer?",
      options: ["Tornar-se o Rei dos Demônios", "Ganhar o torneio das artes marciais", "Curar sua irmã Nezuko de volta à forma humana", "Achar o tesouro escondido"],
      answerIndex: 2,
      explanation: "Tanjiro junta-se à corporação após ter sua família massacrada pelos Onis, focando obstinadamente em restabelecer a humanidade da Nezuko."
    }
  ],
  "Games": [
    {
      question: "Quem é o mascote oficial e herói da clássica franquia Halo?",
      options: ["Marcus Fenix", "Master Chief", "Doom Slayer", "Samus Aran"],
      answerIndex: 1,
      explanation: "Master Chief (John-117) é o supersoldado cibernético espartano ícone da franquia de ficção científica Halo da Xbox."
    }
  ]
};
