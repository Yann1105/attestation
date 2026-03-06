import React from 'react';
import { Plus, MessageSquare, Trash2, LayoutTemplate, MoreHorizontal } from 'lucide-react';
import { CertificateTemplate } from '../../types';

interface CanvasSidebarProps {
    templates: CertificateTemplate[];
    activeTemplateId: string | null;
    onSelectTemplate: (template: CertificateTemplate) => void;
    onNewGeneration: () => void;
    onDeleteTemplate: (id: string) => void;
}

const CanvasSidebar: React.FC<CanvasSidebarProps> = ({
    templates,
    activeTemplateId,
    onSelectTemplate,
    onNewGeneration,
    onDeleteTemplate
}) => {
    return (
        <div className="w-[240px] flex flex-col bg-[#0f0f0f] text-gray-300 h-full border-r border-[#2d2d2d] shrink-0 transition-all duration-300">
            {/* New Generation Button */}
            <div className="p-3">
                <button
                    onClick={onNewGeneration}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-lg transition-all border border-[#2d2d2d] group"
                >
                    <div className="p-1 bg-white text-black rounded-full">
                        <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Nouveau chat</span>
                    <LayoutTemplate className="w-4 h-4 ml-auto text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
                <div>
                    <div className="px-3 mb-2 text-xs font-medium text-gray-500">
                        Aujourd'hui
                    </div>
                    <div className="space-y-1">
                        {(templates || []).filter(t => t && t.id).length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-600 italic">
                                Historique vide
                            </div>
                        ) : (
                            (templates || []).filter(t => t && t.id).map((template) => (
                                <div
                                    key={template.id}
                                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${activeTemplateId === template.id
                                        ? 'bg-[#252525] text-white'
                                        : 'hover:bg-[#1a1a1a] text-gray-400 hover:text-gray-200'
                                        }`}
                                    onClick={() => onSelectTemplate(template)}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0 text-gray-500" />
                                    <div className="flex-1 truncate text-sm font-normal">
                                        {template.aiPrompt || (template.canvasData as any)?.messages?.find((m: any) => m.role === 'user')?.content || template.name || 'Conversation sans titre'}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                        <button className="p-1 hover:text-white transition-colors">
                                            <MoreHorizontal className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteTemplate(template.id);
                                            }}
                                            className="p-1 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-[#2d2d2d]">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">Administrateur</div>
                        <div className="text-xs text-gray-500">Plan Pro</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanvasSidebar;
