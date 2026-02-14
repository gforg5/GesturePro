
import React, { useState, useCallback, useRef } from 'react';
import { 
  Box, 
  X, 
  Eye, 
  FolderOpen,
  BoxSelect,
  Hand,
  Scissors,
  Zap
} from 'lucide-react';
import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import { AppState, GestureType, HolographicColor } from './types';
import { GESTURE_DESCRIPTIONS, HOLOGRAPHIC_COLORS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    gesture: GestureType.NONE,
    isControlsVisible: true,
    isHolographic: true,
    holographicColor: 'blue',
    opacity: 0.6,
    addDepth: false,
    assetUrl: null,
    assetType: null
  });

  // Performance optimization: use Ref for coordinates to avoid re-rendering the whole App on every hand move
  const handPosRef = useRef({ x: 0.5, y: 0.5 });

  const handleGestureUpdate = useCallback((gesture: GestureType, position: { x: number; y: number }) => {
    // Only update state if gesture changed to reduce re-renders
    setAppState(prev => {
      if (prev.gesture === gesture) return prev;
      return { ...prev, gesture };
    });
    
    // Update ref immediately (no lag)
    handPosRef.current = position;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAppState(prev => ({
        ...prev,
        assetUrl: url,
        assetType: type
      }));
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none text-white">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene appState={appState} handPosRef={handPosRef} />
      </div>

      {/* Header - Updated to MOHSIN AI */}
      <div className="absolute top-8 left-0 right-0 flex flex-col items-center pointer-events-none z-20">
        <h1 className="text-4xl font-black tracking-[0.2em] text-[#0ef] drop-shadow-[0_0_15px_rgba(0,238,255,0.9)]">
          MOHSIN AI
        </h1>
        <p className="text-[10px] tracking-[0.4em] text-white/60 mt-2 uppercase">Gesture Intelligence System</p>
      </div>

      {/* Left Sidebar */}
      {appState.isControlsVisible && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[280px] bg-[#121214]/90 backdrop-blur-md border border-white/10 z-30 p-5 rounded-lg flex flex-col gap-5 hud-glow pointer-events-auto shadow-2xl transition-all">
          
          <div className="text-center">
            <div className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase mb-3">Mode: Studio Render</div>
            <button 
              onClick={() => setAppState(s => ({ ...s, isControlsVisible: false }))}
              className="w-full bg-[#1a1a1c] border border-white/10 py-2 text-[10px] text-white/80 hover:bg-white/10 transition-all flex items-center justify-center gap-2 rounded uppercase font-bold"
            >
              <X size={14} className="text-red-500" /> Hide Controls
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <h2 className="text-[9px] text-white/40 font-bold mb-3 uppercase tracking-tighter">Visual Data</h2>
              <div className="flex flex-col gap-2">
                <label className="w-full cursor-pointer bg-[#1a1a1c] border border-white/5 py-2 px-4 rounded text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/80">
                  <FolderOpen size={14} className="text-yellow-500" /> Load Images
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                </label>
                
                <button 
                  onClick={() => setAppState(s => ({ ...s, addDepth: !s.addDepth }))}
                  className={`w-full border border-white/5 py-2 px-4 rounded text-[10px] flex items-center justify-center gap-2 transition-all ${appState.addDepth ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[#1a1a1c] text-white/80'}`}
                >
                  <Zap size={14} className={appState.addDepth ? 'text-yellow-500' : 'text-white/40'} /> {appState.addDepth ? 'Disable' : 'Enable'} 3D Depth
                </button>

                <button 
                  onClick={() => setAppState(s => ({ ...s, isHolographic: !s.isHolographic }))}
                  className={`w-full border border-white/5 py-2 px-4 rounded text-[10px] flex items-center justify-center gap-2 transition-all ${!appState.isHolographic ? 'bg-white/10 text-white' : 'bg-[#1a1a1c] text-white/80'}`}
                >
                  <BoxSelect size={14} className="text-blue-400" /> {appState.isHolographic ? 'Disable' : 'Enable'} Holo Mode
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-[9px] text-white/40 font-bold mb-2 uppercase tracking-tighter">Ghost Opacity</h2>
              <div className="px-2">
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={appState.opacity}
                  onChange={(e) => setAppState(s => ({ ...s, opacity: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-400 bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between mt-3 gap-1">
                {(['blue', 'green', 'red', 'purple', 'white'] as HolographicColor[]).map(color => (
                  <button 
                    key={color}
                    onClick={() => setAppState(s => ({ ...s, holographicColor: color }))}
                    className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${appState.holographicColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: HOLOGRAPHIC_COLORS[color] }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[9px] text-white/40 font-bold mb-3 uppercase tracking-tighter">Geometric Data</h2>
              <label className="w-full cursor-pointer bg-[#1a1a1c] border border-white/5 py-2 px-4 rounded text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/80">
                <Box size={14} className="text-blue-500" /> Load 3D Model
                <input type="file" accept=".glb" className="hidden" onChange={(e) => handleFileUpload(e, 'model')} />
              </label>
            </section>
          </div>

          <div className="mt-2 space-y-3 pt-4 border-t border-white/5">
             <div className="space-y-2">
                <GestureItem icon={<Hand size={14} />} title="Fist Hold" subtitle="Drag & Reposition" />
                <GestureItem icon={<Hand size={14} />} title="Full Open Hand" subtitle="Manual Rotate" />
                <GestureItem icon={<Scissors size={14} />} title="Victory Sign" subtitle="Horizontal Spin" />
                <GestureItem icon={<Hand size={14} />} title="3 Fingers Up" subtitle="Vertical Spin" />
                <GestureItem icon={<Zap size={14} />} title="Pinch (3 fingers closed)" subtitle="Precise Zoom" />
             </div>
          </div>

          <div className="mt-4 bg-green-500 py-1 px-3 rounded flex items-center gap-2">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">Rotating View</span>
          </div>
        </div>
      )}

      {/* Show Controls Button */}
      {!appState.isControlsVisible && (
        <button 
          onClick={() => setAppState(s => ({ ...s, isControlsVisible: true }))}
          className="absolute left-6 top-8 bg-black/80 border border-[#0ef] px-4 py-2 text-[#0ef] text-xs hover:bg-[#0ef] hover:text-black transition-all font-bold z-40 rounded flex items-center gap-2"
        >
          <Eye size={14} /> Show Controls
        </button>
      )}

      {/* Performance-Optimized Hand Tracker */}
      <HandTracker onGestureDetected={handleGestureUpdate} />

      {/* Status Overlay */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/40 uppercase tracking-widest">Active State</span>
            <span className={`text-sm font-bold tracking-widest uppercase ${appState.gesture !== GestureType.NONE ? 'text-[#0ef]' : 'text-white/20'}`}>
              {appState.gesture !== GestureType.NONE ? GESTURE_DESCRIPTIONS[appState.gesture].split(' - ')[0] : 'Idle'}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex flex-col items-center">
             <span className="text-[8px] text-white/40 uppercase tracking-widest">Tracking Conf</span>
             <span className="text-sm font-bold text-green-400">98.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GestureItem = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
  <div className="flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-default group">
    <div className="text-yellow-500 mt-0.5 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-bold text-white">{title}</div>
      <div className="text-[8px] text-cyan-400/80 uppercase font-medium">{subtitle}</div>
    </div>
  </div>
);

export default App;
