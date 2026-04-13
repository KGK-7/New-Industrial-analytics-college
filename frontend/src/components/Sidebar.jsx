import React from 'react';
import {
  BarChart3, Upload, Database, MessageSquare,
  Settings, ChevronDown, FileText, Wallet,
  Users, FolderKanban, Calendar, LogOut,
  Table2, Layers
} from 'lucide-react';

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
    : <div className="sidebar-section-title">{label}</div>;

/* ─── top-level nav button ──────────────────────────────── */
function TopBtn({ icon: Icon, label, active, hasChev, chevOpen, onClick, onToggle, collapsed, badge }) {
  if (collapsed) {
    return (
      <div className="relative group">
        <button
          className={`sidebar-nav-item justify-center !px-0 ${active ? 'sidebar-nav-item-active' : ''}`}
          onClick={onClick}
        >
          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap shadow-xl">
          {label}
        </div>
      </div>
    );
  }
  return (
    <button 
      className={`sidebar-nav-item ${active ? 'sidebar-nav-item-active' : ''}`} 
      onClick={onClick}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      {badge != null && (
        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
          {badge}
        </span>
      )}
      {hasChev && (
        <span 
          className="p-1 hover:bg-white/20 rounded transition-colors"
          onClick={(e) => {
            if (onToggle) {
              e.preventDefault();
              e.stopPropagation();
              onToggle(e);
            }
          }}
        >
          <ChevronDown 
            size={14} 
            strokeWidth={2.5} 
            className={`transition-transform duration-300 ${chevOpen ? 'rotate-180' : ''}`} 
          />
        </span>
      )}
    </button>
  );
}

/* ─── sub-level button ──────────────────────────────────── */
function SubBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      className={`sidebar-sub-item ${active ? 'sidebar-sub-item-active' : ''}`} 
      onClick={onClick}
    >
      {Icon && <Icon size={14} strokeWidth={2} className="shrink-0" />}
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ─── file item ─────────────────────────────────────────── */
function FileBtn({ label, active, onClick }) {
  return (
    <button 
      className={`sidebar-sub-item !pl-16 text-[11px] opacity-80 hover:opacity-100 ${active ? 'sidebar-sub-item-active !opacity-100' : ''}`} 
      onClick={onClick}
    >
      <FileText size={12} strokeWidth={2} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ─── project file group (inside dashboard) ─────────────── */
function ProjectGroup({ proj, context, isFileSelected, onFileClick, expandedModules, toggleMod }) {
  const moduleId = context === 'project-dashboard' ? proj.id : `${context}-${proj.id}`;
  const isOpen = !!(expandedModules[moduleId] || expandedModules[proj.id]);
  const hasFiles = proj.submodules?.length > 0;

  return (
    <div className="mb-0.5">
      <button 
        className="w-full flex items-center justify-between px-7 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-light)] transition-all rounded-lg mx-3 w-[calc(100%-24px)]" 
        onClick={(e) => { e.stopPropagation(); toggleMod(moduleId, e); }}
      >
        <span className="truncate pr-2">{proj.name}</span>
        {hasFiles && (
          <ChevronDown
            size={12}
            className={`shrink-0 transition-transform duration-300 opacity-40 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {hasFiles && (
        <Panel open={isOpen}>
          {proj.submodules.map((f) => (
            <FileBtn
              key={f.id}
              label={f.displayName || f.name?.replace(/\.[^/.]+$/, '') || ''}
              active={isFileSelected(f, context)}
              onClick={() => onFileClick({ ...f, projectName: f.projectName || proj.name })}
            />
          ))}
        </Panel>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN SIDEBAR
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
    <aside className={`sidebar-container ${collapsed ? 'sidebar-collapsed' : ''} z-40`}>
      {/* ══ LOGO ════════════════════════════════════════════ */}
      <div className={`flex items-center justify-center shrink-0 border-b border-[var(--border-light)] ${collapsed ? 'h-20' : 'h-24'}`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-[var(--text-main)] flex items-center justify-center text-white text-xs font-black shadow-lg">
            {companyName ? companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'CD'}
          </div>
        ) : (
          <div className="flex justify-center items-center w-full px-6 py-4">
            <img
              src={companyLogo || '/caldimlogo.png'}
              alt="Company Logo"
              className="max-h-12 w-auto object-contain transition-all hover:scale-105 duration-300"
              style={{ filter: 'contrast(1.1)' }}
            />
          </div>
        )}
      </div>

      {/* ══ NAV ═════════════════════════════════════════════ */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4">
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
                  icon={Layers}
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
                <div className="flex items-center pr-4">
                   <SubBtn
                     icon={Table2}
                     label="Trackers Upload"
                     active={activeModule === 'upload-trackers'}
                     onClick={() => handleModuleClick('upload-trackers')}
                   />
                   <button 
                      className="p-1 px-2 hover:bg-[var(--border-light)] rounded transition-all text-[var(--text-subtle)] hover:text-[var(--text-main)]"
                      onClick={(e) => { e.stopPropagation(); toggleModuleExpansion('upload-trackers', e); }}
                   >
                     {uploadTrackerModules?.length > 0 && (
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen('upload-trackers') ? 'rotate-180' : ''}`} />
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
      <div className={`p-4 border-t border-[var(--border-light)] flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-[var(--text-main)] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md">
          {initials}
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[var(--text-main)] truncate leading-tight">
                {user?.full_name || 'User'}
              </div>
              <div className="text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-widest mt-0.5 truncate">
                {user?.role || 'Member'}
              </div>
            </div>
            <button 
              className="p-2 text-[var(--text-subtle)] hover:text-[var(--accent-danger)] hover:bg-red-50 rounded-xl transition-all" 
              onClick={onLogout} 
              title="Logout"
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
