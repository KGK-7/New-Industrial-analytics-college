import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import Sidebar from '../components/Sidebar';
import {
  setActiveModule,
  setExpandedModules,
  toggleModuleExpansion as toggleExpansion,
  setSelectedProjectFileId,
  setSelectedUploadFileId,
  setActiveProjectName,
  setSidebarCollapsed,
  setBranding
} from '../store/slices/navSlice';
import { logout } from '../store/slices/authSlice';
import { 
  Squares2X2Icon as LayoutIcon, 
  ArrowsPointingOutIcon as Maximize2, 
  ArrowsPointingInIcon as Minimize2, 
  PaperAirplaneIcon as Send, 
  EnvelopeIcon as Mail, 
  MagnifyingGlassIcon as Search, 
  PencilSquareIcon as Edit, 
  PlusIcon as Plus, 
  TrashIcon as Trash2, 
  XMarkIcon as X, 
  FunnelIcon as Filter, 
  ChevronUpIcon as ChevronUp, 
  ChevronDownIcon as ChevronDown, 
  ChevronLeftIcon as ChevronLeft, 
  CheckIcon as Check, 
  BookmarkIcon as Save, 
  Cog6ToothIcon as Settings,
  UsersIcon as Users, 
  ShieldCheckIcon as Shield, 
  FolderIcon as FolderKanban, 
  InboxStackIcon as Package, 
  BuildingOfficeIcon as Building, 
  ArchiveBoxIcon as Database, 
  ArrowUpTrayIcon as FileUp, 
  ArrowRightOnRectangleIcon as LogOut, 
  Bars3Icon as Menu, 
  UserIcon, 
  BellIcon as Bell, 
  ChevronRightIcon as ChevronRight, 
  PresentationChartBarIcon as Projector, 
  DocumentTextIcon as FileText, 
  GlobeAltIcon as Globe, 
  ClockIcon as Clock, 
  ChartBarIcon as BarChart3, 
  ChartPieIcon as PieChart, 
  ArrowTrendingUpIcon as LineChart,
  ChatBubbleLeftRightIcon as MessageSquare, 
  FolderPlusIcon as FolderTree, 
  CalendarIcon as Calendar, 
  WalletIcon as Wallet 
} from '@heroicons/react/24/outline';

import API from "../utils/api";

