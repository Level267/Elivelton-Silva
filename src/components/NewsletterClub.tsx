import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, Sparkles, Flame, Shield, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function NewsletterClub() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [interests, setInterests] = useState<string[]>(["🎮 Jogos"]);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("diganews_newsletter_vip");
    if (saved) {
      setSuccess(true);
      setSubscribedEmail(saved);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      return;
    }
    
    // Save to local storage for premium native loyalty
    localStorage.setItem("diganews_newsletter_vip", email.trim());
    setSubscribedEmail(email.trim());
    setSuccess(true);
  };

  const handleUnsubscribe = () => {
    localStorage.removeItem("diganews_newsletter_vip");
    setEmail("");
    setSuccess(false);
    setSubscribedEmail(null);
  };

  const toggleInterest = (val: string) => {
    if (interests.includes(val)) {
      setInterests(prev => prev.filter(item => item !== val));
    } else {
      setInterests(prev => [...prev, val]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0c0d12] to-[#12141d] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Visual decoration */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-purple-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-2xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="subscribe-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="p-1 px-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  🌟 CLUBE VIP DIGANEWS
                </span>
                <span className="text-slate-500 text-[10px]">• Recibos Semanais Cósmicos</span>
              </div>
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-wide">
                Fique Sabendo de Tudo Antes de Todo Mundo!
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Una-se a mais de <strong className="text-white">42.800 corajosos aventureiros</strong>. Receba cupons secretos de chaves Steam, vazamentos de roteiros da Marvel, alertas de animes raros e as crônicas do DigaBot no seu e-mail cósmico.
              </p>
            </div>

            {/* Custom checkboxes designed in modern capsules */}
            <div className="space-y-1.5 label-container">
              <label className="text-[9px] font-mono uppercase font-bold text-slate-450 block">Escolha seus Setores de Interesse:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "🎮 Jogos", id: "int-games" },
                  { value: "🎬 Filmes", id: "int-films" },
                  { value: "📺 Séries", id: "int-series" },
                  { value: "👾 Animes", id: "int-animes" }
                ].map((item) => {
                  const active = interests.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      id={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.value)}
                      className={`py-1 px-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-wide cursor-pointer ${
                        active
                          ? "bg-slate-900 border border-cyan-400 text-cyan-400 font-extrabold"
                          : "bg-slate-950 border border-white/5 text-slate-500 hover:text-white"
                      }`}
                    >
                      {item.value}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-1.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="newsletter-vip-email-input"
                  type="email"
                  required
                  placeholder="Seu melhor e-mail (Ex: tony@stark.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#08090d] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>

              <button
                id="btn-subscribe-newsletter"
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0"
              >
                Sumonar Convite
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Garantia de Antivírus Spam: Seu e-mail não será enviado ao sindicato de Vilões.</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subscribe-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-3.5 py-4"
          >
            <div className="w-12 h-12 bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> ACESSO VIP CONCEDIDO!
              </h4>
              <p className="text-xs text-slate-350 max-w-sm leading-relaxed">
                Parabéns! O e-mail <strong className="text-cyan-300 font-mono font-normal">{subscribedEmail}</strong> foi indexado ao nosso núcleo cibernético.
              </p>
            </div>

            <div className="px-4 py-2 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] font-mono text-slate-500">SETORES SINTONIZADOS:</p>
              <div className="flex gap-1.5 justify-center">
                {interests.map(i => (
                  <span key={i} className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                    {i}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 items-center justify-center pt-2">
              <p className="text-[10px] text-slate-500 font-mono">Próxima entrega: <span className="text-emerald-400">Terça-feira, às 09:00 AM</span></p>
              <button
                id="btn-unsubscribe-newsletter"
                onClick={handleUnsubscribe}
                className="text-[9px] font-mono text-rose-500 hover:underline cursor-pointer"
              >
                Alternar e-mail
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
