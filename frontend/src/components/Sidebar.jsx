import React from 'react';
import {
  ChartBarIcon as BarChart3,
  ArrowUpTrayIcon as Upload,
  TableCellsIcon as Database,
  ChatBubbleLeftRightIcon as MessageSquare,
  Cog6ToothIcon as Settings,
  ChevronDownIcon as ChevronDown,
  DocumentTextIcon as FileText,
  WalletIcon as Wallet,
  UsersIcon as Users,
  FolderIcon as FolderKanban,
  CalendarIcon as Calendar,
  ArrowRightOnRectangleIcon as LogOut,
  TableCellsIcon as Table2,
  ChevronRightIcon as ChevronRight
} from '@heroicons/react/24/outline';

// Custom Layers Icon
const LayersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125L12 12.375l9.75-5.25M2.25 12l9.75 5.25 9.75-5.25M2.25 16.875L12 22.125l9.75-5.25" />
  </svg>
);

/* ─── small helpers ─────────────────────────────────────── */
const Panel = ({ open, children }) => (
  <div 
    className="overflow-hidden transition-all duration-300 ease-in-out" 
    style={{ maxHeight: open ? '1000px' : '0', opacity: open ? 1 : 0 }}
  >
    {children}
  </div>
);

const SecLabel = ({ label, collapsed }) =>
  collapsed
    ? <div className="h-px bg-[var(--border-light)] mx-4 my-4" />
    : <div className="sidebar-section-title px-6 mt-6 mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">{label}</div>;

/* ─── top-level nav button ──────────────────────────────── */
function TopBtn({ icon: Icon, label, active, hasChev, chevOpen, onClick, onToggle, collapsed, badge }) {
  if (collapsed) {
    return (
      <div className="relative group px-3 py-1">
        <button
          className={`w-full flex justify-center py-3 transition-all duration-200 ${
            active 
              ? 'bg-[#18181B] text-white' 
              : 'text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-main)]'
          }`}
          onClick={onClick}
        >
          <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.5} />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap">
          {label}
        </div>
      </div>
    );
  }
  return (
    <div className="px-3 py-1">
      <button 
        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group ${
          active 
            ? 'bg-[#18181B] text-white' 
            : 'text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-main)]'
        }`} 
        onClick={onClick}
      >
        <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-[var(--text-subtle)] group-hover:text-[var(--text-main)]'}`} strokeWidth={active ? 2 : 1.5} />
        <span className="flex-1 truncate text-left text-xs font-semibold uppercase tracking-wider">{label}</span>
        {badge != null && (
          <span className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-[var(--border-strong)] text-[var(--text-main)]'}`}>
            {badge}
          </span>
        )}
        {hasChev && (
          <span 
            className={`p-0.5 rounded transition-colors ${active ? 'hover:bg-white/20' : 'hover:bg-black/5'}`}
            onClick={(e) => {
              if (onToggle) {
                e.preventDefault();
                e.stopPropagation();
                onToggle(e);
              }
            }}
          >
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-300 ${chevOpen ? 'rotate-180' : ''}`} 
            />
          </span>
        )}
      </button>
    </div>
  );
}

/* ─── sub-level button ──────────────────────────────────── */
function SubBtn({ icon: Icon, label, active, onClick }) {
  return (
    <div className="px-3 py-0.5 ml-8">
      <button 
        className={`w-full flex items-center gap-3 px-3 py-2 transition-all text-xs font-medium border-l-2 ${
          active 
            ? 'text-[var(--brand-primary)] bg-[var(--border-light)] border-[var(--brand-primary)]' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-[var(--border-light)]'
        }`} 
        onClick={onClick}
      >
        {Icon && <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-subtle)]'}`} />}
        <span className="truncate">{label}</span>
      </button>
    </div>
  );
}

/* ─── file item ─────────────────────────────────────────── */
function FileBtn({ label, active, onClick }) {
  return (
    <div className="px-3 py-0.5 ml-12">
      <button 
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 transition-all text-[11px] font-medium border-l border-transparent ${
          active 
            ? 'text-[var(--brand-primary)] bg-[var(--border-light)] border-[var(--brand-primary)]' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-light)]'
        }`} 
        onClick={onClick}
      >
        <FileText className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-subtle)]'}`} />
        <span className="truncate">{label}</span>
      </button>
    </div>
  );
}

