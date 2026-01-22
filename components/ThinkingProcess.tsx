
import React from 'react';
import { AgentLog } from '../types';

interface Props {
  logs: AgentLog[];
}

export const ThinkingProcess: React.FC<Props> = ({ logs }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 rounded-xl p-4 shadow-inner h-64 overflow-y-auto mono text-xs" ref={scrollRef}>
      <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 thinking-dot"></div>
        <span className="text-slate-400 font-semibold uppercase tracking-wider">CIVIX.AI Autonomous Kernel</span>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="mb-1 flex gap-3">
          <span className="text-slate-500">[{log.timestamp}]</span>
          <span className={`${
            log.level === 'thinking' ? 'text-amber-400 italic' : 
            log.level === 'action' ? 'text-blue-400' : 
            log.level === 'error' ? 'text-red-400' : 'text-slate-300'
          }`}>
            {log.level === 'thinking' && '>> '}
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
};
