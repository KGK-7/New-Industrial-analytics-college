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
      className="group flex flex-col premium-card hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative p-7 bg-white"
    >
      {/* Visual Accent - Enterprise Branding */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isFeatured ? 'bg-[var(--text-main)]' : 'bg-[var(--border-main)] group-hover:bg-[var(--text-main)]'} transition-colors duration-300`}></div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--text-main)] flex items-center justify-center font-mono font-black text-sm text-white shadow-lg transition-transform duration-500 group-hover:bg-black">
            {code.substring(0, 2)}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtle)] block mb-0.5">Workspace</span>
            <span className="text-[11px] font-bold text-[var(--text-main)] font-mono">{code}</span>
          </div>
        </div>
        
        {/* Modern Status Badge */}
        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
          status === 'Active' || status === 'Complete' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
        }`}>
          {status}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h3 className="text-xl font-black text-[var(--text-main)] m-0 truncate leading-tight group-hover:text-black transition-colors">
            {project.name}
          </h3>
        </div>

        {/* Info Grid - Ultra Clean */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-1.5 text-[var(--text-subtle)]">
               <Database size={13} />
               <span className="text-[9px] font-black uppercase tracking-widest">Datasets</span>
             </div>
             <span className="text-sm font-black text-[var(--text-main)] font-mono">{subModulesCount}</span>
           </div>
           
           <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-1.5 text-[var(--text-subtle)]">
               <Layout size={13} />
               <span className="text-[9px] font-black uppercase tracking-widest">Setup</span>
             </div>
             {isConfigured ? (
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ready
               </span>
             ) : (
               <span className="text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-tighter flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Pending
               </span>
             )}
           </div>
        </div>

        {/* Clean Action Button */}
        <button className="group/btn w-full py-4 px-4 bg-[var(--bg-app)] text-[var(--text-muted)] rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[var(--text-main)] hover:text-white transition-all duration-300 border border-[var(--border-main)]">
          Open Workspace
          <ArrowRight size={14} className="transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default PremiumProjectCard;