/* ─── project file group (inside dashboard) ─────────────── */
function ProjectGroup({ proj, context, isFileSelected, onFileClick, expandedModules, toggleMod }) {
  const moduleId = context === 'project-dashboard' ? proj.id : `${context}-${proj.id}`;
  const isOpen = !!(expandedModules[moduleId] || expandedModules[proj.id]);
  const hasFiles = proj.submodules?.length > 0;

  return (
    <div className="mb-1">
      <div className="px-3 ml-8">
        <button 
          className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
            isOpen ? 'text-[var(--text-main)] bg-[var(--border-light)]' : 'text-[var(--text-subtle)] hover:text-[var(--text-main)] hover:bg-[var(--border-light)]'
          }`} 
          onClick={(e) => { e.stopPropagation(); toggleMod(moduleId, e); }}
        >
          <span className="truncate pr-2">{proj.name}</span>
          {hasFiles && (
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
      </div>
      {hasFiles && (
        <Panel open={isOpen}>
          <div className="mt-1">
            {proj.submodules.map((f) => (
              <FileBtn
                key={f.id}
                label={f.displayName || f.name?.replace(/\.[^/.]+$/, '') || ''}
                active={isFileSelected(f, context)}
                onClick={() => onFileClick({ ...f, projectName: f.projectName || proj.name })}
              />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN SIDEBAR
   Material Google Style Minimalist Design
════════════════════════════════════════════════════════════ */
export default function Sidebar({
  sidebarCollapsed,
  activeModule,
  expandedModules,
  projectDashboardModules,
  uploadTrackerModules,
  companyLogo,
  companyName,
  user,
  handleModuleClick,
  toggleModuleExpansion,
  handleFileModuleClick,
  handleProjectFileClick,
  isFileSelected,
  hasPermission,
  onLogout,
}) {
  const collapsed = sidebarCollapsed;
  const isOpen = (k) => !!expandedModules[k];
  const perm   = (n) => !hasPermission || hasPermission(n);

  const initials = user?.full_name
    ? user.full_name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className={`flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-main)] transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} z-40`}>
      {/* ══ LOGO ════════════════════════════════════════════ */}
      <div className={`flex items-center justify-center shrink-0 border-b border-[var(--border-main)] ${collapsed ? 'h-16' : 'h-20'}`}>
        {collapsed ? (
          <div className="w-10 h-10 bg-[var(--brand-primary)] flex items-center justify-center text-white text-xs font-bold">
            {companyName ? companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'CD'}
          </div>
        ) : (
          <div className="flex justify-center items-center w-full px-6 py-4">
            <img
              src={companyLogo || '/caldimlogo.png'}
              alt="Company Logo"
              className="max-h-9 w-auto object-contain grayscale"
            />
          </div>
        )}
      </div>

      {/* ══ NAV ═════════════════════════════════════════════ */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {/* — WORKSPACE — */}
        <SecLabel label="Workspace" collapsed={collapsed} />

        {/* Dashboard */}
        {perm('Dashboard') && (
          <>
            <TopBtn
              icon={BarChart3}
              label="Dashboard"
              active={activeModule === 'project-dashboard'}
              hasChev={!collapsed && (projectDashboardModules?.length > 0)}
              chevOpen={isOpen('project-dashboard')}
              collapsed={collapsed}
              onClick={() => handleModuleClick('project-dashboard')}
              onToggle={(e) => toggleModuleExpansion('project-dashboard', e)}
            />
            {!collapsed && (
              <Panel open={isOpen('project-dashboard')}>
                {projectDashboardModules?.map((proj) => (
                  <ProjectGroup
                    key={proj.id}
                    proj={proj}
                    context="project-dashboard"
                    isFileSelected={isFileSelected}
                    onFileClick={handleProjectFileClick}
                    expandedModules={expandedModules}
                    toggleMod={toggleModuleExpansion}
                  />
                ))}
              </Panel>
            )}
          </>
        )}

        {/* Meetings */}
        {perm('MOM') && (
          <>
            <TopBtn
              icon={MessageSquare}
              label="Meetings"
              active={['mom-module', 'meetings', 'schedule-meeting'].includes(activeModule)}
              hasChev={!collapsed}
              chevOpen={isOpen('mom')}
              collapsed={collapsed}
              onClick={() => handleModuleClick('mom-module')}
              onToggle={(e) => toggleModuleExpansion('mom', e)}
            />
            {!collapsed && (
              <Panel open={isOpen('mom')}>
                <SubBtn
                  icon={LayersIcon}
                  label="All Meetings"
                  active={activeModule === 'meetings'}
                  onClick={() => handleModuleClick('meetings')}
                />
                <SubBtn
                  icon={Calendar}
                  label="Schedule Meeting"
                  active={activeModule === 'schedule-meeting'}
                  onClick={() => handleModuleClick('schedule-meeting')}
                />
              </Panel>
            )}
          </>
        )}

        {/* — CONFIGURATION — */}
        <SecLabel label="Configuration" collapsed={collapsed} />

        {/* Masters */}
        <>
          <TopBtn
            icon={Database}
            label="Masters"
            active={['masters-main', 'employee-master', 'project-master', 'budget-master'].includes(activeModule)}
            hasChev={!collapsed}
            chevOpen={isOpen('masters')}
            collapsed={collapsed}
            onClick={() => handleModuleClick('masters-main')}
            onToggle={(e) => toggleModuleExpansion('masters', e)}
          />
          {!collapsed && (
            <Panel open={isOpen('masters')}>
              <SubBtn
                icon={Users}
                label="Employee Master"
                active={activeModule === 'employee-master'}
                onClick={() => handleModuleClick('employee-master')}
              />
              <SubBtn
                icon={FolderKanban}
                label="Project Master"
                active={activeModule === 'project-master'}
                onClick={() => handleModuleClick('project-master')}
              />
              <SubBtn
                icon={Wallet}
                label="Budget Master"
                active={activeModule === 'budget-master'}
                onClick={() => handleModuleClick('budget-master')}
              />
            </Panel>
          )}
        </>

        {/* Uploads */}
        {perm('Upload Trackers') && (
          <>
            <TopBtn
              icon={Upload}
              label="Uploads"
              active={['upload-trackers', 'budget-upload', 'uploads-main'].includes(activeModule)}
              hasChev={!collapsed}
              chevOpen={isOpen('uploads')}
              collapsed={collapsed}
              onClick={() => handleModuleClick('uploads-main')}
              onToggle={(e) => toggleModuleExpansion('uploads', e)}
            />
            {!collapsed && (
              <Panel open={isOpen('uploads')}>
                {/* Trackers Button */}
                <div className="flex items-center group relative">
                   <SubBtn
                     icon={Table2}
                     label="Trackers Upload"
                     active={activeModule === 'upload-trackers'}
                     onClick={() => handleModuleClick('upload-trackers')}
                   />
                   <button 
                      className={`absolute right-6 p-1 rounded transition-all ${
                        isOpen('upload-trackers') ? 'text-[var(--brand-primary)]' : 'text-[var(--text-subtle)] hover:text-[var(--text-main)] group-hover:bg-black/5'
                      }`}
                      onClick={(e) => { e.stopPropagation(); toggleModuleExpansion('upload-trackers', e); }}
                   >
                     {uploadTrackerModules?.length > 0 && (
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen('upload-trackers') ? 'rotate-180' : ''}`} />
                     )}
                   </button>
                </div>
                {/* Trackers Projects Expansion */}
                <Panel open={isOpen('upload-trackers')}>
                  {uploadTrackerModules?.map((proj) => (
                    <ProjectGroup
                      key={proj.id}
                      proj={proj}
                      context="upload-trackers"
                      isFileSelected={isFileSelected}
                      onFileClick={handleFileModuleClick}
                      expandedModules={expandedModules}
                      toggleMod={toggleModuleExpansion}
                    />
                  ))}
                </Panel>
                {/* Budget Upload Button */}
                <SubBtn
                  icon={Wallet}
                  label="Budget Upload"
                  active={activeModule === 'budget-upload'}
                  onClick={() => handleModuleClick('budget-upload')}
                />
              </Panel>
            )}
          </>
        )}

        {/* Settings */}
        {perm('Settings') && (
          <TopBtn
            icon={Settings}
            label="Settings"
            active={activeModule === 'system-settings'}
            collapsed={collapsed}
            onClick={() => handleModuleClick('system-settings')}
          />
        )}
      </nav>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <div className={`p-4 border-t border-[var(--border-main)] flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-[var(--border-light)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] text-xs font-bold shrink-0">
          {initials}
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-[var(--text-main)] truncate uppercase tracking-tighter">
                {user?.full_name || 'User'}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-subtle)] mt-0.5 truncate font-bold">
                {user?.role || 'Member'}
              </div>
            </div>
            <button 
              className="p-1.5 text-[var(--text-subtle)] hover:text-[var(--accent-danger)] hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200" 
              onClick={onLogout} 
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