// ============================================================================
// SIDEBAR MANAGER
// ============================================================================
const sidebarManager = {
  loadUploadTrackerModules: () => {
    try {
      const saved = localStorage.getItem('upload_tracker_modules');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading upload tracker modules:', error);
      return [];
    }
  },

  loadProjectDashboardModules: () => {
    try {
      const saved = localStorage.getItem('project_dashboard_modules');
      const allModules = saved ? JSON.parse(saved) : [];
      return Array.isArray(allModules) ? allModules.filter(m => m && m.type === 'project' && m.context === 'project-dashboard') : [];
    } catch (error) {
      console.error('Error loading project dashboard modules:', error);
      return [];
    }
  }
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get state from Redux
  const user = useSelector(state => state.auth.user);
  const {
    activeModule,
    expandedModules,
    selectedProjectFileId,
    selectedUploadFileId,
    activeProjectName,
    sidebarCollapsed,
    companyLogo,
    companyName
  } = useSelector(state => state.nav);

  // Fetch settings on mount
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await API.get('/settings/');
        const settings = response.data;
        const logo = settings.find(s => s.key === 'company_logo')?.value;
        const name = settings.find(s => s.key === 'company_name')?.value;
        dispatch(setBranding({ companyLogo: logo, companyName: name }));
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchCompanySettings();
  }, [dispatch]);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Dynamic modules
  const [uploadTrackerModules, setUploadTrackerModules] = useState([]);
  const [projectDashboardModules, setProjectDashboardModules] = useState([]);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const [hoveredModule, setHoveredModule] = useState(null);

  const profileMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, right: 0 });

  // Custom Layers Icon since it might not have a direct Heroicon equivalent
  const LayersIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125L12 12.375l9.75-5.25M2.25 12l9.75 5.25 9.75-5.25M2.25 16.875L12 22.125l9.75-5.25" />
    </svg>
  );

  const mastersSubmodules = useMemo(() => [
    { id: 'employee-master', name: 'Employee Master', path: 'masters/employees', icon: <Users className="h-5 w-5" />, color: '#000000' },
    { id: 'project-master', name: 'Project Master', path: 'masters/project-master', icon: <FolderKanban className="h-5 w-5" />, color: '#333333' },
    { id: 'budget-master', name: 'Budget Master', path: 'masters/budget-master', icon: <Wallet className="h-5 w-5" />, color: '#000000' },
  ], []);

  const mastersModules = useMemo(() => [
    { id: 'masters-main', name: 'Masters', path: 'masters', icon: <Database className="h-5 w-5" /> },
  ], []);

  const uploadsSubmodules = useMemo(() => [
    { id: 'upload-trackers', name: 'Trackers Upload', path: 'trackers', icon: <FileUp className="h-5 w-5" /> },
    { id: 'budget-upload', name: 'Budget Upload', path: 'budget-upload', icon: <FileUp className="h-5 w-5" /> }
  ], []);
  const uploadsModules = useMemo(() => [
    { id: 'uploads-main', name: 'Uploads', path: 'trackers', icon: <FileUp className="h-5 w-5" /> }
  ], []);

  const otherModules = useMemo(() => [
    { id: 'system-settings', name: 'Settings', path: 'settings', icon: <Settings className="h-5 w-5" /> },
  ], []);


  // Permission check helper
  const hasPermission = (moduleName) => {
    if (user?.role === 'Admin') return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(moduleName);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sidebarRef.current) {
        // Any specific cleanup
      }
    };
  }, []);

  // ==========================================================================
  // HELPER FUNCTION TO CAPITALIZE FIRST LETTER
  // ==========================================================================
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    let processed = string.replace(/tata\s+motors/ig, 'TATA');
    return processed.charAt(0).toUpperCase() + processed.slice(1);
  };

  // ==========================================================================
  // LOAD MODULES FROM API
  // ==========================================================================
  const loadDynamicModules = async () => {
    try {
      const [datasetsResp, budgetsResp] = await Promise.all([
        API.get('/datasets/'),
        API.get('/budget/')
      ]);
      
      const datasets = datasetsResp.data;
      const budgets = budgetsResp.data || [];
      const projectsWithBudget = new Set(budgets.map(b => capitalizeFirstLetter(b.project_name)));

      const uploadProjectsMap = new Map();
      const dashProjectsMap = new Map();

      // First, ensure all projects with budgets are in the map
      projectsWithBudget.forEach(projectName => {
        const projectId = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!dashProjectsMap.has(projectName)) {
          dashProjectsMap.set(projectName, {
            id: `project-dashboard-${projectId}`,
            moduleId: `project-dashboard-${projectId}`,
            name: projectName,
            projectName: projectName,
            type: 'project',
            context: 'project-dashboard',
            isExpanded: false,
            submodules: []
          });
        }
      });

      datasets.forEach(dataset => {
        const projectName = capitalizeFirstLetter(dataset.project || 'Uncategorized');
        const projectId = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // NEW: Helper to get clean display name by stripping project prefix
        const getCleanDisplayName = (fileName, project) => {
          if (!fileName) return '';
          let name = fileName;
          // Strip project prefix if it exists
          if (project && name.toLowerCase().startsWith(project.toLowerCase() + "_")) {
            name = name.substring(project.length + 1);
          }
          // Remove extension and capitalize
          return capitalizeFirstLetter(name.replace(/\.[^/.]+$/, ""));
        };

        const cleanDisplayName = getCleanDisplayName(dataset.fileName, dataset.project);

        // --- Dashboard / Project Context ---
        if (!dashProjectsMap.has(projectName)) {
          dashProjectsMap.set(projectName, {
            id: `project-dashboard-${projectId}`,
            moduleId: `project-dashboard-${projectId}`,
            name: projectName,
            projectName: projectName,
            type: 'project',
            context: 'project-dashboard',
            isExpanded: false,
            submodules: []
          });
        }

        const dashProject = dashProjectsMap.get(projectName);

        if (!dashProject.submodules.some(sub => sub.trackerId === dataset.id)) {
          dashProject.submodules.push({
            id: `project-file-${dataset.id}`,
            moduleId: `project-file-${dataset.id}`,
            trackerId: dataset.id,
            name: dataset.fileName,
            displayName: cleanDisplayName,
            type: 'file',
            projectName: projectName,
            context: 'project-dashboard'
          });
        }

        // --- Upload Management Context ---
        if (!uploadProjectsMap.has(projectName)) {
          uploadProjectsMap.set(projectName, {
            id: `upload-project-${projectId}`,
            moduleId: `upload-project-${projectId}`,
            name: projectName,
            projectName: projectName,
            type: 'project',
            context: 'upload-management',
            isExpanded: false,
            submodules: []
          });
        }

        const uploadProject = uploadProjectsMap.get(projectName);

        if (!uploadProject.submodules.some(sub => sub.trackerId === dataset.id)) {
          uploadProject.submodules.push({
            id: `upload-file-${dataset.id}`,
            moduleId: `upload-file-${dataset.id}`,
            trackerId: dataset.id,
            name: dataset.fileName,
            displayName: cleanDisplayName,
            type: 'file',
            projectName: projectName,
            context: 'upload-management'
          });
        }
      });

      // Ensure projects with budget have a Budget Summary submodule
      for (const project of dashProjectsMap.values()) {
        const hasBudget = project.submodules.some(sub => sub.type === 'budget');
        if (!hasBudget && projectsWithBudget.has(project.name)) {
          project.submodules.push({
            id: `budget-${project.id}`,
            moduleId: `budget-${project.id}`,
            trackerId: `budget-${project.id}`,
            name: 'Budget Summary',
            displayName: 'Budget Summary',
            type: 'budget',
            projectName: project.projectName,
            context: 'project-dashboard'
          });
        }
      }

      setProjectDashboardModules(Array.from(dashProjectsMap.values()));
      setUploadTrackerModules(Array.from(uploadProjectsMap.values()));
    } catch (error) {
      console.error('Error loading dynamic modules from API:', error);
    }
  };

  useEffect(() => {
    loadDynamicModules();
  }, []);

  // Storage listeners
  useEffect(() => {
    const handleUploadTrackerUpdate = () => loadDynamicModules();
    const handleProjectDashboardUpdate = () => loadDynamicModules();
    const handleStorageChange = (e) => {
      if (e.key === 'upload_tracker_modules' || e.key === 'project_dashboard_modules') {
        loadDynamicModules();
      }
    };

    window.addEventListener('uploadTrackerUpdate', handleUploadTrackerUpdate);
    window.addEventListener('projectDashboardUpdate', handleProjectDashboardUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('uploadTrackerUpdate', handleUploadTrackerUpdate);
      window.removeEventListener('projectDashboardUpdate', handleProjectDashboardUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync with URL on route changes
  useEffect(() => {
    const path = location.pathname;

    // First check masters submodules
    const mastersSub = mastersSubmodules.find(sub => path.includes(`/dashboard/${sub.path}`));
    if (mastersSub) {
      dispatch(setActiveModule(mastersSub.id));
      return;
    }

    // Then check uploads submodules
    const uploadsSub = uploadsSubmodules.find(sub => path.includes(`/dashboard/${sub.path}`));
    if (uploadsSub) {
      dispatch(setActiveModule(uploadsSub.id));
      return;
    }

    // Then check other specific submodules if any
    const otherSub = otherModules.find(sub => path.includes(`/dashboard/${sub.path}`));
    if (otherSub) {
      dispatch(setActiveModule(otherSub.id));
      return;
    }

    if (path.includes('/dashboard/projects')) dispatch(setActiveModule('project-dashboard'));
    else if (path.includes('/dashboard/trackers')) dispatch(setActiveModule('upload-trackers'));
    else if (path.includes('/dashboard/budget-summary')) {
      dispatch(setActiveModule('project-dashboard'));
      // Extract project name from path if possible to set selectedProjectFileId
      const pathParts = path.split('/');
      const projectName = decodeURIComponent(pathParts[pathParts.length - 1]);
      if (projectName) {
        const projectId = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        dispatch(setSelectedProjectFileId(`budget-project-dashboard-${projectId}`));
      }
    }
    else if (path.includes('/dashboard/masters')) dispatch(setActiveModule('masters-main'));
    else if (path.includes('/dashboard/mom')) dispatch(setActiveModule('mom-module'));
    else if (path.includes('/dashboard/meetings')) dispatch(setActiveModule('meetings'));
    else if (path.includes('/dashboard/schedule-meeting')) dispatch(setActiveModule('schedule-meeting'));
    else if (path.includes('/dashboard/settings')) dispatch(setActiveModule('system-settings'));
  }, [location.pathname, dispatch, mastersSubmodules, otherModules]);

  // DateTime
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside for profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update profile menu position when opened
  useEffect(() => {
    if (profileMenuOpen && profileMenuRef.current) {
      const rect = profileMenuRef.current.getBoundingClientRect();
      setProfileMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [profileMenuOpen]);

  // Handle window resize for profile menu
  useEffect(() => {
    const handleResize = () => {
      if (profileMenuOpen && profileMenuRef.current) {
        const rect = profileMenuRef.current.getBoundingClientRect();
        setProfileMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  // Open master submodule
  useEffect(() => {
    const handleOpenMasterSubmodule = (event) => {
      const { masterModuleId } = event.detail;
      handleModuleClick(masterModuleId);
      dispatch(setExpandedModules({ 'masters': true }));
    };

    window.addEventListener('openMasterSubmodule', handleOpenMasterSubmodule);
    return () => window.removeEventListener('openMasterSubmodule', handleOpenMasterSubmodule);
  }, [dispatch]);

  // ==========================================================================
  // FIXED: Handle project dashboard file open events with better state management
  // ==========================================================================
  useEffect(() => {
    const handleOpenProjectDashboardFile = (event) => {
      const { trackerId, fileModule, projectName } = event.detail;

      // Set the selected file ID
      setSelectedProjectFileId(trackerId);

      // Ensure project dashboard is active
      if (activeModule !== 'project-dashboard') {
        setActiveModule('project-dashboard');
      }

      // Ensure project dashboard is expanded
      dispatch(setExpandedModules({ 'project-dashboard': true }));

      // Find and expand the parent project module
      if (fileModule && fileModule.projectName) {
        // Find the project in projectDashboardModules
        const project = projectDashboardModules.find(p =>
          p.name === fileModule.projectName ||
          p.projectName === fileModule.projectName
        );

        if (project) {
          const projectKey = project.id || project.projectId || project.name;
          dispatch(setExpandedModules({
            [`project-dashboard-${projectKey}`]: true
          }));
        }
      }
    };

    window.addEventListener('openProjectDashboardFile', handleOpenProjectDashboardFile);
    return () => window.removeEventListener('openProjectDashboardFile', handleOpenProjectDashboardFile);
  }, [activeModule, projectDashboardModules]);

  useEffect(() => {
    const handleOpenProjectDashboardMain = (event) => {
      const { projectId } = event.detail;
      const project = projectDashboardModules.find(p => p.id === projectId || p.name === projectId || p.projectId === projectId);
      if (project && project.name) {
        setActiveProjectName(project.name);
      } else {
        setActiveProjectName(projectId);
      }
    };

    const handleResetProjectDashboardMain = () => {
      dispatch(setActiveProjectName(null));
    };

    window.addEventListener('openProjectDashboardMain', handleOpenProjectDashboardMain);
    window.addEventListener('resetProjectDashboardMain', handleResetProjectDashboardMain);
    return () => {
      window.removeEventListener('openProjectDashboardMain', handleOpenProjectDashboardMain);
      window.removeEventListener('resetProjectDashboardMain', handleResetProjectDashboardMain);
    };
  }, [projectDashboardModules]);

  // ==========================================================================
  // FIXED: Effect to ensure project file selection persists
  // ==========================================================================
  useEffect(() => {
    // If we have a selected project file ID and we're on project dashboard,
    // ensure the parent module is expanded
    if (activeModule === 'project-dashboard' && selectedProjectFileId) {
      // Find which project contains this file
      for (const project of projectDashboardModules) {
        const file = project.submodules?.find(s => s.trackerId === selectedProjectFileId);
        if (file) {
          const projectKey = project.id || project.projectId || project.name;
          dispatch(setExpandedModules({
            'project-dashboard': true,
            [`project-dashboard-${projectKey}`]: true
          }));
          break;
        }
      }
    }
  }, [activeModule, selectedProjectFileId, projectDashboardModules, dispatch]);

  // Helper functions
  const getUserInitial = () => {
    if (user?.full_name) {
      const names = user.full_name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.full_name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getAvatarColor = () => {
    return 'bg-black';
  };

  const getActiveModuleName = () => {
    if (activeModule === 'project-dashboard') return 'Project Dashboard';
    if (activeModule === 'masters-main') return 'Masters';
    if (activeModule === 'mom-module') return 'Minutes of Meeting';
    if (activeModule === 'meetings') return 'Meetings Console';
    if (activeModule === 'schedule-meeting') return 'Schedule Meeting';

    const allModules = [...mastersModules, ...mastersSubmodules, ...uploadsModules, ...uploadsSubmodules, ...otherModules];
    const module = allModules.find(m => m.id === activeModule);
    return module ? module.name : 'Project Dashboard';
  };

  // ==========================================================================
  // FIXED: Get header title using context-specific selected file IDs
  // ==========================================================================
  const getHeaderTitle = () => {
    if (activeModule === 'upload-trackers' && selectedUploadFileId) {
      for (const proj of uploadTrackerModules) {
        const file = proj.submodules?.find(s => s.trackerId === selectedUploadFileId);
        if (file) {
          // Use displayName which is now cleaned in loadDynamicModules
          return file.displayName || capitalizeFirstLetter((file.name || '').replace(/\.(xlsx|xls|csv|json|txt)$/i, ''));
        }
      }
      return 'Upload Trackers';
    }
    if (activeModule === 'project-dashboard' && selectedProjectFileId) {
      for (const proj of projectDashboardModules) {
        const file = proj.submodules?.find(s => s.trackerId === selectedProjectFileId);
        if (file) {
          // Use displayName which is now cleaned in loadDynamicModules
          return file.displayName || capitalizeFirstLetter((file.name || '').replace(/\.(xlsx|xls|csv|json|txt)$/i, ''));
        }
      }
    }
    if (activeModule === 'project-dashboard' && activeProjectName) {
      return `${capitalizeFirstLetter(activeProjectName)} Dashboard`;
    }
    return getActiveModuleName();
  };

  // ==========================================================================
  // HANDLE MODULE CLICK - UPDATED to match Masters behavior
  // ==========================================================================
    const handleModuleClick = (moduleId) => {
    dispatch(setActiveModule(moduleId));

    // Build path
    let path = 'projects';
    const allModules = [...mastersModules, ...mastersSubmodules, ...uploadsModules, ...uploadsSubmodules, ...otherModules];
    const module = allModules.find(m => m.id === moduleId);
    if (module) path = module.path;
    else if (moduleId === 'mom-module') path = 'mom';
    else if (moduleId === 'meetings') path = 'meetings';
    else if (moduleId === 'schedule-meeting') path = 'schedule-meeting';

    navigate(`/dashboard/${path}`);

    if (moduleId !== 'project-dashboard') {
      dispatch(setSelectedProjectFileId(null));
    } else {
      dispatch(setSelectedProjectFileId(null));
      window.dispatchEvent(new CustomEvent('resetProjectDashboardMain'));
    }

    if (moduleId !== 'upload-trackers') {
      dispatch(setSelectedUploadFileId(null));
    }

    if (moduleId === 'project-dashboard') {
      if (projectDashboardModules.length > 0 && !expandedModules['project-dashboard']) {
        dispatch(setExpandedModules({ 'project-dashboard': true }));
      }
    } else if (moduleId === 'masters-main') {
      dispatch(toggleExpansion('masters'));
    } else if (moduleId === 'uploads-main') {
      dispatch(toggleExpansion('uploads'));
    } else if (moduleId === 'mom-module') {
      if (!expandedModules['mom']) {
        dispatch(setExpandedModules({ 'mom': true }));
      }
    } else if (moduleId === 'upload-trackers') {
      if (uploadTrackerModules.length > 0 && !expandedModules['upload-trackers']) {
        dispatch(setExpandedModules({ 'upload-trackers': true }));
      }
    }
  };

  // ==========================================================================
  // TOGGLE MODULE EXPANSION
  // ==========================================================================
  const toggleModuleExpansion = (moduleId, e) => {
    if (e) {
      e.stopPropagation();
    }
    dispatch(toggleExpansion(moduleId));
  };

  // ==========================================================================
  // FIXED: Use context-specific file click handlers
  // ==========================================================================
  const handleFileModuleClick = (fileModule) => {
    dispatch(setActiveModule('upload-trackers'));
    dispatch(setSelectedUploadFileId(fileModule.trackerId));
    navigate('/dashboard/trackers');
  };

  // ==========================================================================
  // FIXED: Enhanced project file click handler
  // ==========================================================================
  const handleProjectFileClick = (fileModule) => {
    // Set the project-specific selected file ID
    dispatch(setSelectedProjectFileId(fileModule.trackerId));

    // Ensure we're on project dashboard
    if (activeModule !== 'project-dashboard') {
      dispatch(setActiveModule('project-dashboard'));
    }

    // Ensure project dashboard is expanded
    dispatch(setExpandedModules({ 'project-dashboard': true }));

    // Also expand the parent project module
    if (fileModule.projectName) {
      const project = projectDashboardModules.find(p =>
        p.name === fileModule.projectName ||
        p.projectName === fileModule.projectName
      );

      if (project) {
        const projectKey = project.id || project.projectId || project.name;
        dispatch(setExpandedModules({
          [`project-dashboard-${projectKey}`]: true
        }));
      }
    }

    if (fileModule.type === 'budget') {
      navigate(`/dashboard/budget-summary/${encodeURIComponent(fileModule.projectName)}`);
    } else {
      navigate('/dashboard/projects');
    }

    // Dispatch event for ProjectDashboard to handle
    window.dispatchEvent(new CustomEvent('openProjectDashboardFile', {
      detail: {
        trackerId: fileModule.trackerId,
        fileModule: fileModule,
        projectName: fileModule.projectName || 'Unknown'
      }
    }));
  };

  // ==========================================================================
  // FIXED: Check selection based on context
  // ==========================================================================
  const isFileSelected = (fileModule, context) => {
    if (context === 'upload-trackers') {
      return selectedUploadFileId === fileModule.trackerId;
    } else if (context === 'project-dashboard') {
      return selectedProjectFileId === fileModule.trackerId;
    }
    return false;
  };

  // ==========================================================================
  // RENDER FUNCTIONS - ALL WITH WHITE TEXT ON BLUE BACKGROUND
  // ==========================================================================

  const renderProjectDashboardModule = () => {
    if (!hasPermission('Dashboard')) return null;

    const isActive = activeModule === 'project-dashboard';
    const isExpanded = expandedModules['project-dashboard'];
    const hasDynamicModules = projectDashboardModules.length > 0;
    const isHovered = hoveredModule === 'project-dashboard';

    return (
      <div key="project-dashboard" className="mb-1.5">
        <div
          onMouseEnter={() => setHoveredModule('project-dashboard')}
          onMouseLeave={() => setHoveredModule(null)}
          onClick={() => handleModuleClick('project-dashboard')}
          className={`w-full flex items-center cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-3.5'
            } rounded-xl ${isActive
              ? 'bg-white/20 shadow-md text-white'
              : isHovered
                ? 'bg-white/15 shadow-sm text-white'
                : 'hover:bg-white/10 text-white'
            }`}
        >
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3.5' : 'justify-center'}`}>
            <div className={`transition-colors ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}>
              <BarChart3 className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-5 w-5'}`} />
            </div>
            {isSidebarExpanded && (
              <span className={`font-bold text-xs uppercase tracking-widest ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                Dashboard
              </span>
            )}
          </div>
          {isSidebarExpanded && hasDynamicModules && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleModuleExpansion('project-dashboard', e);
              }}
              className={`p-1.5 rounded-lg text-white ${isActive ? 'hover:bg-white/20' :
                isHovered ? 'hover:bg-white/15' :
                  'hover:bg-white/10'
                }`}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isSidebarExpanded && isExpanded && hasDynamicModules && (
          <div className="ml-7 mt-1.5 space-y-1.5">
            {projectDashboardModules.map(projectModule => renderProjectModule(projectModule, 'project-dashboard'))}
          </div>
        )}
      </div>
    );
  };

  const renderUploadTrackersModule = () => {
    if (!hasPermission('Upload Trackers')) return null;

    const isActive = activeModule === 'upload-trackers';
    const isExpanded = expandedModules['upload-trackers'];
    const hasDynamicModules = uploadTrackerModules.length > 0;
    const isHovered = hoveredModule === 'upload-trackers';

    return (
      <div key="upload-trackers" className="mb-1.5">
        <div
          onMouseEnter={() => setHoveredModule('upload-trackers')}
          onMouseLeave={() => setHoveredModule(null)}
          onClick={() => handleModuleClick('upload-trackers')}
          className={`w-full flex items-center cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-3.5'
            } rounded-xl ${isActive
              ? 'bg-white/20 shadow-md text-white'
              : isHovered
                ? 'bg-white/15 shadow-sm text-white'
                : 'hover:bg-white/10 text-white'
            }`}
        >
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3.5' : 'justify-center'}`}>
            <div className={`transition-colors text-white`}>
              <FileUp className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-5 w-5'}`} />
            </div>
            {isSidebarExpanded && (
              <span className={`font-semibold text-base text-white`}>
                Trackers
              </span>
            )}
          </div>
          {isSidebarExpanded && hasDynamicModules && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleModuleExpansion('upload-trackers', e);
              }}
              className={`p-1.5 rounded-lg text-white ${isActive ? 'hover:bg-white/20' :
                isHovered ? 'hover:bg-white/15' :
                  'hover:bg-white/10'
                }`}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isSidebarExpanded && isExpanded && hasDynamicModules && (
          <div className="ml-7 mt-1.5 space-y-1.5">
            {uploadTrackerModules.map(projectModule => renderProjectModule(projectModule, 'upload-trackers'))}
          </div>
        )}
      </div>
    );
  };

  const renderUploadsModule = () => {
    if (!hasPermission('Upload Trackers')) return null;

    const isExpanded = expandedModules['uploads'];
    const isActive = activeModule === 'uploads-main' || uploadsSubmodules.some(s => s.id === activeModule);
    const isHovered = hoveredModule === 'uploads-main';

    return (
      <div key="uploads" className="mb-1.5">
        <div
          onMouseEnter={() => setHoveredModule('uploads-main')}
          onMouseLeave={() => setHoveredModule(null)}
          onClick={() => handleModuleClick('uploads-main')}
          className={`w-full flex items-center cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-3.5'
            } rounded-xl ${isActive
              ? 'bg-white/20 shadow-md text-white'
              : isHovered
                ? 'bg-white/15 shadow-sm text-white'
                : 'hover:bg-white/10 text-white'
            }`}
        >
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3.5' : 'justify-center'}`}>
            <div className={`transition-colors text-white`}>
              <FolderTree className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-5 w-5'}`} />
            </div>
            {isSidebarExpanded && (
              <span className={`font-semibold text-base text-white`}>
                Uploads
              </span>
            )}
          </div>
          {isSidebarExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleModuleExpansion('uploads', e);
              }}
              className={`p-1.5 rounded-lg text-white ${isActive ? 'hover:bg-white/20' :
                isHovered ? 'hover:bg-white/15' :
                  'hover:bg-white/10'
                }`}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isSidebarExpanded && isExpanded && (
          <div className="ml-7 mt-1.5 space-y-1.5">
            {/*
              Embed the Upload Trackers tile (with its own dynamic project expansion)
            */}
            {renderUploadTrackersModule()}
            {/*
              Simple submodule button for Budget Upload
            */}
            {hasPermission('Budget Upload') && (
              <button
                key="budget-upload"
                onMouseEnter={() => setHoveredModule('budget-upload')}
                onMouseLeave={() => setHoveredModule(null)}
                onClick={() => handleModuleClick('budget-upload')}
                className={`w-full flex items-center space-x-3.5 rounded-lg px-3 py-2.5 transition-all duration-300 ${
                  activeModule === 'budget-upload'
                    ? 'bg-white/20 shadow-sm text-white'
                    : hoveredModule === 'budget-upload'
                      ? 'bg-white/15 shadow-sm text-white'
                      : 'hover:bg-white/10 text-white'
                }`}
              >
                <div className="text-white">
                  <FileUp className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium truncate text-white`}>
                  Budget Upload
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMOMModule = () => {
    if (!hasPermission('MOM')) return null;

    const isExpanded = expandedModules['mom'];
    const isActive = activeModule === 'mom-module' || activeModule === 'meetings';
    const isHovered = hoveredModule === 'mom-main';

    return (
      <div key="mom" className="mb-1.5">
        <div
          onMouseEnter={() => setHoveredModule('mom-main')}
          onMouseLeave={() => setHoveredModule(null)}
          onClick={() => handleModuleClick('mom-module')}
          className={`w-full flex items-center cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-3.5'
            } rounded-xl ${isActive
              ? 'bg-white/20 shadow-md text-white'
              : isHovered
                ? 'bg-white/15 shadow-sm text-white'
                : 'hover:bg-white/10 text-white'
            }`}
        >
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3.5' : 'justify-center'}`}>
            <div className={`transition-colors text-white`}>
              <MessageSquare className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-5 w-5'}`} />
            </div>
            {isSidebarExpanded && (
              <span className={`font-semibold text-base text-white`}>
                MOM
              </span>
            )}
          </div>
          {isSidebarExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleModuleExpansion('mom', e);
              }}
              className={`p-1.5 rounded-lg text-white ${isActive ? 'hover:bg-white/20' :
                isHovered ? 'hover:bg-white/15' :
                  'hover:bg-white/10'
                }`}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isSidebarExpanded && isExpanded && (
          <div className="ml-7 mt-1.5 space-y-1.5">
            <button
              key="meetings"
              onMouseEnter={() => setHoveredModule('meetings')}
              onMouseLeave={() => setHoveredModule(null)}
              onClick={() => handleModuleClick('meetings')}
              className={`w-full flex items-center space-x-3.5 rounded-lg px-3 py-2.5 transition-all duration-300 ${
                activeModule === 'meetings'
                  ? 'bg-white/20 shadow-sm text-white'
                  : hoveredModule === 'meetings'
                    ? 'bg-white/15 shadow-sm text-white'
                    : 'hover:bg-white/10 text-white'
              }`}
            >
              <div className="text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium truncate text-white`}>
                Meetings
              </span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderMastersModule = () => {
    const visibleSubmodules = mastersSubmodules.filter(sub => hasPermission(sub.name));
    if (visibleSubmodules.length === 0) return null;

    const isExpanded = expandedModules['masters'];
    const isActive = activeModule === 'masters-main' || mastersSubmodules.some(s => s.id === activeModule);
    const isHovered = hoveredModule === 'masters-main';

    return (
      <div key="masters" className="mb-1.5">
        <div
          onMouseEnter={() => setHoveredModule('masters-main')}
          onMouseLeave={() => setHoveredModule(null)}
          onClick={() => handleModuleClick('masters-main')}
          className={`w-full flex items-center cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-3.5'
            } rounded-xl ${isActive
              ? 'bg-white/20 shadow-md text-white'
              : isHovered
                ? 'bg-white/15 shadow-sm text-white'
                : 'hover:bg-white/10 text-white'
            }`}
        >
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3.5' : 'justify-center'}`}>
            <div className={`transition-colors text-white`}>
              <FolderTree className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-5 w-5'}`} />
            </div>
            {isSidebarExpanded && (
              <span className={`font-semibold text-base text-white`}>
                Masters
              </span>
            )}
          </div>
          {isSidebarExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleModuleExpansion('masters', e);
              }}
              className={`p-1.5 rounded-lg text-white ${isActive ? 'hover:bg-white/20' :
                isHovered ? 'hover:bg-white/15' :
                  'hover:bg-white/10'
                }`}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isSidebarExpanded && isExpanded && (
          <div className="ml-7 mt-1.5 space-y-1.5">
            {visibleSubmodules.map((submodule, index) => {
              const isSubmoduleActive = activeModule === submodule.id;
              const isSubmoduleHovered = hoveredModule === submodule.id;

              return (
                <button
                  key={submodule.id}
                  onMouseEnter={() => setHoveredModule(submodule.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  onClick={() => handleModuleClick(submodule.id)}
                  className={`w-full flex items-center space-x-3.5 rounded-lg px-3 py-2.5 transition-all duration-300 ${isSubmoduleActive
                    ? 'bg-white/20 shadow-sm text-white'
                    : isSubmoduleHovered
                      ? 'bg-white/15 shadow-sm text-white'
                      : 'hover:bg-white/10 text-white'
                    }`}
                >
                  <div className="text-white">
                    {submodule.icon}
                  </div>
                  <span className={`text-sm font-medium truncate text-white`}>
                    {submodule.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // FIXED: Pass isSelected function to renderProjectModule
  // ==========================================================================
  const renderProjectModule = (projectModule, context) => {
    const projectKey = projectModule.id || projectModule.projectId || projectModule.name;
    const uniqueId = `${context}-${projectKey}`;
    const isExpanded = expandedModules[uniqueId] || false;
    const hasFiles = projectModule.submodules?.length > 0;
    const isHovered = hoveredModule === uniqueId;

    return (
      <div key={uniqueId} className="group">
        <div className="flex items-center justify-between">
          <div
            onMouseEnter={() => setHoveredModule(uniqueId)}
            onMouseLeave={() => setHoveredModule(null)}
            onClick={(e) => {
              toggleModuleExpansion(uniqueId, e);
              if (context === 'project-dashboard') {
                handleModuleClick('project-dashboard');
                const pId = projectModule.id || projectModule.projectId || projectModule.name;
                window.dispatchEvent(new CustomEvent('openProjectDashboardMain', {
                  detail: { projectId: pId }
                }));
              }
            }}
            className={`flex-1 flex items-center space-x-2.5 px-3 py-2.5 transition-all duration-100 cursor-pointer ${isHovered
              ? 'bg-[var(--border-light)] text-[var(--text-main)]'
              : 'hover:bg-[var(--border-light)] text-[var(--text-main)]'
              }`}
          >
            <LayersIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-medium truncate text-white">
              {projectModule.name}
            </span>
          </div>
          {hasFiles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleModuleExpansion(uniqueId, e);
              }}
              className={`p-1.5 rounded-lg text-white ${isHovered ? 'hover:bg-white/15' : 'hover:bg-white/10'
                }`}
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {isExpanded && hasFiles && (
          <div className="ml-7 mt-1.5 space-y-1">
            {projectModule.submodules.map(fileModule => renderFileModule(fileModule, context, projectKey))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // FIXED: Use context-specific selection check with project key
  // ==========================================================================
  const renderFileModule = (fileModule, context, projectKey) => {
    const isSelected = isFileSelected(fileModule, context);
    const fileId = `${context}-${fileModule.id}-${projectKey}`;
    const isHovered = hoveredModule === fileId;

    return (
      <button
        key={fileId}
        onMouseEnter={() => setHoveredModule(fileId)}
        onMouseLeave={() => setHoveredModule(null)}
        onClick={() => {
          if (context === 'upload-trackers') {
            handleFileModuleClick(fileModule);
          } else if (context === 'project-dashboard') {
            if (fileModule.type === 'budget') {
              dispatch(setActiveModule(fileModule.id));
              navigate(`/dashboard/budget-summary/${fileModule.projectName}`);
            } else {
              handleProjectFileClick({
                ...fileModule,
                projectName: fileModule.projectName || projectKey
              });
            }
          }
        }}
        className={`w-full flex items-center space-x-2.5 px-3 py-2 transition-all duration-100 ${isSelected
          ? 'bg-[var(--border-light)] text-[var(--brand-primary)] border-l-2 border-[var(--brand-primary)]'
          : isHovered
            ? 'bg-[var(--border-light)] text-[var(--text-main)]'
            : 'hover:bg-[var(--border-light)] text-[var(--text-main)]'
          }`}
      >
        <span className={`text-sm truncate text-white ${isSelected ? 'font-medium' : ''
          }`}>
          {fileModule.displayName || (fileModule.name || '').replace(/\.(xlsx|xls|csv|json|txt)$/i, '')}
        </span>
      </button>
    );
  };

  const renderOtherModules = () => {
    return otherModules.filter(module => module.id !== 'upload-trackers').map((module, index) => {
      if (!hasPermission(module.name)) return null;
      
      const isActive = activeModule === module.id;
      const isHovered = hoveredModule === module.id;

      return (
        <button
          key={module.id}
          onMouseEnter={() => setHoveredModule(module.id)}
          onMouseLeave={() => setHoveredModule(null)}
          onClick={() => handleModuleClick(module.id)}
          className={`w-full flex items-center transition-all duration-100 ${isSidebarExpanded ? 'px-4 py-3.5 space-x-3.5' : 'justify-center px-2 py-3.5'
            } ${isActive
              ? 'bg-[#18181B] text-white'
              : isHovered
                ? 'bg-[var(--border-light)] text-[var(--text-main)]'
                : 'hover:bg-[var(--border-light)] text-[var(--text-main)]'
            }`}
        >
          <div className={`${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}>
            {module.icon}
          </div>
          {isSidebarExpanded && (
            <span className={`font-bold text-xs uppercase tracking-widest ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
              {module.name}
            </span>
          )}
        </button>
      );
    });
  };

  // Determine if sidebar should be expanded
  const isSidebarExpanded = !sidebarCollapsed;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 relative">
      {/* 
        ========================================
        PREMIUM UNIFIED BACKGROUND
        ========================================
      */}
      {/* Optimized Production Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[var(--bg-app)]">
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── New Sidebar Component ── */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          activeModule={activeModule}
          expandedModules={expandedModules}
          projectDashboardModules={projectDashboardModules}
          uploadTrackerModules={uploadTrackerModules}
          selectedProjectFileId={selectedProjectFileId}
          selectedUploadFileId={selectedUploadFileId}
          companyLogo={companyLogo}
          companyName={companyName}
          user={user}
          handleModuleClick={handleModuleClick}
          toggleModuleExpansion={toggleModuleExpansion}
          handleFileModuleClick={handleFileModuleClick}
          handleProjectFileClick={handleProjectFileClick}
          isFileSelected={isFileSelected}
          hasPermission={hasPermission}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
          {/* Header - Industrial Functional Header */}
          <header className="h-12 flex-shrink-0 bg-white border-b border-[var(--border-main)] flex items-center px-4 justify-between sticky top-0 z-50">
            {/* Left side - Breadcrumbs & Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
                className="p-1 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-main)] transition-colors border border-transparent hover:border-[var(--border-main)]"
                title={sidebarCollapsed ? "Open Sidebar" : "Close Sidebar"}
              >
                {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              
              <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest">
                <span className="text-[var(--text-subtle)]">System</span>
                <ChevronRight className="h-3 w-3 text-[var(--text-meta)]" />
                <span className="text-[var(--text-main)]">{getHeaderTitle()}</span>
              </div>
            </div>

            {/* Center - Empty/Placeholder */}
            <div className="flex-1 px-8"></div>

            {/* Right side - Actions & Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-[var(--text-muted)] hover:bg-[var(--border-light)] rounded-lg relative transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>

              <div className="w-[1px] h-6 bg-[var(--border-light)] mx-1"></div>

              {/* User Identity */}
              <div className="flex items-center space-x-3 pl-2" ref={profileMenuRef}>
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-[var(--text-main)] leading-tight uppercase tracking-tighter">{user?.full_name?.split(' ')[0] || 'User'}</p>
                  <p className="text-[9px] font-bold text-[var(--text-subtle)] uppercase tracking-widest">{user?.role || 'Admin'}</p>
                </div>
                
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-8 h-8 bg-[var(--border-light)] border border-[var(--border-main)] flex items-center justify-center text-[var(--brand-primary)] font-bold text-xs hover:bg-[var(--border-main)] transition-all"
                >
                  {getUserInitial()}
                </button>

                {profileMenuOpen && (
                  <div
                    className="fixed z-[9999] w-64 bg-white rounded-xl shadow-lg border border-[var(--border-main)] py-1 mt-2"
                    style={{
                      position: 'fixed',
                      top: `${profileMenuPosition.top}px`,
                      right: `${profileMenuPosition.right}px`
                    }}
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-light)]">
                      <p className="text-sm font-bold text-[var(--text-main)]">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-[var(--text-subtle)] truncate">{user?.email || 'user@example.com'}</p>
                    </div>

                    <div className="py-1">
                      <button className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)] flex items-center space-x-3 transition-colors">
                        <UserIcon className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard/settings')}
                        className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)] flex items-center space-x-3 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Platform Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-[var(--border-light)] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-auto p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
