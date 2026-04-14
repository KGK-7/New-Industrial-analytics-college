import React, { useState, useEffect, useMemo } from 'react';
import { Snowflake } from 'lucide-react';
import { 
  PlusIcon as Plus, 
  MagnifyingGlassIcon as Search, 
  PencilSquareIcon as Edit, 
  TrashIcon as Trash2, 
  XMarkIcon as X, 
  CheckIcon as Check, 
  ChevronUpIcon as ChevronUp, 
  ChevronDownIcon as ChevronDown, 
  ArrowDownTrayIcon as Download, 
  EyeIcon as Eye, 
  EyeSlashIcon as EyeOff, 
  CheckCircleIcon as CheckSquare, 
  QueueListIcon as Square, 
  SparklesIcon as Zap,
  ChevronLeftIcon as ChevronLeft, 
  ChevronRightIcon as ChevronRight, 
  ArrowPathIcon as RefreshCw, 
  DocumentDuplicateIcon as Copy, 
  ArrowUpIcon as ArrowUp, 
  ArrowDownIcon as ArrowDown, 
  FunnelIcon as Filter, 
  EllipsisHorizontalIcon as MoreHorizontal, 
  InformationCircleIcon as Info, 
  DocumentTextIcon as FileText 
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import useCurrency from '../hooks/useCurrency';

const ExcelTableViewer = ({ columns: initialColumns, data, fileName, onRefresh, loading, onDataUpdate, onProcessData }) => {
    // Convert string array of columns to object array for consistent handling
    const [columns, setColumns] = useState(() => {
        return (initialColumns || []).map((col, idx) => ({
            id: col,
            label: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' '),
            visible: true,
            sortable: true,
            type: 'text',
            deletable: true,
            required: false // Local edit doesn't enforce
        }));
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Sync columns when initialColumns prop changes
    useEffect(() => {
        if (initialColumns && initialColumns.length > 0) {
            setColumns(initialColumns.map((col, idx) => ({
                id: col,
                label: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' '),
                visible: true,
                sortable: true,
                type: 'text',
                deletable: true,
                required: false
            })));
            setHasChanges(false);
        }
    }, [initialColumns]);

    // Local data state to allow Add/Edit/Delete actions purely on the client side
    const [localData, setLocalData] = useState([]);

    // Auto-generate stable IDs for localData to allow checkbox selection and editing if they don't exist
    useEffect(() => {
        const enrichedData = (data || []).map((row, idx) => ({
            _local_id: `row_${Date.now()}_${idx}`,
            ...row
        }));
        setLocalData(enrichedData);
        setCurrentPage(1);
        setSelectedRows([]);
        setSelectAll(false);
        setHasChanges(false);
    }, [data]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const pageSizeOptions = [10, 25, 50, 100];
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Modals / Dropdowns / Prompts
    const [activeDropdownColumn, setActiveDropdownColumn] = useState(null);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filterDraft, setFilterDraft] = useState({});

    // Checkbox selection state
    const { format, symbol } = useCurrency();
    
    const isCurrencyField = (id, label) => {
        const searchStr = (String(id) + String(label)).toLowerCase();
        return ['budget', 'cost', 'estimation', 'approved', 'utilized', 'balance', 'outlook', 'likely', 'value', 'price', 'amount', 'expenditure', 'capex'].some(key => searchStr.includes(key));
    };
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Editing / Adding / Deleting Row State
    const [showAddRowModal, setShowAddRowModal] = useState(false);
    const [newRow, setNewRow] = useState({});

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [showDeletePrompt, setShowDeletePrompt] = useState(null);
    const [showBulkDeletePrompt, setShowBulkDeletePrompt] = useState(false);
    const [showBulkEditPrompt, setShowBulkEditPrompt] = useState(false);

    // Column Management State
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [editingColumn, setEditingColumn] = useState(null);
    const [tempColumnName, setTempColumnName] = useState('');
    const [showDeleteColumnPrompt, setShowDeleteColumnPrompt] = useState(null);
    const [showColumnAddPrompt, setShowColumnAddPrompt] = useState(false);

    // Export Confirmation
    const [showExportConfirmPrompt, setShowExportConfirmPrompt] = useState(null);

    // Freeze states
    const [frozenRows, setFrozenRows] = useState([]);
    const [frozenColumns, setFrozenColumns] = useState([]);
    const [showFreezeColumnModal, setShowFreezeColumnModal] = useState(false);
    const [showFreezeRowModal, setShowFreezeRowModal] = useState(false);
    const [tempFrozenRows, setTempFrozenRows] = useState([]);
    const [tempFrozenColumns, setTempFrozenColumns] = useState([]);

    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Column Pagination Derived Values
    const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);
    const totalVisibleCols = visibleColumns.length;

    // Dynamic colsPerPage based on header length (logic from image)
    const colsPerPage = useMemo(() => {
        const hasLongHeader = visibleColumns.some(col => col.label.length > 8);
        return hasLongHeader ? 4 : 7;
    }, [visibleColumns]);

    // Column Pagination State
    const [columnPage, setColumnPage] = useState(1);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdownColumn(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Helper to sync data back to parent
    const triggerDataUpdate = (currentData, currentColumns) => {
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        if (onDataUpdate) {
            const dataToSync = localData.map(row => {
                const { _local_id, ...rest } = row;
                return rest;
            });
            const columnsToSync = columns.map(col => col.id);
            onDataUpdate(dataToSync, columnsToSync);
            setHasChanges(false);
            showNotification('Changes saved successfully!');
        }
    };

    // Filter data
    const filteredData = useMemo(() => {
        return localData.filter(row => {
            return Object.values(row).some(value =>
                String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [localData, searchTerm]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key] !== undefined && a[sortConfig.key] !== null ? String(a[sortConfig.key]) : '';
            const bVal = b[sortConfig.key] !== undefined && b[sortConfig.key] !== null ? String(b[sortConfig.key]) : '';

            const numA = Number(aVal);
            const numB = Number(bVal);
            if (!isNaN(numA) && !isNaN(numB)) {
                return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
            }

            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Pagination
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, pageSize]);


    const colStartIndex = useMemo(() => (columnPage - 1) * colsPerPage, [columnPage, colsPerPage]);
    const colEndIndex = useMemo(() => Math.min(colStartIndex + colsPerPage, totalVisibleCols), [colStartIndex, colsPerPage, totalVisibleCols]);

    const paginatedColumns = useMemo(() => {
        return visibleColumns.slice(colStartIndex, colEndIndex);
    }, [visibleColumns, colStartIndex, colEndIndex]);

    // Sync columnPage when visible columns change or filter is applied
    useEffect(() => {
        const maxPages = Math.ceil(totalVisibleCols / colsPerPage) || 1;
        if (columnPage > maxPages) {
            setColumnPage(maxPages);
        }
    }, [totalVisibleCols, colsPerPage, columnPage]);

    // Format handlers
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleSortFromMenu = (key, direction) => {
        setSortConfig({ key, direction });
        setCurrentPage(1);
        setActiveDropdownColumn(null);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 opacity-30" />;
        return sortConfig.direction === 'ascending' ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />;
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setSelectedRows([]);
        setSelectAll(false);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
        setSelectedRows([]);
        setSelectAll(false);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            if (endPage - startPage < maxVisiblePages - 1) startPage = Math.max(1, endPage - maxVisiblePages + 1);
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        }
        return pageNumbers;
    };

    // Row Checkbox Handlers
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
            setSelectAll(false);
        } else {
            const allVisibleIds = paginatedData.map(row => row._local_id);
            setSelectedRows(allVisibleIds);
            setSelectAll(true);
        }
    };

    const toggleRowSelection = (rowId) => {
        setSelectedRows(prev => {
            if (prev.includes(rowId)) {
                setSelectAll(false);
                return prev.filter(id => id !== rowId);
            } else {
                const newSelection = [...prev, rowId];
                if (newSelection.length === paginatedData.length && paginatedData.length > 0) setSelectAll(true);
                return newSelection;
            }
        });
    };

    // Bulk Delete
    const handleBulkDelete = () => {
        if (selectedRows.length === 0) {
            showNotification('Please select at least one row to delete', 'error');
            return;
        }
        setShowBulkDeletePrompt({ show: true, count: selectedRows.length });
    };

    const confirmBulkDelete = () => {
        const newData = localData.filter(r => !selectedRows.includes(r._local_id));
        setLocalData(newData);
        setSelectedRows([]);
        setSelectAll(false);
        setShowBulkDeletePrompt({ show: false, count: 0 });
        showNotification(`${selectedRows.length} row(s) deleted locally`);
        triggerDataUpdate(newData, columns);
    };

    // Bulk Edit (Only 1 allowed at a time)
    const handleBulkEdit = () => {
        if (selectedRows.length === 0) {
            showNotification('Please select at least one row to edit', 'error');
            return;
        }
        if (selectedRows.length > 1) {
            showNotification('Only one row can be edited at a time', 'error');
            return;
        }
        setShowBulkEditPrompt({ show: true, count: selectedRows.length });
    };

    const confirmBulkEdit = () => {
        if (selectedRows.length === 1) {
            const row = localData.find(r => r._local_id === selectedRows[0]);
            if (row) startEditing(row);
        }
        setShowBulkEditPrompt({ show: false, count: 0 });
    };

    // Single Row CRUD
    const handleAddRowClick = () => {
        setShowAddRowModal(true);
        const emptyRow = { _local_id: `row_${Date.now()}` };
        columns.forEach(c => emptyRow[c.id] = '');
        setNewRow(emptyRow);
    };

    const saveNewRow = () => {
        const newData = [newRow, ...localData];
        setLocalData(newData);
        setShowAddRowModal(false);
        setNewRow({});
        showNotification('Row added locally');
        triggerDataUpdate(newData, columns);
    };

    const startEditing = (row) => {
        setEditForm({ ...row });
        setEditingId(row._local_id);
    };

    const saveEdit = () => {
        const newData = localData.map(r => r._local_id === editingId ? editForm : r);
        setLocalData(newData);
        setEditingId(null);
        setEditForm({});
        setSelectedRows([]);
        setSelectAll(false);
        showNotification('Row updated locally');
        triggerDataUpdate(newData, columns);
    };

    const confirmDeleteRow = () => {
        if (showDeletePrompt) {
            const newData = localData.filter(r => r._local_id !== showDeletePrompt.id);
            setLocalData(newData);
            setShowDeletePrompt(null);
            showNotification('Row deleted locally');
            triggerDataUpdate(newData, columns);
        }
    };

    // Column Management
    const toggleColumnVisibility = (columnId) => {
        setColumns(columns.map(col => col.id === columnId ? { ...col, visible: !col.visible } : col));
    };

    const startEditColumn = (columnId, currentLabel) => {
        setEditingColumn(columnId);
        setTempColumnName(currentLabel);
    };

    const saveEditColumn = (columnId) => {
        if (tempColumnName.trim()) {
            const newColumns = columns.map(col => col.id === columnId ? { ...col, label: tempColumnName } : col);
            setColumns(newColumns);
            setEditingColumn(null);
            setTempColumnName('');
            showNotification('Column updated successfully');
            triggerDataUpdate(localData, newColumns);
        }
    };

    const handleDeleteColumn = (columnId) => {
        const column = columns.find(col => col.id === columnId);
        setShowDeleteColumnPrompt({
            id: columnId,
            title: 'Delete Column',
            columnLabel: column.label,
            type: 'delete'
        });
    };

    const confirmDeleteColumn = () => {
        if (!showDeleteColumnPrompt) return;
        const newColumns = columns.filter(col => col.id !== showDeleteColumnPrompt.id);
        setColumns(newColumns);
        setShowDeleteColumnPrompt(null);
        setShowColumnModal(false);
        showNotification('Column hidden/deleted locally');
        triggerDataUpdate(localData, newColumns);
    };

    const confirmAddColumn = () => {
        if (newColumnName.trim()) {
            const newColumnId = newColumnName.toLowerCase().replace(/\s+/g, '_');
            if (columns.find(col => col.id === newColumnId)) {
                showNotification('Column with this name already exists', 'error');
                return;
            }
            const newColumn = {
                id: newColumnId,
                label: newColumnName,
                visible: true,
                sortable: true,
                type: 'text',
                deletable: true
            };
            const newColumns = [...columns, newColumn];
            setColumns(newColumns);
            // Backfill empty string into all rows for the new column
            const newData = localData.map(row => ({ ...row, [newColumnId]: '' }));
            setLocalData(newData);

            setNewColumnName('');
            setShowColumnAddPrompt({ show: false, columnName: '' });
            setShowColumnModal(false);
            showNotification('Column added locally');
            triggerDataUpdate(newData, newColumns);
        }
    };

    const handleCopyColumnName = (label) => {
        navigator.clipboard.writeText(label);
        showNotification('Column name copied');
        setActiveDropdownColumn(null);
    };

    // Freezing Logic
    const toggleFreezeRow = () => {
        const selectedRowIndices = paginatedData
            .map((row, index) => {
                const actualRowIndex = (currentPage - 1) * pageSize + index;
                return selectedRows.includes(row._local_id) ? actualRowIndex : null;
            })
            .filter(index => index !== null);
        setTempFrozenRows([...new Set([...frozenRows, ...selectedRowIndices])].sort((a, b) => a - b));
        setShowFreezeRowModal(true);
    };

    const toggleFreezeColumn = () => {
        setTempFrozenColumns([...frozenColumns]);
        setShowFreezeColumnModal(true);
    };

    const handleFreezeRows = () => {
        setFrozenRows(tempFrozenRows);
        setShowFreezeRowModal(false);
        if (tempFrozenRows.length > 0) showNotification(`${tempFrozenRows.length} row(s) frozen`);
        else showNotification('All rows unfrozen');
    };

    const handleFreezeColumns = () => {
        setFrozenColumns(tempFrozenColumns);
        setShowFreezeColumnModal(false);
        if (tempFrozenColumns.length > 0) showNotification(`${tempFrozenColumns.length} column(s) frozen`);
        else showNotification('All columns unfrozen');
    };

    const handleFreezeColumnMenu = (colIndex) => {
        let newFrozen = [...frozenColumns];
        if (newFrozen.includes(colIndex)) {
            newFrozen = newFrozen.filter(idx => idx !== colIndex);
            showNotification('Column unfrozen');
        } else {
            newFrozen = [...new Set([...newFrozen, colIndex])].sort((a, b) => a - b);
            showNotification('Column frozen');
        }
        setFrozenColumns(newFrozen);
        setTempFrozenColumns(newFrozen);
        setActiveDropdownColumn(null);
    };

    const isRowFrozen = (rowIndex) => frozenRows.includes(rowIndex);
    const isColumnFrozen = (colIndex) => frozenColumns.includes(colIndex);

    const getFrozenColumnLeft = (colIndex) => {
        if (!isColumnFrozen(colIndex)) return 'auto';
        const checkboxWidth = 40;
        const colWidth = 150; // Approximated fixed width for generic cells when frozen

        const sortedFrozenColumns = [...frozenColumns].sort((a, b) => a - b);
        const positionIndex = sortedFrozenColumns.indexOf(colIndex);
        if (positionIndex === -1) return 'auto';

        let leftOffset = checkboxWidth;
        for (let i = 0; i < positionIndex; i++) {
            leftOffset += colWidth;
        }
        return `${leftOffset}px`;
    };

    const getFrozenRowTop = (rowIndex) => {
        if (!isRowFrozen(rowIndex)) return 'auto';
        const headerHeight = 42;
        const rowHeight = 45;
        const sortedFrozenRows = [...frozenRows].sort((a, b) => a - b);
        const positionIndex = sortedFrozenRows.indexOf(rowIndex);
        if (positionIndex === -1) return 'auto';

        let topOffset = headerHeight;
        for (let i = 0; i < positionIndex; i++) {
            topOffset += rowHeight;
        }
        return `${topOffset}px`;
    };

    // Exports
    const handleExportClick = (format) => {
        if (sortedData.length === 0) {
            showNotification('No data to export', 'error');
            return;
        }
        setShowExportConfirmPrompt({ show: true, format: format, count: sortedData.length });
    };

    const handleExport = (formatType) => {
        const exportData = sortedData.map(row => {
            const dataRow = { ...row };
            delete dataRow._local_id;
            
            // Map keys to labels for better readability and format currency fields
            const labeledRow = {};
            columns.forEach(col => {
                let val = dataRow[col.id] || '';
                if (isCurrencyField(col.id, col.label)) {
                    val = format(parseFloat(val) || 0);
                }
                labeledRow[col.label] = val;
            });
            return labeledRow;
        });

        if (formatType === 'excel') {
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, `${fileName || 'export'}.xlsx`);
        } else if (formatType === 'csv') {
            const ws = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName || 'export'}.csv`;
            a.click();
        } else if (formatType === 'json') {
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName || 'export'}.json`;
            a.click();
        }
        showNotification(`Export to ${format.toUpperCase()} completed successfully`);
        setShowExportConfirmPrompt(null);
        setShowExportDropdown(false);
    };


    return (
        <div className="flex flex-col bg-white border border-[var(--border-main)] w-full h-[600px] overflow-hidden">
            {/* Notification Banner */}
            {notification.show && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 z-50 border ${notification.type === 'success' ? 'bg-zinc-900 text-white border-black' :
                    notification.type === 'error' ? 'bg-red-900 text-white border-red-950' :
                        'bg-zinc-100 text-zinc-900 border-zinc-300'
                    }`}>
                    <div className="flex items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest">{notification.message}</span>
                        <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-4 text-white opacity-50 hover:opacity-100">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Render Toolbar */}
            <div className="px-6 py-5 border-b border-[var(--border-main)] bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* LEFT SIDE -> Search & Filter Columns */}
                    <div className="flex flex-1 flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" />
                            <input
                                type="text"
                                placeholder="SEARCH ROWS..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full h-10 pl-10 pr-4 bg-[var(--bg-app)] border border-[var(--border-main)] text-xs font-bold focus:ring-1 focus:ring-black transition-all placeholder:text-[var(--text-meta)] uppercase tracking-widest"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    if (!showFilterDropdown) {
                                        const draft = {};
                                        columns.forEach(col => { draft[col.id] = col.visible; });
                                        setFilterDraft(draft);
                                    }
                                    setShowFilterDropdown(!showFilterDropdown);
                                }}
                                className="flex items-center gap-2 h-10 px-4 bg-white border border-black text-[11px] font-black uppercase tracking-widest text-black hover:bg-zinc-100 transition-all"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </button>

                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                                    <div className="absolute left-0 mt-1 w-56 bg-white border border-black shadow-none z-50 p-3">
                                        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Visible Columns</h4>
                                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                            {columns.map(col => (
                                                <label key={col.id} className="flex items-center space-x-3 cursor-pointer hover:bg-zinc-100 p-1.5 transition-colors group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filterDraft[col.id] !== false}
                                                        onChange={(e) => setFilterDraft({ ...filterDraft, [col.id]: e.target.checked })}
                                                        className="h-4 w-4 text-black border-zinc-400 rounded-none focus:ring-0"
                                                    />
                                                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">{col.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-zinc-200 flex justify-end gap-2">
                                            <button onClick={() => setShowFilterDropdown(false)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-100">Cancel</button>
                                            <button onClick={() => {
                                                setColumns(columns.map(col => ({ ...col, visible: filterDraft[col.id] !== false })));
                                                setShowFilterDropdown(false);
                                            }} className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-zinc-800">Apply</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE -> Actions & Exporters */}
                    <div className="flex gap-2 mt-2 sm:mt-0 items-center">
                        {selectedRows.length > 0 && (
                            <div className="flex items-center gap-1 mr-2 border-r pr-2 border-slate-300 dark:border-slate-600">
                                {onProcessData && (
                                    <button
                                        onClick={() => {
                                            const indices = selectedRows.map(id => localData.findIndex(r => r._local_id === id)).filter(idx => idx !== -1);
                                            onProcessData(indices);
                                        }}
                                        disabled={loading}
                                        className="flex items-center gap-1 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
                                    >
                                        <Zap className="h-4 w-4" />
                                        <span className="hidden lg:inline">Optimize ({selectedRows.length})</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleBulkEdit}
                                    className="flex items-center gap-1 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="hidden lg:inline">Edit ({selectedRows.length})</span>
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden lg:inline">Delete ({selectedRows.length})</span>
                                </button>
                            </div>
                        )}

                        <button onClick={handleAddRowClick} className="flex items-center gap-1 h-9 px-3 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-zinc-800 transition" title="Add Row">
                            <Plus className="h-4 w-4" />
                            <span className="hidden xl:inline">Add Row</span>
                        </button>

                        <button onClick={() => setShowColumnModal(true)} className="flex items-center gap-1 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition" title="Add Column">
                            <Plus className="h-4 w-4" />
                            <span className="hidden xl:inline">Add Column</span>
                        </button>

                        <div className="relative">
                            <button onClick={() => setShowExportDropdown(!showExportDropdown)} className="flex items-center gap-1.5 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition">
                                <Download className="h-4 w-4" />
                                <span className="hidden lg:inline">Export</span>
                            </button>
                            {showExportDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
                                    <div className="absolute right-0 mt-1 w-40 bg-white border border-black z-50 overflow-hidden">
                                        <button onClick={() => handleExportClick('excel')} className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 text-zinc-900">Excel (.xlsx)</button>
                                        <button onClick={() => handleExportClick('csv')} className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 text-zinc-900">CSV (.csv)</button>
                                        <button onClick={() => handleExportClick('json')} className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 text-zinc-900">JSON (.json)</button>
                                    </div>
                                </>
                            )}
                        </div>

                        {hasChanges ? (
                            <button
                                onClick={handleSaveChanges}
                                className="flex items-center gap-1.5 h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-[#166534] text-white border border-[#14532d] hover:bg-[#14532d] transition"
                                title="Save changes to database"
                            >
                                <Check className="h-4 w-4" />
                                <span>Save Data</span>
                            </button>
                        ) : (
                            onProcessData && selectedRows.length === 0 && (
                                <button
                                    onClick={() => onProcessData()}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition disabled:opacity-50"
                                    title="Process & Optimize Data (Type Inference)"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Optimize</span>
                                </button>
                            )
                        )}

                        {onRefresh && (
                            <button onClick={onRefresh} disabled={loading} className="flex items-center gap-1.5 h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition disabled:opacity-50">
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Render Data Table */}
            <div className="flex-1 overflow-auto relative border-t border-zinc-300">
                <table className="w-full border-collapse text-left font-mono">
                    <thead className="bg-[#F4F4F5] text-zinc-500 sticky top-0 z-[40]">
                        <tr className="border-b border-black">
                            {/* Checkbox Header */}
                            <th
                                className={`py-3 px-4 w-12 text-center border-b border-black ${isColumnFrozen(0) ? 'frozen-column pt-0 bg-white z-[45]' : ''}`}
                                style={{ left: isColumnFrozen(0) ? '0' : 'auto' }}
                            >
                                <button
                                    onClick={toggleSelectAll}
                                    className="focus:outline-none"
                                >
                                    {selectAll ? (
                                        <div className="h-4 w-4 bg-black text-white flex items-center justify-center border border-black">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    ) : (
                                        <div className="h-4 w-4 bg-white border border-zinc-300" />
                                    )}
                                </button>
                            </th>

                            {/* Dynamic Headers */}
                            {paginatedColumns.map((col, colIdx) => (
                                <th
                                    key={col.id}
                                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-black group ${isColumnFrozen(colIdx + 1) ? 'frozen-column bg-zinc-100 z-[45]' : ''}`}
                                    style={{
                                        minWidth: '150px',
                                        left: isColumnFrozen(colIdx + 1) ? getFrozenColumnLeft(colIdx + 1) : 'auto'
                                    }}
                                >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 flex-1" onClick={() => col.sortable && handleSort(col.id)}>
                                                <span className="truncate">{col.label}</span>
                                            </div>

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdownColumn(activeDropdownColumn === col.id ? null : col.id); }}
                                                    className={`p-1 transition-colors text-zinc-500 hover:text-zinc-900 ${activeDropdownColumn === col.id ? 'bg-zinc-200 text-zinc-900' : ''}`}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                {activeDropdownColumn === col.id && (
                                                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-black z-[60] py-1 normal-case tracking-normal font-normal">
                                                        {col.sortable && (
                                                            <>
                                                                <button onClick={() => handleSortFromMenu(col.id, 'ascending')} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 flex items-center gap-2 text-zinc-700"><ArrowUp className="h-3.5 w-3.5" /> Sort Ascending</button>
                                                                <button onClick={() => handleSortFromMenu(col.id, 'descending')} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 flex items-center gap-2 text-zinc-700"><ArrowDown className="h-3.5 w-3.5" /> Sort Descending</button>
                                                                <div className="h-px bg-zinc-200 my-1"></div>
                                                            </>
                                                        )}
                                                        <button onClick={() => handleCopyColumnName(col.label)} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 flex items-center gap-2 text-zinc-700"><Copy className="h-3.5 w-3.5" /> Copy name</button>
                                                        <button onClick={() => { startEditColumn(col.id, col.label); setShowColumnModal(true); setActiveDropdownColumn(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 flex items-center gap-2 text-zinc-700"><Edit className="h-3.5 w-3.5" /> Edit column</button>
                                                        <button onClick={() => handleFreezeColumnMenu(colIdx + 1)} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 flex items-center gap-2 text-zinc-700">
                                                            <Snowflake className={`h-3.5 w-3.5 ${isColumnFrozen(colIdx + 1) ? 'text-blue-600' : 'text-zinc-400'}`} />
                                                            <span className={isColumnFrozen(colIdx + 1) ? 'text-blue-600' : ''}>{isColumnFrozen(colIdx + 1) ? 'Unfreeze' : 'Freeze'} column</span>
                                                        </button>
                                                        <button onClick={() => { toggleFreezeRow(); setActiveDropdownColumn(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 flex items-center gap-2 text-zinc-700">
                                                            <Snowflake className={`h-3.5 w-3.5 ${frozenRows.length > 0 ? 'text-blue-600' : 'text-zinc-400'}`} />
                                                            <span className={frozenRows.length > 0 ? 'text-blue-600' : ''}>{frozenRows.length > 0 ? 'Unfreeze' : 'Freeze'} row(s)</span>
                                                        </button>
                                                        <div className="h-px bg-zinc-200 my-1"></div>
                                                        <button onClick={() => { handleDeleteColumn(col.id); setActiveDropdownColumn(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete column</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </th>
                            ))}
                            {/* Empty TH for Actions Right Side */}
                            <th className="w-24"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-200">
                        {paginatedData.map((row, rowIndex) => {
                            const actualRowIndex = (currentPage - 1) * pageSize + rowIndex;
                            const isRowCurrentlyFrozen = isRowFrozen(actualRowIndex);
                            const isSelected = selectedRows.includes(row._local_id);

                             const formatCellValue = (value, colId, colLabel) => {
                                if (value === undefined || value === null || String(value) === "") return '-';
                                
                                // Check if it's a currency field
                                if (isCurrencyField(colId, colLabel)) {
                                    const num = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
                                    if (!isNaN(num)) {
                                        return format(num);
                                    }
                                }

                                let strVal = String(value);
                                if (strVal !== '-' && (String(colId).toLowerCase().includes('file') || String(colLabel).toLowerCase().includes('file'))) {
                                    strVal = strVal.replace(/\.(xlsx|xls|csv|pdf|docx|txt|json)$/i, "");
                                }
                                return strVal;
                            };

                            return (
                                <tr
                                    key={row._local_id}
                                    className={`transition-colors duration-100 border-b border-zinc-100 ${isSelected ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
                                        } ${isRowCurrentlyFrozen ? 'frozen-row z-[30]' : ''}`}
                                    style={{
                                        top: isRowCurrentlyFrozen ? getFrozenRowTop(actualRowIndex) : 'auto'
                                    }}
                                >
                                    <td
                                        className={`py-2 px-4 text-center ${isColumnFrozen(0) ? 'frozen-column bg-inherit z-[35]' : ''}`}
                                        style={{ left: isColumnFrozen(0) ? '0' : 'auto' }}
                                    >
                                        <button
                                            onClick={() => toggleRowSelection(row._local_id)}
                                            className="focus:outline-none"
                                        >
                                            {isSelected ? (
                                                <div className="h-4 w-4 bg-white text-black flex items-center justify-center border border-black">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            ) : (
                                                <div className="h-4 w-4 bg-white border border-zinc-300" />
                                            )}
                                        </button>
                                    </td>

                                    {/* Normal Data Cells */}
                                    {paginatedColumns.map((col) => {
                                        const actualColumnIndex = columns.findIndex(c => c.id === col.id);
                                        const isColFrozen = isColumnFrozen(actualColumnIndex);
                                        return (
                                            <td
                                                key={col.id}
                                                className={`py-2 px-4 text-xs whitespace-nowrap overflow-hidden text-ellipsis min-w-[150px] ${isColFrozen ? 'frozen-column bg-inherit' : ''}`}
                                                style={{
                                                    left: isColFrozen ? getFrozenColumnLeft(actualColumnIndex) : 'auto',
                                                    zIndex: isColFrozen ? (isRowCurrentlyFrozen ? 35 : 20) : 'auto'
                                                }}
                                            >
                                                {formatCellValue(row[col.id], col.id, col.label)}
                                            </td>
                                        );
                                    })}

                                    {/* Row Actions Cell */}
                                    <td className="py-2 px-4 text-right whitespace-nowrap w-[100px]">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); startEditing(row); }} className="p-1 text-zinc-400 hover:text-black" title="Edit"><Edit className="h-4 w-4" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); setShowDeletePrompt({ id: row._local_id }); }} className="p-1 text-zinc-400 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedData.length === 0 && (
                            <tr><td colSpan={paginatedColumns.length + 2} className="py-8 text-center text-xs text-zinc-500">{loading ? 'Loading...' : 'No local data available'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-[#F4F4F5] border-t border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={e => handlePageSizeChange(Number(e.target.value))}
                            className="bg-white border border-zinc-300 text-[10px] font-black px-2 py-1 outline-none focus:border-black"
                        >
                            {pageSizeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                        {totalItems === 0 ? 'NO RESULTS' : `SHOWING ${((currentPage - 1) * pageSize) + 1} - ${Math.min(currentPage * pageSize, totalItems)} OF ${totalItems}`}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-1 border border-zinc-300 bg-white text-zinc-600 disabled:opacity-30 hover:bg-zinc-100 transition"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageNumbers().map(num => (
                        <button
                            key={num}
                            onClick={() => handlePageChange(num)}
                            className={`min-w-[32px] h-8 text-[10px] font-black border transition-all ${currentPage === num
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                                }`}
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1 border border-zinc-300 bg-white text-zinc-600 disabled:opacity-30 hover:bg-zinc-100 transition"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* OVERLAY MODALS */}

            {/* Add Row Modal */}
            {showAddRowModal && (
                <div className="fixed inset-0 bg-black/50 flex text-left items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase tracking-widest text-sm">Add Manual Row</h3>
                            <button onClick={() => setShowAddRowModal(false)}><X className="h-5 w-5 text-zinc-400 hover:text-black" /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {columns.map(col => (
                                <div key={col.id}>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{col.label}</label>
                                    <input type="text" value={newRow[col.id] || ''} onChange={e => setNewRow({ ...newRow, [col.id]: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-300 outline-none focus:border-black" placeholder={`Enter ${col.label}`} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddRowModal(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-zinc-300">Cancel</button>
                            <button onClick={saveNewRow} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-black text-white">Add Row</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Row Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black/50 flex text-left items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase tracking-widest text-sm">Edit Row</h3>
                            <button onClick={() => setEditingId(null)}><X className="h-5 w-5 text-zinc-400 hover:text-black" /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {columns.map(col => (
                                <div key={col.id}>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{col.label}</label>
                                    <input type="text" value={editForm[col.id] || ''} onChange={e => setEditForm({ ...editForm, [col.id]: e.target.value })} className="w-full px-3 py-2 text-sm border border-zinc-300 outline-none focus:border-black" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-zinc-300">Cancel</button>
                            <button onClick={saveEdit} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-black text-white">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt Modals (Delete Row, Bulk Delete, Edit Columns, Export, etc...) */}

            {showDeletePrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-sm w-full border border-black">
                        <h3 className="mb-4 font-black uppercase tracking-widest text-sm">Confirm local delete?</h3>
                        <p className="text-xs text-zinc-600 mb-4">This action removes the row from the local browser view.</p>
                        <div className="flex justify-end gap-2 text-xs font-black uppercase tracking-widest">
                            <button onClick={() => setShowDeletePrompt(null)} className="px-3 py-1.5 border border-zinc-300">Cancel</button>
                            <button onClick={confirmDeleteRow} className="px-3 py-1.5 bg-red-600 text-white">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showBulkDeletePrompt.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-sm w-full border border-black">
                        <h3 className="mb-4 font-black uppercase tracking-widest text-sm">Delete {showBulkDeletePrompt.count} selected row(s)?</h3>
                        <div className="flex justify-end gap-2 text-xs font-black uppercase tracking-widest">
                            <button onClick={() => setShowBulkDeletePrompt({ show: false, count: 0 })} className="px-3 py-1.5 border border-zinc-300">Cancel</button>
                            <button onClick={confirmBulkDelete} className="px-3 py-1.5 bg-red-600 text-white">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showExportConfirmPrompt?.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-sm w-full border border-black">
                        <h3 className="mb-4 font-black uppercase tracking-widest text-sm">Confirm Export</h3>
                        <p className="text-xs text-zinc-600 mb-4">Export {showExportConfirmPrompt.count} row(s) to {showExportConfirmPrompt.format.toUpperCase()} format?</p>
                        <div className="flex justify-end gap-2 text-xs font-black uppercase tracking-widest">
                            <button onClick={() => setShowExportConfirmPrompt(null)} className="px-3 py-1.5 border border-zinc-300">Cancel</button>
                            <button onClick={() => handleExport(showExportConfirmPrompt.format)} className="px-3 py-1.5 bg-black text-white">Export</button>
                        </div>
                    </div>
                </div>
            )}

            {showFreezeColumnModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-md w-full border border-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase tracking-widest text-sm">Freeze Columns</h3>
                            <button onClick={() => setShowFreezeColumnModal(false)}><X className="h-5 w-5 text-zinc-400" /></button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {visibleColumns.map((col) => {
                                const actualIdx = columns.findIndex(c => c.id === col.id);
                                return (
                                    <div key={col.id} className="flex flex-row items-center border p-2 border-zinc-300">
                                        <input type="checkbox" checked={tempFrozenColumns.includes(actualIdx)} onChange={e => {
                                            if (e.target.checked) setTempFrozenColumns([...tempFrozenColumns, actualIdx].sort((a, b) => a - b));
                                            else setTempFrozenColumns(tempFrozenColumns.filter(i => i !== actualIdx));
                                        }} className="mr-3" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{col.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-2 text-xs font-black uppercase tracking-widest">
                            <button onClick={() => setShowFreezeColumnModal(false)} className="px-4 py-2 border border-zinc-300">Cancel</button>
                            <button onClick={handleFreezeColumns} className="px-4 py-2 bg-black text-white">Apply Freeze</button>
                        </div>
                    </div>
                </div>
            )}

            {showFreezeRowModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-md w-full border border-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase tracking-widest text-sm">Freeze Rows</h3>
                            <button onClick={() => setShowFreezeRowModal(false)}><X className="h-5 w-5 text-zinc-400" /></button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {paginatedData.map((row, index) => {
                                const actualIdx = (currentPage - 1) * pageSize + index;
                                return (
                                    <div key={row._local_id} className="flex flex-row items-center border p-2 border-zinc-300">
                                        <input type="checkbox" checked={tempFrozenRows.includes(actualIdx)} onChange={e => {
                                            if (e.target.checked) setTempFrozenRows([...tempFrozenRows, actualIdx].sort((a, b) => a - b));
                                            else setTempFrozenRows(tempFrozenRows.filter(i => i !== actualIdx));
                                        }} className="mr-3" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Row {actualIdx + 1}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-2 text-xs font-black uppercase tracking-widest">
                            <button onClick={() => setShowFreezeRowModal(false)} className="px-4 py-2 border border-zinc-300">Cancel</button>
                            <button onClick={handleFreezeRows} className="px-4 py-2 bg-black text-white">Apply Freeze</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expand / Manage Columns Modal */}
            {showColumnModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 max-w-md w-full border border-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase tracking-widest text-sm">Manage Columns</h3>
                            <button onClick={() => setShowColumnModal(false)}><X className="h-5 w-5 text-zinc-400" /></button>
                        </div>
                        <div className="mb-4 bg-zinc-50 p-3 border border-zinc-200">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Add New Column</h4>
                            <div className="flex gap-2 text-sm">
                                <input type="text" value={newColumnName} onChange={e => setNewColumnName(e.target.value)} placeholder="E.g. Department" className="flex-1 px-3 py-1.5 border border-zinc-300 outline-none focus:border-black" />
                                <button onClick={confirmAddColumn} className="bg-black text-white px-3 border border-black">Add</button>
                            </div>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Available Columns</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {columns.map(col => {
                                const isEditing = editingColumn === col.id;
                                return (
                                    <div key={col.id} className="flex items-center justify-between p-2 border border-zinc-200">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={tempColumnName} onChange={e => setTempColumnName(e.target.value)} className="px-2 py-1 text-sm border border-zinc-300" />
                                                <button onClick={() => saveEditColumn(col.id)}><Check className="h-4 w-4 text-green-600" /></button>
                                                <button onClick={() => setEditingColumn(null)}><X className="h-4 w-4 text-red-600" /></button>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold uppercase tracking-widest">{col.label}</span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleColumnVisibility(col.id)} className={`p-1 ${col.visible ? 'text-black' : 'text-zinc-400'}`}>{col.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                                            {!isEditing && <button onClick={() => startEditColumn(col.id, col.label)} className="p-1 text-black"><Edit className="h-4 w-4" /></button>}
                                            <button onClick={() => handleDeleteColumn(col.id)} className="p-1 text-red-600"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {showDeleteColumnPrompt && (
                <div className="fixed inset-0 bg-black/50 flex text-left items-center justify-center z-[110]">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-2xl">
                        <h3 className="font-medium mb-4">Delete column "{showDeleteColumnPrompt.columnLabel}"?</h3>
                        <div className="flex justify-end gap-2 text-sm">
                            <button onClick={() => setShowDeleteColumnPrompt(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                            <button onClick={confirmDeleteColumn} className="px-3 py-1.5 bg-red-600 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelTableViewer;
