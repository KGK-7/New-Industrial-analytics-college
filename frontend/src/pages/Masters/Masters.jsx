import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  File, Clock, User, ChevronRight, Database, FileSpreadsheet,
  Archive, FileText, X, Eye, Edit, Check,
  Users, Package, Building, Briefcase,
  UserCog, FolderOpen, Square, Layers, BarChart3, FileUp, ArrowRight,
  Shield, FolderKanban, Download, Share2, Star, MoreVertical, Globe,
  Filter, Grid, List, Sparkles, Bookmark, Activity, Zap, Wallet
} from 'lucide-react';

// File Content Viewer Component (enhanced)
const FileContentViewer = ({ fileData, trackerInfo, onClose, onSaveData }) => {
  const [editedData, setEditedData] = useState(fileData?.data || []);
  const [editedHeaders, setEditedHeaders] = useState(fileData?.headers || []);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState('');

  const handleSave = () => {
    onSaveData({
      ...fileData,
      data: editedData,
      headers: editedHeaders
    });
    setIsEditing(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(editedData.map((_, index) => index)));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === editedData.length);
  };

  const handleDeleteSelected = () => {
    const newData = editedData.filter((_, index) => !selectedRows.has(index));
    setEditedData(newData);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const handleCellClick = (rowIndex, colIndex, value) => {
    if (!isEditing) return;
    setEditingCell({ rowIndex, colIndex });
    setCellValue(value || '');
  };

  const handleCellChange = (e) => {
    setCellValue(e.target.value);
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const { rowIndex, colIndex } = editingCell;
      const newData = [...editedData];
      newData[rowIndex][colIndex] = cellValue;
      setEditedData(newData);
      setEditingCell(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    }
  };

  if (!fileData || !trackerInfo) return null;

  const renderTableView = () => {
    if (!editedData || editedData.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-[var(--border-main)]">
          <Database className="h-12 w-12 text-[var(--text-subtle)] mx-auto mb-4" />
          <p className="text-[var(--text-main)] font-bold uppercase tracking-widest text-xs">No data available</p>
        </div>
      );
    }

    return (
      <div className="overflow-auto border border-[var(--border-main)] bg-white">
        <table className="min-w-full divide-y divide-[var(--border-main)] font-mono">
          <thead className="bg-[#F4F4F5] sticky top-0">
            <tr>
              <th className="px-3 py-3 w-10">
                {isEditing && (
                  <button onClick={handleSelectAll} className="focus:outline-none hover:scale-110 transition-transform">
                    {selectAll ? (
                      <div className="bg-[#1e3a5f] rounded p-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <Square className="h-4 w-4 text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60" />
                    )}
                  </button>
                )}
              </th>
              {editedHeaders.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`transition-colors duration-100 border-b border-[var(--border-light)] ${
                  selectedRows.has(rowIndex) ? 'bg-[#18181B] text-white' : 'hover:bg-[var(--bg-app)]'
                }`}
              >
                <td className="px-3 py-2">
                  {isEditing && (
                    <button onClick={() => handleRowSelect(rowIndex)} className="focus:outline-none">
                      {selectedRows.has(rowIndex) ? (
                        <div className="bg-white text-black p-0.5 border border-black">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="h-4 w-4 border border-[var(--border-main)] bg-white" />
                      )}
                    </button>
                  )}
                </td>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-sm text-gray-700"
                    onClick={() => handleCellClick(rowIndex, colIndex, cell)}
                  >
                    {editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex ? (
                      <input
                        type="text"
                        value={cellValue}
                        onChange={handleCellChange}
                        onBlur={handleCellBlur}
                        onKeyPress={handleKeyPress}
                        className="w-full px-2 py-1 bg-white border border-black focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="block min-h-[20px] hover:text-[#1e3a5f] transition-colors">{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-[var(--border-main)]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#18181B]">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{trackerInfo.fileName}</h2>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>{trackerInfo.uploadedBy}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{new Date(trackerInfo.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedRows.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-widest hover:bg-red-200 transition-all border border-red-300"
            >
              Delete ({selectedRows.size})
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-all ${
              isEditing
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-zinc-100 text-zinc-800 border-zinc-300'
            }`}
          >
            {isEditing ? 'Editing Mode' : 'Edit Mode'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-[#18181B] text-white text-xs font-bold uppercase tracking-widest border border-black hover:bg-black transition-all"
            >
              Save Data
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white border border-[var(--border-main)] overflow-hidden">
        {renderTableView()}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gradient-to-r from-white to-[#f8faff] p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-[#1e3a5f]">{editedData.length}</span>
            <span>Rows</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-1">
            <span className="font-medium text-[#1e3a5f]">{editedHeaders.length}</span>
            <span>Columns</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>Last modified: Just now</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon for each master module
const getMasterIcon = (masterName) => {
  const icons = {
    'Employee Master': <Users className="h-5 w-5" />,
    'Project Master': <FolderKanban className="h-5 w-5" />
  };
  return icons[masterName] || <Database className="h-5 w-5" />;
};

// Main Masters Component
const Masters = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dynamicModules, setDynamicModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackers, setTrackers] = useState([]);
  const [uploadedFilesData, setUploadedFilesData] = useState({});
  const [hoveredModule, setHoveredModule] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [counts, setCounts] = useState({ employees: 0, projects: 0, budgets: 0 });

  // File viewer modal state
  const [fileViewerModal, setFileViewerModal] = useState({
    isOpen: false,
    fileData: null,
    trackerInfo: null
  });

  // Master modules data
  const staticMasterModules = [
  {
    id: 'employee-master',
    name: 'Employee Master',
    subtitle: 'Manage organizational hierarchy and data',
    code: 'EM',
    icon: <Users className="h-4 w-4" />,
    path: '/dashboard/masters/employees',
    ctaLabel: 'Open employee data',
    badgeStyles: { bg: '#DBEAFE', text: '#1E40AF' },
    gist: [
      { label: 'Roles & permissions', key: 'roles', icon: <UserCog className="h-4 w-4" /> },
      { label: 'Access levels', key: 'access', icon: <Shield className="h-4 w-4" /> },
      { label: 'Employees', key: 'employees', icon: <Users className="h-4 w-4" /> }
    ]
  },
  {
    id: 'project-master',
    name: 'Project Master',
    subtitle: 'Track project lifecycle and configurations',
    code: 'PM',
    icon: <FolderKanban className="h-4 w-4" />,
    path: '/dashboard/masters/project-master',
    ctaLabel: 'Open project data',
    badgeStyles: { bg: '#EDE9FE', text: '#5B21B6' },
    gist: [
      { label: 'Projects', key: 'projects', icon: <Grid className="h-4 w-4" /> },
      { label: 'Team members', key: 'team', icon: <Users className="h-4 w-4" /> },
      { label: 'Milestones', key: 'milestones', icon: <Activity className="h-4 w-4" /> }
    ]
  },
  {
    id: 'budget-master',
    name: 'Budget Master',
    subtitle: 'Financial governance and expense tracking',
    code: 'BM',
    icon: <Wallet className="h-4 w-4" />,
    path: '/dashboard/masters/budget-master',
    ctaLabel: 'Open budget data',
    badgeStyles: { bg: '#DCFCE7', text: '#166534' },
    gist: [
      { label: 'Budget lines', key: 'budgets', icon: <Database className="h-4 w-4" /> },
      { label: 'Change log', key: 'audit', icon: <FileText className="h-4 w-4" /> },
      { label: 'Currency', key: 'currency', icon: <Globe className="h-4 w-4" /> }
    ]
  }
];

  // Load dynamic modules
  useEffect(() => {
    const loadDynamicModules = () => {
      try {
        const savedMasterFiles = localStorage.getItem('master_files');
        const masterFiles = savedMasterFiles ? JSON.parse(savedMasterFiles) : [];

        // Filter static modules based on user permissions
        const hasPermission = (moduleName) => {
          if (user?.role === 'Admin') return true;
          if (!user?.permissions) return false;
          return user.permissions.includes(moduleName);
        };

        const filteredStaticModules = staticMasterModules.filter(m => hasPermission(m.name));

        const masterModulesWithFiles = filteredStaticModules.map(master => {
          const masterFileModules = masterFiles
            .filter(file => file.masterId === master.id)
            .map(file => ({
              id: file.id,
              name: file.fileName,
              trackerId: file.trackerId,
              uploadedBy: file.uploadedBy,
              uploadDate: file.uploadDate,
              size: file.size || '1.2 MB',
              type: file.type || 'csv'
            }));

          return {
            ...master,
            submodules: masterFileModules,
            fileCount: masterFileModules.length
          };
        });

        setDynamicModules(masterModulesWithFiles);

        const savedTrackers = localStorage.getItem('upload_trackers');
        setTrackers(savedTrackers ? JSON.parse(savedTrackers) : []);

        const savedFilesData = localStorage.getItem('uploaded_files_data');
        setUploadedFilesData(savedFilesData ? JSON.parse(savedFilesData) : {});
      } catch (error) {
        console.error('Error loading master modules:', error);
        setDynamicModules(staticMasterModules.map(m => ({ ...m, submodules: [], fileCount: 0 })));
      } finally {
        setLoading(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const [empRes, projRes, budRes] = await Promise.all([
          API.get('/employees'),
          API.get('/projects/'),
          API.get('/budget/')
        ]);
        setCounts({
          employees: empRes.data?.length || 0,
          projects: projRes.data?.length || 0,
          budgets: budRes.data?.length || 0
        });
      } catch (err) {
        console.error('Error fetching master counts:', err);
      }
    };

    loadDynamicModules();
    fetchCounts();

    const handleMastersUpdate = () => {
      loadDynamicModules();
      fetchCounts();
    };

    window.addEventListener('mastersUpdate', handleMastersUpdate);

    return () => {
      window.removeEventListener('mastersUpdate', handleMastersUpdate);
    };
  }, []);

  // Handle module click - Navigate to the correct submodule path
  const handleModuleClick = (moduleId) => {
    const module = staticMasterModules.find(m => m.id === moduleId);
    if (module) navigate(module.path);
  };

  // Handle "Open Module" button click
  const handleOpenModule = (masterModuleId) => {
    localStorage.setItem('active_master_submodule', masterModuleId);

    // Find the module to get its path
    const module = staticMasterModules.find(m => m.id === masterModuleId);
    const path = module ? module.path : '/dashboard/masters';

    const event = new CustomEvent('openMasterSubmodule', {
      detail: { masterModuleId }
    });
    window.dispatchEvent(event);

    navigate(path);
  };

  // Handle file click
  const handleFileClick = async (fileModule, e) => {
    e.stopPropagation();

    const trackerInfo = trackers.find(t => t.id === fileModule.trackerId);
    if (!trackerInfo) return;

    const fileData = uploadedFilesData[fileModule.trackerId];
    if (!fileData) return;

    setFileViewerModal({
      isOpen: true,
      fileData: fileData,
      trackerInfo: trackerInfo
    });
  };

  // Close file viewer
  const handleCloseFileViewer = () => {
    setFileViewerModal({
      isOpen: false,
      fileData: null,
      trackerInfo: null
    });
  };

  // Save file data
  const handleSaveFileData = (trackerId, updatedFileData) => {
    const newFilesData = { ...uploadedFilesData, [trackerId]: updatedFileData };
    setUploadedFilesData(newFilesData);
    localStorage.setItem('uploaded_files_data', JSON.stringify(newFilesData));

    if (fileViewerModal.trackerInfo?.id === trackerId) {
      setFileViewerModal(prev => ({
        ...prev,
        fileData: updatedFileData
      }));
    }
  };

  // Get file icon with colors
  const getFileIcon = (fileName, type) => {
    if (!fileName) return <FileText className="h-4 w-4" />;

    const ext = type || fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case 'json':
        return <Database className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  // Filter modules by category
  const filteredModules = selectedCategory === 'all' 
    ? dynamicModules 
    : dynamicModules.filter(m => m.fileCount > 0);

  // Loading state with enhanced animation
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-8">
        <div className="w-64 h-2 bg-[var(--border-main)] overflow-hidden">
          <div className="h-full bg-[var(--brand-primary)] animate-[shimmer_1.5s_infinite]" style={{ width: '40%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* File Viewer Modal */}
      {fileViewerModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-auto border border-black shadow-none">
            <FileContentViewer
              fileData={fileViewerModal.fileData}
              trackerInfo={fileViewerModal.trackerInfo}
              onClose={handleCloseFileViewer}
              onSaveData={(updatedData) =>
                handleSaveFileData(fileViewerModal.trackerInfo.id, updatedData)
              }
            />
          </div>
        </div>
      )}

      {/* Masters Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-[var(--border-main)]">
        {filteredModules.map((module) => (
            <div
              key={module.id}
              className="system-panel bg-white flex flex-col hover:bg-[var(--bg-app)] border-r border-b border-[var(--border-main)] transition-all duration-100 cursor-pointer relative group p-6"
              onClick={() => handleModuleClick(module.id)}
            >
              {/* Header Info */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 flex items-center justify-center font-mono font-bold text-base border border-black bg-[#18181B] text-white"
                  >
                    {module.code}
                  </div>
                  <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em] leading-tight">
                    {module.name}
                  </h3>
                </div>
              </div>

              {/* Gist List */}
              <div className="space-y-4 mb-4">
                {module.gist.map((item, idx) => {
                  let displayVal = '';
                  if (item.key === 'employees' || (module.id === 'employee-master' && item.key === 'roles')) {
                    displayVal = item.key === 'employees' ? `${counts.employees} employees` : '';
                  } else if (item.key === 'projects') {
                    displayVal = `${counts.projects} projects`;
                  } else if (item.key === 'budgets') {
                    displayVal = `${counts.budgets} budget lines`;
                  }

                  return (
                    <div key={idx} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-2">
                        <div className="text-[#9CA3AF] h-4 w-4 flex-shrink-0">
                          {React.cloneElement(item.icon, { className: "h-4 w-4" })}
                        </div>
                        <span className="text-[13px] font-medium text-[#374151]">
                          {item.label}
                        </span>
                      </div>
                      {displayVal && (
                        <span className="text-[11px] font-bold text-[var(--text-main)] font-mono">
                          {displayVal}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em] text-[var(--brand-primary)]">
                  <span>{module.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Masters;