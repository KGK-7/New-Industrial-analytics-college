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
      className="system-panel p-6 bg-white flex flex-col hover:bg-[var(--bg-app)] border border-[var(--border-main)] transition-all duration-100 cursor-pointer relative"
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-3 left-6">
          <span className="bg-[#18181B] text-white text-[9px] font-black px-3 py-1 border border-black uppercase tracking-[0.2em]">
            FEATURED
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--bg-app)] border border-[var(--border-main)] flex items-center justify-center font-mono font-bold text-sm text-[var(--text-main)] transition-colors">
            {code.substring(0, 2)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] block">Workspace</span>
            <span className="text-[11px] font-bold text-[var(--text-meta)] font-mono">{code}</span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
          status === 'Active' || status === 'Complete' 
            ? 'bg-zinc-100 text-zinc-900 border-zinc-900' 
            : 'bg-zinc-50 text-zinc-600 border-zinc-200'
        }`}>
          {status}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.1em] m-0 truncate leading-snug">
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
              <span className="text-[10px] font-bold text-zinc-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-900"></span> READY
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[var(--text-subtle)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-300"></span> PENDING
              </span>
            )}
          </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--brand-primary)]">Open Project</span>
          <ArrowRightIcon className="h-4 w-4 text-[var(--brand-primary)]" />
        </div>
      </div>
    </div>
  );
};

export default PremiumProjectCard;
