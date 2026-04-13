import React from 'react';
import { ArrowRight, Layout, Database } from 'lucide-react';

const PremiumProjectCard = ({ project, onClick, isFeatured }) => {
  const subModulesCount = project.submodules ? project.submodules.length : 0;
  const isConfigured = !!project.dashboardConfig;
  const status = project.status || 'Active';

  const code = project.code ?? project.name.substring(0, 4).toUpperCase();
  
  return (
    <div 
      onClick={() => onClick(project.id)}
      className="group flex flex-col premium-card hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 cursor-pointer relative p-7"
    >
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${isFeatured ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-400'} transition-colors`}></div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-mono font-black text-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
            {code.substring(0, 2)}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Workspace</span>
            <span className="text-[11px] font-bold text-slate-800 font-mono">{code}</span>
          </div>
        </div>
        
        {/* Modern Status Badge */}
        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
          status === 'Active' || status === 'Complete' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
            : 'bg-amber-50 text-amber-600 border border-amber-100/50'
        }`}>
          {status}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 m-0 truncate leading-tight group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
        </div>

        {/* Info Grid - Ultra Clean */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-1.5 text-slate-400">
               <Database size={13} />
               <span className="text-[9px] font-black uppercase tracking-widest">Datasets</span>
             </div>
             <span className="text-sm font-black text-slate-800 font-mono">{subModulesCount}</span>
           </div>
           
           <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-1.5 text-slate-400">
               <Layout size={13} />
               <span className="text-[9px] font-black uppercase tracking-widest">Configuration</span>
             </div>
             {isConfigured ? (
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                 <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> Ready
               </span>
             ) : (
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                 <span className="w-1 h-1 rounded-full bg-slate-300"></span> Pending
               </span>
             )}
           </div>
        </div>

        {/* Clean Action Button */}
        <button className="group/btn w-full py-3.5 px-4 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all duration-300 border border-slate-100">
          Open Analytics
          <ArrowRight size={14} className="transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default PremiumProjectCard;
