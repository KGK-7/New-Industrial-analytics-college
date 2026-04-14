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
        <div className="text-center py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/5 to-transparent rounded-full blur-3xl"></div>
            <Database className="h-16 w-16 text-[#1e3a5f]/20 mx-auto mb-4 relative" />
          </div>
          <p className="text-gray-500 font-medium">No data available in this file</p>
          <p className="text-sm text-gray-400 mt-1">Upload data to get started</p>
        </div>
      );
    }

    return (
      <div className="overflow-auto border border-gray-200 rounded-xl bg-white shadow-lg shadow-[#1e3a5f]/5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-[#f0f5fa] to-[#e6eef8] sticky top-0">
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
                className={`hover:bg-gradient-to-r hover:from-[#f0f5fa] hover:to-transparent transition-all duration-200 ${
                  selectedRows.has(rowIndex) ? 'bg-[#1e3a5f]/5' : ''
                }`}
              >
                <td className="px-3 py-2">
                  {isEditing && (
                    <button onClick={() => handleRowSelect(rowIndex)} className="focus:outline-none hover:scale-110 transition-transform">
                      {selectedRows.has(rowIndex) ? (
                        <div className="bg-[#1e3a5f] rounded p-0.5">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <Square className="h-4 w-4 text-gray-400 hover:text-[#1e3a5f]/40" />
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
                        className="w-full px-2 py-1 border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] shadow-sm"
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
      <div className="flex items-center justify-between bg-gradient-to-r from-white to-[#f8faff] p-4 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-[#1e3a5f] to-[#2c4c7c] rounded-xl shadow-lg shadow-[#1e3a5f]/20">
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
              className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg text-sm font-medium hover:from-red-100 hover:to-red-200 transition-all duration-200 flex items-center shadow-sm border border-red-200"
            >
              <Archive className="h-4 w-4 mr-1" />
              Delete ({selectedRows.size})
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-sm ${
              isEditing
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-600 border border-green-200 hover:from-green-100 hover:to-green-200'
                : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200 hover:from-gray-100 hover:to-gray-200'
            }`}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Editing Mode' : 'Edit Mode'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-gradient-to-r from-[#1e3a5f] to-[#2c4c7c] text-white rounded-lg text-sm font-medium hover:from-[#2c4c7c] hover:to-[#1e3a5f] transition-all duration-200 flex items-center shadow-lg shadow-[#1e3a5f]/20"
            >
              <Check className="h-4 w-4 mr-1" />
              Save Changes
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#f0f5fa] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-[#1e3a5f]/10 border-t-[#1e3a5f] mx-auto mb-4"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading Masters</h3>
          <p className="text-sm text-gray-500">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#f0f5fa] p-4 sm:p-6 lg:p-8">
      {/* File Viewer Modal */}
      {fileViewerModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-auto shadow-2xl transform transition-all animate-slideUp">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {filteredModules.map((module) => (
            <div
              key={module.id}
              className="premium-card p-5 bg-white flex flex-col hover:border-[var(--brand-primary)] hover:ring-1 hover:ring-[var(--brand-primary)] transition-all duration-300 cursor-pointer relative group"
              onClick={() => handleModuleClick(module.id)}
            >
              {/* Header Info */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-sm border border-transparent transition-colors"
                    style={{ 
                      backgroundColor: module.badgeStyles.bg, 
                      color: module.badgeStyles.text 
                    }}
                  >
                    {module.code}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] m-0 truncate leading-tight group-hover:text-[var(--brand-primary)] transition-colors">
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
              <div className="mt-auto pt-4 border-t border-[#F3F4F6] group-hover:border-blue-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#2563EB] group-hover:underline transition-all">
                    {module.ctaLabel}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--text-meta)] transform group-hover:translate-x-1 group-hover:text-[var(--brand-primary)] transition-all" />
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Masters;