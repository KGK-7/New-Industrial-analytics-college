import React, { useRef, useState } from 'react';
import useCurrency from '../hooks/useCurrency';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  XMarkIcon as X, 
  ArrowDownTrayIcon as Download, 
  ArrowUpIcon as ArrowUp, 
  ArrowDownIcon as ArrowDown, 
  ArrowsPointingOutIcon as Maximize2, 
  ArrowsPointingInIcon as Minimize2, 
  Cog6ToothIcon as Settings, 
  Bars3BottomLeftIcon as GripVertical 
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const PdfPreviewModal = ({ 
  show, 
  onClose, 
  activeProject, 
  milestones, 
  criticalIssues, 
  sopData, 
  summaryData, 
  visibleSections,
  availablePhases,
  getTrackerForPhase,
  budgetTableData,
  submoduleData,
  selectedBudgetProject,
  masterProjects,
  budgetCurrency,
  chartImages,
  isCapturing = false
}) => {
  const reportRef = useRef();
  const [isMaximized, setIsMaximized] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sectionOrder, setSectionOrder] = useState([
    'milestones', 'criticalIssues', 'budget', 'resource', 'quality', 'charts'
  ]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSectionOrder(items);
  };
  const { format, symbol } = useCurrency();

  if (!show && !isCapturing) return null;

  const isHiddenCapture = isCapturing && !show;

  const downloadPdf = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Convert 1mm → pixels at scale 2 (96dpi → 3.7795 px/mm * 2)
    const pxPerMm = (canvas.width / pdfWidth);
    const pageHeightPx = pdfHeight * pxPerMm;

    const totalHeightPx = canvas.height;
    let pageTop = 0;
    let pageIndex = 0;

    while (pageTop < totalHeightPx) {
      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      const sliceHeight = Math.min(pageHeightPx, totalHeightPx - pageTop);
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx; // always full page height (blank remainder)

      const ctx = pageCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, pageTop, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const imgData = pageCanvas.toDataURL('image/png');

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pageTop += pageHeightPx;
      pageIndex++;
    }

    pdf.save(`${activeProject?.name || 'Project'}_Dashboard_Report.pdf`);
  };


  const getStatusPill = (status) => {
    const colors = {
      'Open': { bg: '#18181B', text: '#FFFFFF', border: '#000000' },
      'Closed': { bg: '#FFFFFF', text: '#18181B', border: '#18181B' },
      'In Progress': { bg: '#F4F4F5', text: '#18181B', border: '#D4D4D8' },
      'On Track': { bg: '#FFFFFF', text: '#18181B', border: '#18181B' },
      'At Risk': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
      'Likely Delay': { bg: '#FFF7ED', text: '#C2410C', border: '#FB923C' },
    };
    const style = colors[status] || { bg: '#FFFFFF', text: '#18181B', border: '#E4E4E7' };
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '0',
        fontSize: '10px',
        fontWeight: '900',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        {status}
      </span>
    );
  };

  // Gather all visible phases/trackers that have data
  const visiblePhaseList = [
    { id: 'design', label: 'Design' },
    { id: 'partDevelopment', label: 'Part Development' },
    { id: 'build', label: 'Build' },
    { id: 'gateway', label: 'Gateway' },
    { id: 'validation', label: 'Validation' },
    { id: 'qualityIssues', label: 'Quality Issues' },
    // Include all submodules but filter out duplicates in the filter logic
    ...(activeProject?.submodules || []).map(sub => ({ id: sub.id, label: sub.displayName || sub.name, isDynamic: true }))
  ].filter((phase, index, self) => {
    // 1. Filter out exact ID duplicates
    const isDuplicate = self.findIndex(p => p.id === phase.id) !== index;
    if (isDuplicate) return false;

    // 2. If this is a dynamic submodule, filter it out if it is already covered by a default category mapping
    if (phase.isDynamic) {
        const defaultIds = ['design', 'partDevelopment', 'build', 'gateway', 'validation', 'qualityIssues'];
        const isAlreadyMapped = defaultIds.some(id => {
            const tracker = getTrackerForPhase(id);
            return tracker && tracker.id === phase.id;
        });
        if (isAlreadyMapped) return false;
    }

    // 3. Check visibility and availability
    return visibleSections[phase.id] && availablePhases[phase.id];
  });

  const budgetStatus = masterProjects?.find(p => p.name === selectedBudgetProject)?.status || activeProject?.status || 'Active';

  const renderHeader = (pageNumber, totalPages) => (
    <div style={{ marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '24px' }}>
      {/* Project Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#000', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {activeProject?.name || 'PROJECT_DASHBOARD'}
          </h1>
          <div style={{ fontSize: '10px', color: '#71717a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            INDUSTRIAL ANALYTICS PLATFORM // REPORT_ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '12px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             PAGE {pageNumber} / {totalPages}
           </div>
           <div style={{ fontSize: '10px', color: '#71717a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             TIMESTAMP: {new Date().toISOString().replace('T', ' ').substring(0, 19)}
           </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', border: '1px solid #000' }}>
        <div style={{ padding: '12px 16px', borderRight: '1px solid #000' }}>
          <div style={{ fontSize: '9px', fontWeight: '900', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Date Segment</div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#000' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
        </div>

        <div style={{ padding: '12px 16px', borderRight: '1px solid #000', backgroundColor: '#f4f4f5' }}>
          <div style={{ fontSize: '9px', fontWeight: '900', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Timeline Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '8px', height: '8px', backgroundColor: '#000' }}></div>
             <span style={{ fontSize: '12px', fontWeight: '900', color: '#000', textTransform: 'uppercase' }}>{sopData?.[0]?.daysToGo || '—'} DAYS TO SOP</span>
          </div>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '9px', fontWeight: '900', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Operational Health</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '12px', fontWeight: '900', color: '#000', textTransform: 'uppercase' }}>{sopData?.[0]?.status || 'NOMINAL'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const pagesDef = [
    sectionOrder.filter(key => ['milestones', 'criticalIssues', 'budget'].includes(key)),
    sectionOrder.filter(key => ['resource', 'quality', 'charts'].includes(key))
  ];

  return (
    <div style={{
      backgroundColor: isHiddenCapture ? 'transparent' : 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: isHiddenCapture ? -1000 : 3000,
      padding: isHiddenCapture ? '0' : '0',
      visibility: isHiddenCapture ? 'hidden' : 'visible',
      pointerEvents: isHiddenCapture ? 'none' : 'auto',
      overflow: isHiddenCapture ? 'hidden' : 'auto',
      height: isHiddenCapture ? '0' : '100%',
      width: isHiddenCapture ? '0' : '100%',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
        <div style={{
          backgroundColor: isHiddenCapture ? 'transparent' : '#ffffff',
          borderRadius: '0',
          width: isHiddenCapture ? 'auto' : '100vw',
          height: isHiddenCapture ? 'auto' : '100vh',
          maxHeight: isHiddenCapture ? 'none' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          transition: 'none',
          overflow: isHiddenCapture ? 'visible' : 'hidden'
        }}>
        {/* Modal Controls */}
        {!isHiddenCapture && (
          <div className="bg-black text-white px-6 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-white text-black">
                 <Maximize2 size={18} />
               </div>
               <h2 className="text-[11px] font-black uppercase tracking-[0.2em] m-0">Report Preview Engine</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={downloadPdf}
                className="flex items-center gap-2 h-10 px-6 bg-white text-black border border-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export to PDF</span>
              </button>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`flex items-center gap-2 h-10 px-6 border font-black uppercase text-[10px] tracking-widest transition-colors ${
                  showSidebar 
                    ? 'bg-zinc-800 border-zinc-700 text-white' 
                    : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Configure</span>
              </button>

              <div className="w-[1px] h-6 bg-zinc-800 mx-2"></div>

              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white hover:bg-red-900 hover:border-red-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* PDF Content Area */}
        <div style={{ 
          overflowY: isHiddenCapture ? 'visible' : 'auto', 
          flex: 1, 
          padding: isHiddenCapture ? '0' : '40px', 
          display: 'flex', 
          backgroundColor: isHiddenCapture ? 'transparent' : '#18181b',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Customization Sidebar */}
          {showSidebar && (
            <div className="no-print" style={{ 
              width: '300px', 
              flexShrink: 0, 
              backgroundColor: 'white', 
              borderRadius: '0', 
              border: '1px solid #000', 
              padding: '24px', 
              position: 'absolute',
              left: '40px',
              top: '40px',
              zIndex: 100,
              boxShadow: 'none' 
            }}>
              <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#000', margin: '0 0 12px 0' }}>Module Order Configuration</h3>
              <p style={{ fontSize: '10px', color: '#71717a', marginBottom: '24px', lineHeight: '1.6', fontWeight: '700', textTransform: 'uppercase' }}>
                Drag identifiers to restructure the document flow. Unchecked items in dashboard are omitted.
              </p>
              
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sidebar-sections">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      {sectionOrder.map((key, index) => {
                        const isCharts = key === 'charts';
                        const isVisible = isCharts ? visiblePhaseList.length > 0 : visibleSections?.[key];
                        
                        let label = '';
                        if (key === 'milestones') label = 'Project Milestones';
                        if (key === 'criticalIssues') label = 'Top Critical Issues';
                        if (key === 'budget') label = 'Budget Summary';
                        if (key === 'resource') label = 'Resources / Manpower';
                        if (key === 'quality') label = 'Quality Metrics';
                        if (key === 'charts') label = 'Analytical Trackers';

                        return (
                          <Draggable key={key} draggableId={key} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{ 
                                  ...provided.draggableProps.style,
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                  padding: '12px 16px', border: '1px solid #000', borderRadius: '0',
                                  backgroundColor: snapshot.isDragging ? '#000' : (isVisible ? '#fff' : '#f4f4f5'),
                                  color: snapshot.isDragging ? '#fff' : (isVisible ? '#000' : '#a1a1aa'),
                                  opacity: isVisible ? 1 : 0.4,
                                  zIndex: snapshot.isDragging ? 1000 : 1
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div {...provided.dragHandleProps} style={{ color: snapshot.isDragging ? '#fff' : '#a1a1aa', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                                    <GripVertical size={16} />
                                  </div>
                                  <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {label}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          <div id="pdf-report-container" ref={reportRef} style={{
            backgroundColor: isHiddenCapture ? 'transparent' : '#18181b',
            width: '100%',
            maxWidth: '210mm',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: isHiddenCapture ? '0' : '20px',
            transition: 'none'
          }}>
            {pagesDef.map((pageContent, pageIdx) => (
              <div key={pageIdx} className="pdf-page-container" style={{
                backgroundColor: 'white',
                minHeight: '297mm',
                padding: '20mm',
                boxShadow: 'none',
                fontFamily: 'IBM Plex Sans, sans-serif',
                position: 'relative',
                border: isHiddenCapture ? 'none' : '1px solid #000'
              }}>
                <div className="pdf-printable-area" style={{ height: '100%' }}>
                {renderHeader(pageIdx + 1, pagesDef.length)}

                {pageContent.map(key => {
                  if (key === 'milestones') return visibleSections?.milestones && milestones?.length > 0 ? (
                    <div key="milestones" style={{ marginBottom: '32px' }}>
                      <div style={{ borderLeft: '4px solid #000', padding: '0 0 0 12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Project Milestones Mapping</h3>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: 'IBM Plex Mono, monospace' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f4f4f5' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Category</th>
                            {['A', 'B', 'C', 'D', 'E', 'F'].map(cat => (
                              <th key={cat} style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{cat}</th>
                            ))}
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.map((m, idx) => (
                            <React.Fragment key={idx}>
                              <tr>
                                <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Planned</td>
                                {['a', 'b', 'c', 'd', 'e', 'f'].map(key => (
                                  <td key={key} style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', color: '#000' }}>{m.plan[key]}</td>
                                ))}
                                <td style={{ padding: '10px 12px', border: '1px solid #000' }}>
                                  {getStatusPill(m.plan.implementation)}
                                </td>
                              </tr>
                              <tr style={{ backgroundColor: '#fafafa' }}>
                                <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Actual</td>
                                {['a', 'b', 'c', 'd', 'e', 'f'].map(key => (
                                  <td key={key} style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', color: '#000', fontWeight: '700' }}>{m.actual[key]}</td>
                                ))}
                                <td style={{ padding: '10px 12px', border: '1px solid #000' }}>
                                  {getStatusPill(m.actual.implementation)}
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null;
                  if (key === 'criticalIssues') return visibleSections?.criticalIssues && criticalIssues?.length > 0 ? (
                    <div key="criticalIssues" style={{ marginBottom: '32px' }}>
                      <div style={{ borderLeft: '4px solid #000', padding: '0 0 0 12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Top Critical Issues Registry</h3>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: 'IBM Plex Mono, monospace' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f4f4f5' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>UID</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Issue Description</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Owner</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Dept</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Target</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criticalIssues.map((issue, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', fontWeight: '700' }}>{idx + 1}</td>
                              <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', color: '#000', fontWeight: '700' }}>{issue.issue}</td>
                              <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', color: '#000' }}>{issue.responsibility}</td>
                              <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', color: '#000' }}>{issue.function}</td>
                              <td style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', color: '#000' }}>{issue.targetDate}</td>
                              <td style={{ padding: '10px 12px', border: '1px solid #000' }}>{getStatusPill(issue.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null;
                  if (key === 'budget') return visibleSections?.budget ? (
                    <div key="budget" style={{ marginBottom: '32px' }}>
                      <div style={{ borderLeft: '4px solid #000', padding: '0 0 0 12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h3 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Financial Allocation Summary</h3>
                         <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>Status: {budgetStatus.toUpperCase()}</span>
                      </div>
                      {budgetTableData && budgetTableData.length > 1 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: 'IBM Plex Mono, monospace' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f4f4f5' }}>
                              {budgetTableData[0].map((h, i) => (
                                <th key={i} style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#71717a' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {budgetTableData.slice(1).map((row, idx) => {
                              const isTotal = row[0] && row[0].toString().startsWith('Total');
                              const isCategory = row[0] && (row[0] === 'CAPEX' || row[0] === 'Revenue');
                              const fw = isTotal || isCategory ? '900' : '400';
                              const bgColor = isTotal ? '#f4f4f5' : 'transparent';
                              return (
                                <tr key={idx} style={{ backgroundColor: bgColor }}>
                                  {row.map((cell, colIdx) => (
                                    <td key={colIdx} style={{ padding: '10px 12px', border: '1px solid #000', fontSize: '10px', fontWeight: fw, color: '#000' }}>
                                      {budgetCurrency && colIdx > 1 && cell !== '' && cell !== null && !isNaN(Number(cell)) ? `${budgetCurrency}${Number(cell).toLocaleString()}` : cell}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', border: '1px solid #000', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Missing or Null</div>
                      )}
                    </div>
                  ) : null;
                  if (key === 'resource') return visibleSections?.resource ? (
                    <div key="resource" style={{ marginBottom: '32px' }}>
                      <div style={{ borderLeft: '4px solid #000', padding: '0 0 0 12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Human Capital Utilization</h3>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: 'IBM Plex Mono, monospace' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Resources Deployed</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.resourceDeployed}</td>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Shortage Projection</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.resourceShortage}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Capacity Utilized</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.resourceUtilized}</td>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Under-Utilization Delta</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.resourceUnderUtilized}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : null;
                  if (key === 'quality') return visibleSections?.quality ? (
                    <div key="quality" style={{ marginBottom: '32px' }}>
                      <div style={{ borderLeft: '4px solid #000', padding: '0 0 0 12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Quality Assurance Metrics</h3>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: 'IBM Plex Mono, monospace' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Total Variances</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.qualityTotal}</td>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Mitigation Complete</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.qualityCompleted}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Open Variances</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.qualityOpen}</td>
                            <td style={{ padding: '12px 16px', color: '#71717a', width: '35%', border: '1px solid #000', backgroundColor: '#f4f4f5', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Critical Defects</td>
                            <td style={{ padding: '12px 16px', fontWeight: '900', color: '#000', width: '15%', border: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>{summaryData?.qualityCritical}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : null;
                  if (key === 'charts') return visiblePhaseList.length > 0 ? (
                    <div key="charts" style={{ marginBottom: '32px' }}>
                      <div style={{ borderLeft: '4px solid #000', padding: '0 0 0 12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Analytical Tracker Visualizations</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', border: '1px solid #000', backgroundColor: '#000' }}>
                        {visiblePhaseList.map(phase => (
                          <div key={phase.id} style={{ backgroundColor: 'white' }}>
                            <div style={{ backgroundColor: '#f4f4f5', color: '#000', padding: '8px 12px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>{phase.label}</div>
                            {chartImages?.[phase.id] ? <img src={chartImages?.[phase.id]} alt={phase.label} style={{ width: '100%', height: 'auto', display: 'block' }} /> : (
                              <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                <span style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visualization Data_Missing</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                  return null;
                })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
