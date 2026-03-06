import React, { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  topBar: ReactNode;
  toolBar: ReactNode;
  optionsBar?: ReactNode; // Barre d'options contextuelle (sous le menu)
  canvasArea: ReactNode;
  panels: ReactNode;
  statusBar?: ReactNode;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  topBar,
  toolBar,
  optionsBar,
  canvasArea,
  panels,
  statusBar
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#282828] overflow-hidden text-[#eeeeee] font-sans">
      {/* Top Menu Bar */}
      <div className="h-7 w-full border-b border-[#111111] bg-[#282828] flex-none z-50">
        {topBar}
      </div>

      {/* Options Bar (Contextual) - Optional but typical in PS */}
      {optionsBar && (
        <div className="h-8 w-full border-b border-[#111111] bg-[#3a3a3a] flex-none z-40 flex items-center px-2">
          {optionsBar}
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbar */}
        <div className="w-10 flex-none bg-[#3a3a3a] border-r border-[#111111] z-30 flex flex-col items-center py-2 space-y-1">
          {toolBar}
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden flex flex-col">
          {canvasArea}
        </div>

        {/* Right Panels Dock */}
        <div className="w-[320px] flex-none bg-[#3a3a3a] border-l border-[#111111] flex flex-col z-30">
          {panels}
        </div>
      </div>

      {/* Bottom Status Bar */}
      {statusBar && (
        <div className="h-6 w-full bg-[#3a3a3a] border-t border-[#111111] flex-none px-2 flex items-center text-[11px] text-[#aaaaaa]">
          {statusBar}
        </div>
      )}
    </div>
  );
};

export default WorkspaceLayout;
