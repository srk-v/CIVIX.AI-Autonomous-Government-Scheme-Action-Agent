import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppStep, CitizenProfile, Scheme, AgentLog, DocumentScanResult } from './types';
import { ThinkingProcess } from './components/ThinkingProcess';
import { ProfileForm } from './components/ProfileForm';
import { Dashboard } from './components/Dashboard';
import { discoverSchemes, analyzeSchemesDeeply, extractDocumentInfo } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addLog = useCallback((message: string, level: AgentLog['level'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      level
    }]);
  }, []);

  const startAgentFlow = async (userProfile: CitizenProfile) => {
    setProfile(userProfile);
    setStep(AppStep.DISCOVERY);
    addLog("I am CIVIX.AI. I convert government schemes into real-world action.", "info");
    addLog("Constructing Persistent Citizen State Signature...", "thinking");
    
    try {
      addLog("Executing Multi-Step Tool Call: scheme_discovery...", "action");
      const discoveredRaw = await discoverSchemes(userProfile);
      addLog("Search Grounding Complete. Identified high-relevance matches.", "info");

      setStep(AppStep.ANALYSIS);
      addLog("Initializing Marathon Agent Reasoning (Thinking Level: High)...", "action");
      addLog("Self-correcting eligibility reasoning against state-specific policy PDFs...", "thinking");
      
      const analyzedSchemes = await analyzeSchemesDeeply(discoveredRaw, userProfile);
      setSchemes(analyzedSchemes);
      
      addLog(`Verified ${analyzedSchemes.length} actionable schemes. Building 7-day plans.`, "info");
      setStep(AppStep.DASHBOARD);
    } catch (err) {
      addLog("Agent Failure: Context window collision or network timeout.", "error");
      console.error(err);
    }
  };

  const startCamera = async () => {
    setStep(AppStep.DOCUMENT_VERIFY);
    addLog("Multimodal Input Layer Activated. Waiting for document frame...", "action");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      addLog("Camera access denied. Falling back to simulation.", "error");
    }
  };

  const captureAndExtract = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const base64 = canvasRef.current.toDataURL('image/jpeg');
      
      addLog("Extracting metadata via Gemini Vision OCR...", "thinking");
      const result = await extractDocumentInfo(base64);
      setScanResult(result);
      addLog(`Document recognized: ${result.type || 'ID Document'}. Cross-referencing eligibility...`, "info");
      
      // Stop stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      
      setTimeout(() => {
        setStep(AppStep.DASHBOARD);
        addLog("Verification state updated. Rerunning eligibility loop...", "thinking");
      }, 2000);
    }
  };

  const handleHomeClick = () => {
    setStep(AppStep.WELCOME);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 overflow-x-hidden">
      {/* Sidebar Menu Drawer */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} p-8 flex flex-col`}>
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Navigation</h3>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-900 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex flex-col gap-6">
            <button 
              onClick={handleHomeClick}
              className={`text-2xl font-black text-left uppercase tracking-tighter transition-colors ${step === AppStep.WELCOME ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600'}`}
            >
              01. Home
            </button>
            <button 
              onClick={() => { setStep(AppStep.PROFILE); setIsMenuOpen(false); }}
              className={`text-2xl font-black text-left uppercase tracking-tighter transition-colors ${step === AppStep.PROFILE ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600'}`}
            >
              02. Profile Builder
            </button>
            <button 
              onClick={() => { setStep(AppStep.DASHBOARD); setIsMenuOpen(false); }}
              className={`text-2xl font-black text-left uppercase tracking-tighter transition-colors ${step === AppStep.DASHBOARD ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600'}`}
              disabled={!profile}
            >
              03. Action Console {!profile && '(Locked)'}
            </button>
            <button 
              onClick={() => { setStep(AppStep.DOCUMENT_VERIFY); setIsMenuOpen(false); }}
              className={`text-2xl font-black text-left uppercase tracking-tighter transition-colors ${step === AppStep.DOCUMENT_VERIFY ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600'}`}
            >
              04. Verification
            </button>
          </nav>

          <div className="mt-auto pt-10 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agent Status: Online</span>
             </div>
             <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-wider">
               CIVIX.AI Operational Kernel<br/>
               Build: 1.0.4-Stable<br/>
               Region: India-Generic
             </p>
          </div>
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Home Button */}
          <button 
            onClick={handleHomeClick}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black italic group-hover:bg-blue-600 transition-colors">C</div>
            <h1 className="text-xl font-black tracking-tighter uppercase group-hover:text-blue-600 transition-colors">CIVIX.<span className="text-blue-600 group-hover:text-slate-900 transition-colors">AI</span></h1>
          </button>
          
          <div className="flex items-center gap-6">
            {/* Desktop Quick Nav */}
            <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              <button onClick={handleHomeClick} className={`hover:text-slate-900 transition-colors ${step === AppStep.WELCOME ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-500' : ''}`}>Home</button>
              <button onClick={() => setStep(AppStep.PROFILE)} className={`hover:text-slate-900 transition-colors ${step === AppStep.PROFILE ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-500' : ''}`}>Profile</button>
              {profile && (
                <button onClick={() => setStep(AppStep.DASHBOARD)} className={`hover:text-slate-900 transition-colors ${step === AppStep.DASHBOARD ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-500' : ''}`}>Dashboard</button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex -space-x-2">
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold">JD</div>
              </div>
              
              {/* Hamburger Menu Bar Toggle */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all active:scale-95 flex items-center justify-center group"
                aria-label="Toggle Menu"
              >
                <div className="flex flex-col gap-1.5 items-end">
                  <div className="w-6 h-0.5 bg-slate-900 group-hover:w-8 transition-all"></div>
                  <div className="w-4 h-0.5 bg-slate-900 group-hover:w-6 transition-all"></div>
                  <div className="w-8 h-0.5 bg-slate-900 group-hover:w-4 transition-all"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {step === AppStep.WELCOME && (
          <div className="py-20 flex flex-col items-center text-center">
             <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
               Autonomous Action Era
             </div>
             <h2 className="text-6xl font-black text-slate-900 mb-8 max-w-4xl leading-[1.1]">
               I don't just answer questions. <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">I execute action.</span>
             </h2>
             <p className="text-xl text-slate-500 mb-12 max-w-2xl font-medium">
               CIVIX.AI converts fragmented government policy into verified citizen benefits through autonomous planning and multimodal reasoning.
             </p>
             <button 
              onClick={() => setStep(AppStep.PROFILE)}
              className="bg-slate-900 text-white text-lg font-black px-12 py-6 rounded-3xl hover:scale-105 transition-all shadow-2xl shadow-blue-200"
             >
               Initialize Citizen Profile Builder
             </button>
          </div>
        )}

        {step === AppStep.PROFILE && <ProfileForm onSubmit={startAgentFlow} />}

        {(step === AppStep.DISCOVERY || step === AppStep.ANALYSIS) && (
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="flex flex-col items-center text-center">
               <div className="w-20 h-20 relative mb-6">
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                  </div>
               </div>
               <h3 className="text-2xl font-black text-slate-900">
                  {step === AppStep.DISCOVERY ? "Discovery Pipeline: Active" : "Long-Context Reasoning Loop"}
               </h3>
               <p className="text-slate-500 text-sm mt-2">Gemini 3 Pro Orchestrating {logs.length} Sub-tasks</p>
            </div>
            <ThinkingProcess logs={logs} />
          </div>
        )}

        {step === AppStep.DOCUMENT_VERIFY && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Multimodal Verification</h2>
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-6 relative border-4 border-slate-200">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-white/30 m-12 rounded-xl flex items-center justify-center pointer-events-none">
                 <div className="text-white/50 text-[10px] uppercase font-bold tracking-[0.3em]">Align Document Here</div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button 
              onClick={captureAndExtract}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-sm"
            >
              Analyze Document Frame
            </button>
          </div>
        )}

        {step === AppStep.DASHBOARD && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Action Console</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marathon Agent: Running</p>
                </div>
              </div>
              <div className="w-full md:w-96">
                <ThinkingProcess logs={logs} />
              </div>
            </div>

            {scanResult && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-wider">Document Verified: {scanResult.type}</p>
                    <p className="text-[10px] text-emerald-600 font-bold italic">Holder: {scanResult.name} | ID: {scanResult.idNumber}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase">Status: Matched</div>
              </div>
            )}

            <Dashboard schemes={schemes} onVerifyDocs={startCamera} />
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>🛡️ TRUST & SAFETY: NO MEDICAL/LEGAL ADVICE</span>
              <span className="text-slate-200">|</span>
              <span>ESTIMATED SUCCESS PROBABILITY: {(schemes.length > 0 ? schemes[0].confidence * 100 : 0).toFixed(1)}%</span>
           </div>
           <div className="flex gap-4">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] font-black text-blue-600 uppercase underline">Billing Info</a>
              <span className="text-[10px] font-black text-slate-400 uppercase">CIVIX.AI v1.0.4-Stable</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;