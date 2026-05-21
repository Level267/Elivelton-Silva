import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Music, HelpCircle, Info, Sparkles, Sliders } from "lucide-react";

export default function GamerSynth() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthType, setSynthType] = useState<"sine" | "triangle" | "sawtooth">("sine");
  const [volume, setVolume] = useState(0.2); // 0 to 1
  const [frequency, setFrequency] = useState(110); // Standard space bass frequency (A2)
  const [ambientBeat, setAmbientBeat] = useState(false);
  const [statusMessage, setStatusMessage] = useState("O oscilador está adormecido no hangar.");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null); // For rich cyberpunk harmony
  const gainNodeRef = useRef<GainNode | null>(null);
  const pulseIntervalRef = useRef<any>(null);

  // Initialize audio context lazily on user interaction (safely)
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const startSynth = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create primary oscillator for thick bass drone
      const osc = ctx.createOscillator();
      osc.type = synthType;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Create secondary harmony oscillator for cosmic chorusing
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime); // Perfect fifth harmony!

      // Create master gain node
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

      // Connect nodes
      osc.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Save references
      oscRef.current = osc;
      osc2Ref.current = osc2;
      gainNodeRef.current = gainNode;

      // Start oscillators
      osc.start();
      osc2.start();
      setIsPlaying(true);
      setStatusMessage("🛸 Drone cósmico sintonizado de forma analógica!");

      // If Lofi beat is active, start pulsing the volume slightly like sidechained compression
      if (ambientBeat) {
        startPulsing(gainNode, ctx);
      }
    } catch (err: any) {
      console.error("Synthesizer initialization error:", err);
      setStatusMessage("Erro de áudio: O dispositivo bloqueou o canal analógico.");
    }
  };

  const stopSynth = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (err) {}
      oscRef.current = null;
    }
    if (osc2Ref.current) {
      try {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
      } catch (err) {}
      osc2Ref.current = null;
    }
    setIsPlaying(false);
    setStatusMessage("O silêncio absoluto reina no vácuo.");
  };

  const startPulsing = (gainNode: GainNode, ctx: AudioContext) => {
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);

    let low = true;
    pulseIntervalRef.current = setInterval(() => {
      if (gainNode && ctx) {
        const targetVol = low ? volume * 0.15 : volume * 0.6;
        gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.25);
        low = !low;
      }
    }, 500); // 120 NPM Sidechain simulation style
  };

  const handleToggle = () => {
    if (isPlaying) {
      stopSynth();
    } else {
      startSynth();
    }
  };

  // Dynamically update synthesizer volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.5, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Dynamically update frequency/pitch
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    }
    if (osc2Ref.current && audioCtxRef.current) {
      osc2Ref.current.frequency.setValueAtTime(frequency * 1.5, audioCtxRef.current.currentTime);
    }
  }, [frequency]);

  // Dynamically update oscillator type
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.type = synthType;
    }
  }, [synthType]);

  // Pulse volume beat listener
  useEffect(() => {
    if (isPlaying && gainNodeRef.current && audioCtxRef.current) {
      if (ambientBeat) {
        startPulsing(gainNodeRef.current, audioCtxRef.current);
        setStatusMessage("🥁 Batida Synthwave acoplada ao drone!");
      } else {
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
        }
        gainNodeRef.current.gain.setValueAtTime(volume * 0.5, audioCtxRef.current.currentTime);
        setStatusMessage("🛸 Retornando ao drone plano analógico.");
      }
    }
  }, [ambientBeat]);

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, []);

  return (
    <div className="bg-[#111318] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Absolute design aesthetic grids */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl pointer-events-none" />

      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5 font-mono">
          <Music className={`w-3.5 h-3.5 text-cyan-400 ${isPlaying ? "animate-spin" : ""}`} />
          Sintonia Sonora Geek
        </h4>
        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
          isPlaying ? "bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 animate-pulse" : "bg-slate-900 border border-white/5 text-slate-500"
        }`}>
          {isPlaying ? "Online (Analógico)" : "Offline"}
        </span>
      </div>

      <p className="text-[10.5px] text-slate-400 leading-relaxed mb-4">
        Gere ondas sintetizadas para focar sua leitura geek nos portais de notícias! Totalmente gerado em tempo real pelo seu browser.
      </p>

      {/* Main Play/Stop and type selection */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            id="btn-play-synth"
            type="button"
            onClick={handleToggle}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              isPlaying
                ? "bg-rose-950/40 border-rose-500 text-rose-300 hover:bg-rose-900/50"
                : "bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-500 text-black border-cyan-400"
            }`}
          >
            {isPlaying ? "🔇 Silenciar Ondas" : "🔊 Ligar Oscilador"}
          </button>

          <button
            id="btn-synth-beat"
            type="button"
            onClick={() => setAmbientBeat(!ambientBeat)}
            className={`px-3 py-2 text-xs font-black uppercase rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
              ambientBeat
                ? "bg-purple-950/40 border-purple-500 text-purple-300"
                : "bg-slate-950 border-white/5 text-slate-400 hover:bg-[#1f2533]"
            }`}
            title="Sincronizar efeito de batida Sidechain lofi"
          >
            <Sparkles className={`w-3.5 h-3.5 ${ambientBeat ? "text-purple-400" : ""}`} />
            {ambientBeat ? "Batida ON" : "Batida OFF"}
          </button>
        </div>

        {/* Synthesizer Customizer Controls */}
        <div className="bg-[#0c0d10] border border-white/5 p-3 rounded-xl space-y-3">
          {/* Waves Selection */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 flex items-center gap-1">
              <Sliders className="w-2.5 h-2.5" /> Tipo de Onda:
            </span>
            <div className="flex gap-1 bg-slate-950 p-0.5 rounded border border-white/5">
              {(["sine", "triangle", "sawtooth"] as const).map((type) => (
                <button
                  key={type}
                  id={`btn-synth-type-${type}`}
                  type="button"
                  onClick={() => setSynthType(type)}
                  className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded font-mono transition-all cursor-pointer ${
                    synthType === type
                      ? "bg-slate-800 text-cyan-400 font-black"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {type === "sine" ? "Seno" : type === "triangle" ? "Tri" : "Serra"}
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider for Pitch Frequency */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span>🎚️ Frequência (Foco):</span>
              <span className="text-cyan-400 font-bold">{frequency} Hz ({frequency < 90 ? "Sub-grave" : frequency < 150 ? "Barítono Cósmico" : "Tepes"})</span>
            </div>
            <input
              id="slider-synth-pitch"
              type="range"
              min="55"
              max="220"
              step="5"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              disabled={!isPlaying}
              className="w-full accent-cyan-500 h-1 bg-slate-950 rounded-lg cursor-pointer checked:bg-cyan-500 disabled:opacity-30"
            />
          </div>

          {/* Volume Control */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                {volume === 0 ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />} Volume Máster:
              </span>
              <span className="text-purple-400 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              id="slider-synth-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer checked:bg-purple-500"
            />
          </div>
        </div>

        {/* Oscillating digital logger message */}
        <div className="p-2 border border-dashed border-white/5 bg-[#08090c] rounded-lg">
          <p className="text-[10px] font-mono text-center text-[#d97706]">
            📟 STATUS: {statusMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
