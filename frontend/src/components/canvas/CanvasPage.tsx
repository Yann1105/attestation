import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Copy, Download } from 'lucide-react';
import { templatesApi, canvasApi } from '../../utils/api';
import { CertificateTemplate } from '../../types';
import CanvasSidebar from './CanvasSidebar';
import CanvasChatView from './CanvasChatView';
import HtmlEditor from './HtmlEditor';

interface CanvasPageProps {
    onBack: () => void;
    initialTemplate?: CertificateTemplate | null;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    template?: any;
    isGenerating?: boolean;
}

const CanvasPage: React.FC<CanvasPageProps> = ({ onBack, initialTemplate }) => {
    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<CertificateTemplate | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatWidth, setChatWidth] = useState(450);
    const [isResizing, setIsResizing] = useState(false);

    // Initial load logic
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const data = await templatesApi.getAll();
                // Filter for AI generated templates for this sidebar
                const aiTemplates = data.filter(t => t.aiGenerated);
                setTemplates(aiTemplates);

                if (initialTemplate) {
                    // Try to find the full template details if it's from the shared list
                    const fullTemplate = aiTemplates.find(t => t.id === initialTemplate.id) || initialTemplate;
                    handleSelectTemplate(fullTemplate);
                }
            } catch (error) {
                console.error('Failed to load templates:', error);
            }
        };
        loadTemplates();
    }, [initialTemplate]);

    // Sidebar resize logic
    const resize = (e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX - (isSidebarOpen ? 240 : 0);
            if (newWidth > 300 && newWidth < 800) {
                setChatWidth(newWidth);
            }
        }
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const startResizing = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, isSidebarOpen]);

    const handleNewGeneration = () => {
        setActiveTemplate(null);
        setMessages([]);
    };

    const handleSelectTemplate = (template: CertificateTemplate) => {
        setActiveTemplate(template);
        if ((template.canvasData as any)?.messages && Array.isArray((template.canvasData as any).messages)) {
            setMessages((template.canvasData as any).messages);
        } else {
            setMessages([
                {
                    id: 'hist-1',
                    role: 'assistant',
                    content: `Voici votre design : ${template.name}. Vous pouvez le modifier ou me demander des ajustements.`,
                    template
                }
            ]);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Supprimer cette discussion ?')) return;
        try {
            await templatesApi.delete(id);
            setTemplates(templates.filter(t => t.id !== id));
            if (activeTemplate?.id === id) {
                handleNewGeneration();
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    const handleSendMessage = async (content: string, format: 'json' | 'html' = 'json') => {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
        const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Génération en cours...`,
            isGenerating: true
        };

        const newMessages = [...messages, userMsg, assistantMsg];
        setMessages(newMessages);
        setIsGenerating(true);

        try {
            const template = await canvasApi.generate(content, { format });

            const completedMessages = newMessages.map(m =>
                m.id === assistantMsg.id
                    ? {
                        ...m,
                        content: template.outputFormat === 'html'
                            ? 'Voici votre design !'
                            : `Voici votre document généré en format ${template.outputFormat?.toUpperCase()}.`,
                        isGenerating: false,
                        template
                    }
                    : m
            );
            setMessages(completedMessages);

            // Auto-save with messages and AI metadata
            const updatedTemplate = {
                ...template,
                canvasData: {
                    ...(template.canvasData || {}),
                    messages: completedMessages
                }
            };

            const saved = await handleSaveTemplate(updatedTemplate, completedMessages);
            if (saved) {
                setActiveTemplate(saved);
                // Refresh list
                const data = await templatesApi.getAll();
                setTemplates(data.filter(t => t.aiGenerated));
            }

        } catch (error: any) {
            setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id
                    ? { ...m, content: `Désolé, une erreur est survenue: ${error.message} `, isGenerating: false }
                    : m
            ));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveTemplate = async (updated: any, currentMessages?: Message[]) => {
        try {
            // Unified data mapping for 'templates' table
            const dataToSave = {
                ...updated,
                name: updated.name || `AI Design ${new Date().toLocaleDateString()}`,
                width: updated.width || activeTemplate?.width,
                height: updated.height || activeTemplate?.height,
                backgroundColor: updated.backgroundColor || '#FFFFFF',
                aiPrompt: updated.aiPrompt || messages.find(m => m.role === 'user')?.content,
                outputFormat: updated.outputFormat || 'html',
                aiGenerated: true,
                editorType: 'canvas',
                canvasData: {
                    ...(updated.canvasData || {}),
                    messages: currentMessages || messages,
                    content: updated.canvasData?.content || updated.html || ''
                }
            };

            // Also set top-level content for templates table compatibility
            if (dataToSave.canvasData.content) {
                (dataToSave as any).content = dataToSave.canvasData.content;
            }

            if (updated.id) {
                return await templatesApi.update(updated.id, dataToSave);
            } else {
                const saved = await templatesApi.create(dataToSave);
                if (saved && saved.id) {
                    return saved;
                }
            }
        } catch (error) {
            console.error('Failed to save template:', error);
            alert('Erreur lors de la sauvegarde du template.');
        }
        return null;
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadSource = () => {
        if (!activeTemplate) return;
        const content = activeTemplate.canvasData?.content || activeTemplate.html || '';
        const ext = activeTemplate.outputFormat === 'latex' ? 'tex' : (activeTemplate.outputFormat === 'markdown' ? 'md' : 'txt');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design_${activeTemplate.id || 'new'}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = async () => {
        if (!activeTemplate) return;
        setIsExporting(true);
        try {
            const content = activeTemplate.canvasData?.content || activeTemplate.html || '';
            const pdfBlob = await canvasApi.renderPDF(content);
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeTemplate.name || 'design'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Export failed:', error);
            alert('Échec de l\'export PDF.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={`flex h-screen bg-white overflow-hidden font-sans antialiased text-gray-900 ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
            {/* Sidebar toggle for desktop/tablet */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute bottom-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg transition-all duration-300 hover:scale-110 shadow-lg ${!isSidebarOpen ? 'translate-x-0' : 'translate-x-[240px]'}`}
                title={isSidebarOpen ? "Masquer la barre" : "Afficher la barre"}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <div className={`transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-[240px]' : 'w-0'}`}>
                <CanvasSidebar
                    templates={templates}
                    activeTemplateId={activeTemplate?.id || null}
                    onSelectTemplate={handleSelectTemplate}
                    onNewGeneration={handleNewGeneration}
                    onDeleteTemplate={handleDeleteTemplate}
                />
            </div>

            {/* Main Layout: Split Chat & Preview */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Chat Area - Responsive Width */}
                <div
                    className={`flex flex-col h-full bg-white transition-shadow duration-500 ease-in-out border-r border-gray-200 z-20 ${activeTemplate ? 'shadow-xl' : 'max-w-5xl mx-auto w-full'}`}
                    style={{ width: activeTemplate ? `${chatWidth}px` : '100%' }}
                >
                    <CanvasChatView
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isGenerating={isGenerating}
                    />
                </div>

                {/* Resize Handle */}
                {activeTemplate && (
                    <div
                        onMouseDown={startResizing}
                        className={`w-1.5 h-full cursor-col-resize bg-transparent hover:bg-blue-400/30 active:bg-blue-500 transition-colors z-30`}
                    />
                )}

                {/* Preview Area - Only visible when template active */}
                {activeTemplate && (
                    <div className="flex-1 flex flex-col min-w-0 bg-gray-50 animate-in fade-in duration-700 slide-in-from-right-10">
                        {/* Compact Header */}
                        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onBack}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex flex-col">
                                    <h1 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                                        {activeTemplate.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">{activeTemplate.outputFormat}</span>
                                        {activeTemplate.outputFormat !== 'html' && (
                                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Source Code Only</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExportPDF}
                                    disabled={isExporting}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 border border-red-700 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    {isExporting ? 'En cours...' : 'PDF'}
                                </button>
                                {activeTemplate.outputFormat !== 'html' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                const content = activeTemplate.canvasData?.content || '';
                                                navigator.clipboard.writeText(content);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copier
                                        </button>
                                        <button
                                            onClick={handleDownloadSource}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 border border-green-700 rounded-lg hover:bg-green-700 transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Source
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {activeTemplate.outputFormat === 'html' ? (
                                <HtmlEditor
                                    html={activeTemplate.html || ''}
                                    width={activeTemplate.width}
                                    height={activeTemplate.height}
                                    onBack={() => {
                                        if (activeTemplate.id) {
                                            canvasApi.getTemplate(activeTemplate.id).then(t => setActiveTemplate(t));
                                        }
                                    }}
                                    onSave={async (newHtml) => {
                                        const updated = { ...activeTemplate, html: newHtml };
                                        setActiveTemplate(updated);
                                        await handleSaveTemplate(updated, messages);
                                    }}
                                />
                            ) : (
                                <div className="h-full flex flex-col bg-[#0d1117] text-[#c9d1d9] font-mono overflow-auto border-l border-gray-800">
                                    <div className="flex-1 p-8">
                                        <div className="mb-6 flex items-center justify-between border-b border-gray-800 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="ml-4 text-xs font-medium text-gray-500 uppercase tracking-widest">
                                                    {activeTemplate.outputFormat === 'latex' ? 'LaTeX Document' : 'Markdown Source'}
                                                </span>
                                            </div>
                                        </div>
                                        <pre className="text-sm leading-relaxed overflow-x-auto selection:bg-blue-500/30 custom-scrollbar whitespace-pre-wrap">
                                            {activeTemplate.canvasData?.content || 'Aucun contenu généré'}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CanvasPage;
