import React from 'react';
import { ArrowRightIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';

const PremiumProjectCard = ({ project, onClick, isFeatured }) => {
  const subModulesCount = project.submodules ? project.submodules.length : 0;
  const isConfigured = !!project.dashboardConfig;
  const status = project.status || 'Active';

  const code = project.code ?? project.name.substring(0, 4).toUpperCase();
  
  return (
    <div 
      onClick={() => onClick(project.id)}
      className="group premium-card p-6 bg-white flex flex-col hover:border-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)] transition-all duration-300 cursor-pointer relative"
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-3 left-6">
          <span className="bg-[var(--brand-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-500/20 uppercase tracking-widest">
            Featured
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)] flex items-center justify-center font-mono font-bold text-sm text-[var(--text-main)] group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-[var(--brand-primary)] transition-colors">
            {code.substring(0, 2)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] block">Workspace</span>
            <span className="text-[11px] font-bold text-[var(--text-meta)] font-mono">{code}</span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
          status === 'Active' || status === 'Complete' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-amber-50 text-amber-700 border-amber-100'
        }`}>
          {status}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[var(--text-main)] m-0 truncate leading-snug group-hover:text-[var(--brand-primary)] transition-colors">
          {project.name}
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1.5 text-[var(--text-subtle)]">
             <TableCellsIcon className="h-3.5 w-3.5" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Datasets</span>
           </div>
           <span className="text-sm font-bold text-[var(--text-main)] tabular-nums">{subModulesCount}</span>
         </div>
         
         <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1.5 text-[var(--text-subtle)]">
             <Squares2X2Icon className="h-3.5 w-3.5" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Layout</span>
           </div>
           {isConfigured ? (
             <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
               <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> Ready
             </span>
           ) : (
             <span className="text-[10px] font-bold text-[var(--text-subtle)] flex items-center gap-1">
               <span className="w-1 h-1 rounded-full bg-slate-300"></span> Pending
             </span>
           )}
         </div>
      </div>

      {/* Action Footer */}
      <div className="mt-auto pt-4 border-t border-[var(--border-light)] group-hover:border-blue-100 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--text-subtle)] group-hover:text-[var(--brand-primary)] transition-colors">Open Workspace</span>
          <ArrowRightIcon className="h-4 w-4 text-[var(--text-meta)] transform group-hover:translate-x-1 group-hover:text-[var(--brand-primary)] transition-all" />
        </div>
      </div>
    </div>
  );
};

export default PremiumProjectCard;
