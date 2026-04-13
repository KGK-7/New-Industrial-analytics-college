import React, { useState } from 'react';
import {
  BarChart3, Upload, Database, MessageSquare,
  Settings, ChevronDown, FileText, Wallet,
  Users, FolderKanban, Calendar, LogOut,
  Table2, Layers
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   DESIGN SYSTEM
   Brand navy: #1e3a5f  (their original sidebar colour)
   Active highlight: rgba(255,255,255,0.13)  + 3px left bar
   Hover: rgba(255,255,255,0.06)
   Active bar: #5b9cf6  (soft sky – sits nicely on navy)
   Typography: 15px top-nav / 13.5px sub / 12px file
───────────────────────────────────────────────────────── */

const CSS = `
  .sb { box-sizing: border-box; font-family: 'DM Sans', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
  .sb *, .sb *::before, .sb *::after { box-sizing: inherit; }

  /* scrollbar */
  .sb-nav::-webkit-scrollbar { width: 4px; }
  .sb-nav::-webkit-scrollbar-track { background: transparent; }
  .sb-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }

  /* ── top-level button ── */
  .sb-btn {
    display: flex; align-items: center;
    width: 100%; border: none; background: none;
    cursor: pointer; text-align: left; font-family: inherit;
    border-radius: 12px; padding: 12px 14px;
    color: #475569;
    font-size: 14.5px; font-weight: 600; letter-spacing: -0.01em;
    gap: 12px; transition: all 0.2s var(--premium-easing);
    position: relative; user-select: none;
  }
  .sb-btn:hover { background: rgba(255,255,255,0.5); color: #1e293b; transform: translateX(2px); }
  .sb-btn.active {
    background: white;
    color: #2563eb;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
  }
  .sb-btn.active::before {
    content: '';
    position: absolute; left: 0; top: 25%; height: 50%;
    width: 3.5px; border-radius: 0 4px 4px 0;
    background: #2563eb;
  }
  .sb-btn .sb-ico { flex-shrink: 0; width: 20px; display: flex; align-items: center; justify-content: center; opacity: 0.7; }
  .sb-btn.active .sb-ico { opacity: 1; color: #2563eb; }
  .sb-btn .sb-lbl { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sb-btn .sb-chev { flex-shrink: 0; transition: transform 0.22s ease; color: #94a3b8; }
  .sb-btn .sb-chev.open { transform: rotate(180deg); }

  /* ── sub button ── */
  .sb-sub {
    display: flex; align-items: center;
    width: 100%; border: none; background: none;
    cursor: pointer; text-align: left; font-family: inherit;
    border-radius: 10px; padding: 10px 14px 10px 46px;
    color: #64748b;
    font-size: 13px; font-weight: 500;
    gap: 9px; transition: all 0.2s var(--premium-easing);
    user-select: none;
  }
  .sb-sub:hover { background: rgba(255,255,255,0.4); color: #1e293b; transform: translateX(2px); }
  .sb-sub.active { color: #2563eb; background: white; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }

  /* ── file item ── */
  .sb-file {
    display: flex; align-items: center; gap: 8px;
    width: 100%; border: none; background: none;
    cursor: pointer; text-align: left; font-family: inherit;
    border-radius: 8px; padding: 8px 14px 8px 60px;
    color: #94a3b8;
    font-size: 12px; font-weight: 500;
    transition: all 0.2s var(--premium-easing);
    user-select: none;
  }
  .sb-file:hover { color: #475569; background: rgba(255,255,255,0.3); }
  .sb-file.active { color: #2563eb; font-weight: 700; background: white; }

  /* ── collapse panel ── */
  .sb-panel {
    overflow: hidden;
    max-height: 0; opacity: 0;
    transition: max-height 0.3s var(--premium-easing), opacity 0.25s ease;
  }
  .sb-panel.open { max-height: 800px; opacity: 1; }

  /* ── section label ── */
  .sb-sec {
    font-size: 10px; font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #94a3b8;
    padding: 24px 16px 8px;
    opacity: 0.8;
  }

  /* ── group header ── */
  .sb-grp {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 14px 6px 46px;
    border: none; background: none; cursor: pointer;
    width: 100%; font-family: inherit;
    transition: background 0.2s;
    border-radius: 8px;
  }
  .sb-grp:hover { background: rgba(255,255,255,0.2); }
  .sb-grp-lbl {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #64748b;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ── tooltip ── */
  .sb-tip { position: relative; }
  .sb-tip .tip-box {
    display: none; position: absolute;
    left: calc(100% + 12px); top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
    border: 1px solid rgba(0,0,0,0.06);
    color: #1e293b; font-size: 12px; font-weight: 700;
    padding: 6px 12px; border-radius: 10px;
    white-space: nowrap; pointer-events: none; z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  }
  .sb-tip:hover .tip-box { display: block; }

  /* ── footer user row ── */
  .sb-foot {
    display: flex; align-items: center; gap: 12px;
    padding: 16px;
    border-top: 1px solid rgba(0,0,0,0.05);
    background: rgba(255,255,255,0.2);
  }
  .sb-ava {
    width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
    background: #1e293b;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #fff; letter-spacing: 0.03em;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .sb-logout {
    margin-left: auto; flex-shrink: 0;
    width: 34px; height: 34px; border-radius: 10px;
    border: 1px solid rgba(0,0,0,0.05);
    background: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #64748b;
    transition: all 0.2s var(--premium-easing);
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  }
  .sb-logout:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; transform: scale(1.05); }

  /* ── divider ── */
  .sb-div { height: 1px; background: rgba(0,0,0,0.05); margin: 12px 16px; }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  if (document.getElementById('sb-v3')) return;
  const s = document.createElement('style');
  s.id = 'sb-v3';
  s.textContent = CSS;
  document.head.appendChild(s);
  cssInjected = true;
}

/* ─── small helpers ─────────────────────────────────────── */
const Panel = ({ open, children }) => (
  <div className={`sb-panel${open ? ' open' : ''}`}>{children}</div>
);

const SecLabel = ({ label, collapsed }) =>
  collapsed
    ? <div className="sb-div" />
    : <div className="sb-sec">{label}</div>;

/* ─── top-level nav button ──────────────────────────────── */
function TopBtn({ icon: Icon, label, active, hasChev, chevOpen, onClick, onToggle, collapsed, badge }) {
  if (collapsed) {
    return (
      <div className="sb-tip">
        <button
          className={`sb-btn${active ? ' active' : ''}`}
          onClick={onClick}
          style={{ justifyContent: 'center', padding: '11px 0' }}
        >
          <span className="sb-ico">
            <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
          </span>
        </button>
        <div className="tip-box">{label}</div>
      </div>
    );
  }
  return (
    <button className={`sb-btn${active ? ' active' : ''}`} onClick={onClick}>
      <span className="sb-ico">
        <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
      </span>
      <span className="sb-lbl">{label}</span>
      {badge != null && (
        <span style={{
          background: '#5b9cf6', color: '#fff',
          fontSize: 11, fontWeight: 700,
          padding: '1px 7px', borderRadius: 99, flexShrink: 0,
        }}>
          {badge}
        </span>
      )}
      {hasChev && (
        <span 
          style={{ padding: '0 4px', display: 'flex' }}
          onClick={(e) => {
            if (onToggle) {
              e.preventDefault();
              e.stopPropagation();
              onToggle(e);
            }
          }}
        >
          <ChevronDown size={14} strokeWidth={2} className={`sb-chev${chevOpen ? ' open' : ''}`} />
        </span>
      )}
    </button>
  );
}

/* ─── sub-level button ──────────────────────────────────── */
function SubBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button className={`sb-sub${active ? ' active' : ''}`} onClick={onClick}>
      {Icon && <Icon size={14} strokeWidth={1.8} style={{ flexShrink: 0 }} />}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

/* ─── file item ─────────────────────────────────────────── */
function FileBtn({ label, active, onClick }) {
  return (
    <button className={`sb-file${active ? ' active' : ''}`} onClick={onClick}>
      <FileText size={11} strokeWidth={1.8} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

/* ─── project file group (inside dashboard) ─────────────── */
function ProjectGroup({ proj, context, isFileSelected, onFileClick, expandedModules, toggleMod }) {
  // Respect the original Dashboard.jsx context prefixing logic
  const moduleId = context === 'project-dashboard' ? proj.id : `${context}-${proj.id}`;
  const isOpen = !!(expandedModules[moduleId] || expandedModules[proj.id]);
  const hasFiles = proj.submodules?.length > 0;

  return (
    <div>
      <button className="sb-grp" onClick={(e) => { e.stopPropagation(); toggleMod(moduleId, e); }}>
        <span className="sb-grp-lbl">{proj.name}</span>
        {hasFiles && (
          <ChevronDown
            size={11}
            style={{
              color: 'rgba(255,255,255,0.2)',
              flexShrink: 0,
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'none',
            }}
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
  injectCSS();

  const collapsed = sidebarCollapsed;
  const W = collapsed ? 64 : 248;

  const isOpen = (k) => !!expandedModules[k];
  const perm   = (n) => !hasPermission || hasPermission(n);

  const initials = user?.full_name
    ? user.full_name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div
      className="sb"
      style={{
        width: W, minWidth: W, height: '100%',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.3s var(--premium-easing), min-width 0.3s var(--premium-easing)',
        borderRight: '1px solid rgba(255, 255, 255, 0.4)',
        zIndex: 40
      }}
    >

      {/* ══ LOGO ════════════════════════════════════════════ */}
      <div style={{
        padding: collapsed ? '14px 0' : '0 0 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        minHeight: collapsed ? 72 : 90,
      }}>
        {collapsed ? (
          /* Collapsed — initials square */
          <div className="sb-ava aurora-text" style={{ 
            width: 40, height: 40, borderRadius: 12,
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            {companyName ? companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'CD'}
          </div>
        ) : (
          /* Expanded — full logo image, same as original Dashboard */
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '12px 20px' }}>
            <img
              src={companyLogo || '/caldimlogo.png'}
              alt="Company Logo"
              style={{
                maxHeight: 60,
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))',
              }}
            />
          </div>
        )}
      </div>

      {/* ══ NAV ═════════════════════════════════════════════ */}
      <div
        className="sb-nav"
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: collapsed ? '8px 6px' : '8px 8px 20px',
        }}
      >

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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <SubBtn
                     icon={Table2}
                     label="Trackers Upload"
                     active={activeModule === 'upload-trackers'}
                     onClick={() => handleModuleClick('upload-trackers')}
                   />
                   <span 
                      style={{ padding: '0 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onClick={(e) => { e.stopPropagation(); toggleModuleExpansion('upload-trackers', e); }}
                   >
                     {uploadTrackerModules?.length > 0 && (
                        <ChevronDown size={14} strokeWidth={2} style={{
                           color: 'rgba(255,255,255,0.2)',
                           transition: 'transform 0.2s',
                           transform: isOpen('upload-trackers') ? 'rotate(180deg)' : 'none'
                        }} />
                     )}
                   </span>
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

      </div>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <div className="sb-foot" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div className="sb-ava">{initials}</div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13.5, fontWeight: 600, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{
                fontSize: 11, color: '#94a3b8',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginTop: 1,
              }}>
                {user?.role || 'Member'}
              </div>
            </div>
            <button className="sb-logout" onClick={onLogout} title="Logout">
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

    </div>
  );
}
