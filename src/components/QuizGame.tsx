import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, RefreshCw, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, BookOpen, BrainCircuit } from "lucide-react";
import { FALLBACK_QUIZZES, QuizQuestion } from "../data";

export default function QuizGame() {
  const [topic, setTopic] = useState("Geral");
  const [customTopic, setCustomTopic] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>(FALLBACK_QUIZZES["Geral"]);
  
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [scoredPoints, setScoredPoints] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Generate customized quiz via AI
  const handleGenerateAIQuiz = async (topicTitle: string) => {
    if (!topicTitle.trim()) return;
    setLoading(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScoredPoints(0);
    setQuizFinished(false);
    setShowExplanation(false);

    try {
      const response = await fetch("/api/gemini/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
        setTopic(topicTitle);
      } else {
        alert("O místico portal de IA oscilou! Carregando quiz padrão.");
        setQuestions(FALLBACK_QUIZZES["Geral"]);
        setTopic("Geral");
      }
    } catch {
      alert("Falha ao conjurar quiz por IA. Carregando quiz de contingência padrão.");
      setQuestions(FALLBACK_QUIZZES["Geral"]);
      setTopic("Geral");
    } finally {
      setLoading(false);
    }
  };

  const selectPredefinedTopic = (name: string) => {
    setTopic(name);
    setQuestions(FALLBACK_QUIZZES[name] || FALLBACK_QUIZZES["Geral"]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScoredPoints(0);
    setQuizFinished(false);
    setShowExplanation(false);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent double clicking
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    if (optionIndex === questions[currentIndex].answerIndex) {
      setScoredPoints((p) => p + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const activeQuestion = questions[currentIndex];

  return (
    <div className="bg-[#191d24] border border-[#242b35] rounded-2xl overflow-hidden shadow-2xl">
      {/* Quiz Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase bg-purple-900/60 px-2.5 py-1 rounded-full border border-purple-800/40 font-bold flex items-center gap-1 w-max">
            <BrainCircuit className="w-3 h-3 text-purple-300 animate-pulse" />
            Arena de Curiosidades
          </span>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            Quiz Geek Interativo <span className="text-sm font-normal text-purple-300 font-mono">({topic})</span>
          </h2>
          <p className="text-xs text-purple-200 mt-1">Gere novos quizzes de IA sobre QUALQUER assunto geek no campo abaixo!</p>
        </div>

        {/* AI Generator Search/Bar */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <input
            id="quiz-custom-topic-input"
            type="text"
            placeholder="Qualquer tema geek (Ex: Naruto, Zelda...)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="bg-black/40 border border-purple-800 text-xs px-3 py-2 rounded-lg text-white placeholder-purple-300/60 focus:outline-none focus:border-purple-400 w-full sm:w-56"
          />
          <button
            id="generate-ai-quiz-btn"
            onClick={() => handleGenerateAIQuiz(customTopic)}
            disabled={loading || !customTopic.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-purple-900/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? "Invocando..." : "Gerar com IA"}
          </button>
        </div>
      </div>

      {/* Sub Category selectors */}
      <div className="bg-[#101317] px-6 py-3 border-b border-[#242b35] flex items-center gap-3 overflow-x-auto">
        <span className="text-xs text-gray-400 font-semibold shrink-0">Temas Prontos:</span>
        {Object.keys(FALLBACK_QUIZZES).map((name) => (
          <button
            key={name}
            id={`quiz-theme-btn-${name}`}
            onClick={() => selectPredefinedTopic(name)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              topic === name
                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                : "bg-transparent border-[#242b35] hover:border-gray-600 text-gray-400 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Main Sandbox */}
      <div className="p-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
              <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-b-cyan-400 animate-ping opacity-40" />
            </div>
            <p className="text-sm font-semibold text-purple-300 font-mono animate-pulse">Consultando oráculos do Gemini...</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm text-center font-mono">
              "Estruturando perguntas em tempo real, gerando alternativas e explicações divertidas..."
            </p>
          </div>
        ) : quizFinished ? (
          <div className="py-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-950/40 text-purple-400 border border-purple-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quiz Concluído!</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Você completou a jornada de perguntas sobre <span className="text-purple-300 font-semibold">{topic}</span>.
            </p>

            {/* Score box */}
            <div className="bg-purple-950/20 border border-purple-900/60 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Pontuação Final</p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {scoredPoints} / <span className="text-purple-400">{questions.length}</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {scoredPoints === questions.length 
                  ? "🧙‍♂️ Rank: Mago Supremo da Cultura Pop! Sensacional!"
                  : scoredPoints >= questions.length / 2 
                    ? "🎮 Rank: Veterano Conhecedor! Mandou bem!"
                    : "👾 Rank: Aprendiz de Hobbit! Continue lendo o DigaNews!"}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                id="retry-quiz-btn"
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setScoredPoints(0);
                  setQuizFinished(false);
                  setShowExplanation(false);
                }}
                className="bg-[#1e232d] hover:bg-[#282e3c] border border-[#2b3341] text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 text-gray-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refazer Este
              </button>
              <button
                id="generate-another-quiz-btn"
                onClick={() => handleGenerateAIQuiz(topic)}
                className="bg-purple-600 hover:bg-purple-500 text-xs font-semibold px-4 py-2.5 rounded-lg text-white transition-colors"
              >
                Outro com AI
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2 font-mono">
                <span>Pergunta {currentIndex + 1} de {questions.length}</span>
                <span className="text-purple-400">{Math.round(((currentIndex + 1) / questions.length) * 100)}% concluído</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300" 
                  style={{ width: `${((currentIndex + 1)/questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-5 bg-gradient-to-b from-[#1c222c] to-[#12161d] rounded-2xl border border-[#232936] flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 font-bold font-mono text-sm">
                Q
              </div>
              <p className="text-sm font-medium text-white leading-relaxed pt-1">
                {activeQuestion.question}
              </p>
            </div>

            {/* Alternatives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === activeQuestion.answerIndex;
                const showCorrectColor = selectedAnswer !== null && isCorrect;
                const showWrongColor = selectedAnswer !== null && isSelected && !isCorrect;

                let btnClass = "bg-[#161a23] border-[#222a36] hover:border-purple-600 hover:bg-[#1a202c] text-gray-300";
                if (showCorrectColor) {
                  btnClass = "bg-emerald-950/30 border-emerald-500 text-emerald-200";
                } else if (showWrongColor) {
                  btnClass = "bg-rose-950/30 border-rose-500 text-rose-200";
                } else if (selectedAnswer !== null) {
                  btnClass = "bg-[#161a23]/40 border-[#222a36]/50 text-gray-500 cursor-not-allowed";
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-option-${idx}`}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`p-3.5 text-xs text-left rounded-xl border transition-all flex justify-between items-center gap-2 ${btnClass}`}
                  >
                    <span>{idx + 1}. {option}</span>
                    {selectedAnswer !== null && (
                      <span className="shrink-0">
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fun Gemini Explanation of Answers */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs"
                >
                  <div className="flex gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-indigo-300">Explicação:</p>
                      <p className="text-gray-300 mt-1 leading-relaxed">
                        {activeQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions */}
            {selectedAnswer !== null && (
              <div className="flex justify-end pt-2 border-t border-[#242b35]">
                <button
                  id="quiz-next-question-btn"
                  onClick={handleNextQuestion}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {currentIndex + 1 < questions.length ? "Próxima Pergunta" : "Ver Resultados"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
