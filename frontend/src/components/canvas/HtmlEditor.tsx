import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Layout, Code, Eye, Type, Move, FileText, Loader2 } from 'lucide-react';
import { canvasApi } from '../../utils/api';

interface HtmlEditorProps {
    html: string;
    width?: number;
    height?: number;
    onBack?: () => void;
    onSave?: (html: string) => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({
    html,
    width: propWidth,
    height: propHeight,
    onSave
}) => {
    const width = propWidth || 800;
    const height = propHeight || 1100;
    const [mode, setMode] = useState<'preview' | 'code' | 'split'>('preview');
    const [interactionMode, setInteractionMode] = useState<'edit' | 'move'>('edit');
    const [htmlContent, setHtmlContent] = useState<string>('');
    const previewRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.8);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAutoFit, setIsAutoFit] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setHtmlContent(html || '');
    }, [html]);

    // Inject HTML and enable drag/edit
    useEffect(() => {
        if ((mode === 'preview' || mode === 'split') && previewRef.current && htmlContent) {
            previewRef.current.innerHTML = htmlContent;

            const blocks = previewRef.current.querySelectorAll('[contenteditable="true"]');
            blocks.forEach((block) => {
                const el = block as HTMLElement;
                if (interactionMode === 'edit') {
                    el.contentEditable = 'true';
                    el.style.cursor = 'text';
                } else {
                    el.contentEditable = 'false';
                    el.style.cursor = 'move';
                    enableDrag(el);
                }
            });
        }
    }, [mode, htmlContent, interactionMode]);

    const enableDrag = (el: HTMLElement) => {
        el.style.position = 'absolute';
        el.style.cursor = 'move';

        el.onmousedown = (e) => {
            if (e.target !== el) return;
            e.preventDefault();

            let isDragging = true;

            // Get initial mouse position relative to the element, scaled
            const startX = e.clientX;
            const startY = e.clientY;
            const initialLeft = el.offsetLeft;
            const initialTop = el.offsetTop;

            document.onmousemove = (moveEvent) => {
                if (!isDragging) return;
                moveEvent.preventDefault();

                // Calculate delta and adjust for scale
                const dx = (moveEvent.clientX - startX) / scale;
                const dy = (moveEvent.clientY - startY) / scale;

                el.style.left = `${initialLeft + dx}px`;
                el.style.top = `${initialTop + dy}px`;
            };

            document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
                // Sync content after move
                if (previewRef.current) {
                    setHtmlContent(previewRef.current.innerHTML);
                }
            };
        };
    };

    // Auto-scale logic
    useEffect(() => {
        if (!isAutoFit || (mode !== 'preview' && mode !== 'split') || !containerRef.current) return;

        const updateScale = () => {
            if (!containerRef.current) return;
            const padding = mode === 'split' ? 32 : 64;
            const containerWidth = containerRef.current.clientWidth - padding;
            const containerHeight = containerRef.current.clientHeight - padding;

            const scaleW = containerWidth / width;
            const scaleH = containerHeight / height;
            const newScale = Math.min(scaleW, scaleH, mode === 'split' ? 0.6 : 1);

            setScale(newScale);
        };

        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(containerRef.current);
        updateScale();
        return () => resizeObserver.disconnect();
    }, [isAutoFit, mode, width, height]);

    const handleSave = () => {
        let finalHtml = htmlContent;
        if ((mode === 'preview' || mode === 'split') && previewRef.current) {
            finalHtml = previewRef.current.innerHTML;
        }
        if (onSave) onSave(finalHtml);
    };

    const handleDownload = () => {
        const contentToDownload = (mode === 'preview' || mode === 'split') && previewRef.current
            ? previewRef.current.innerHTML
            : htmlContent;
        const blob = new Blob([contentToDownload], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const contentToExport = (mode === 'preview' || mode === 'split') && previewRef.current
                ? previewRef.current.innerHTML
                : htmlContent;

            const pdfBlob = await canvasApi.renderPDF(contentToExport);
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Export failed:', error);
            alert('Échec de l\'export PDF. Veuillez réessayer.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] bg-[#f8f9fa]">
            {/* Toolbar */}
            <div className="h-14 flex justify-between items-center bg-white px-6 border-b border-gray-200 z-30 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold text-gray-900 border-r pr-4 border-gray-200">ÉDITEUR HTML</h2>

                    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setMode('preview')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Aperçu
                        </button>
                        <button
                            onClick={() => setMode('split')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Layout className="w-3.5 h-3.5" /> Split
                        </button>
                        <button
                            onClick={() => setMode('code')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Code className="w-3.5 h-3.5" /> Code
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {(mode === 'preview' || mode === 'split') && (
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1 mr-2">
                            <div className="flex items-center gap-1 border-r pr-2 mr-2">
                                <button
                                    onClick={() => setInteractionMode('edit')}
                                    className={`p-1.5 rounded transition-all ${interactionMode === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                    title="Édition de texte"
                                >
                                    <Type className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setInteractionMode('move')}
                                    className={`p-1.5 rounded transition-all ${interactionMode === 'move' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                    title="Déplacer les blocs"
                                >
                                    <Move className="w-4 h-4" />
                                </button>
                            </div>
                            <button onClick={() => { setIsAutoFit(false); setScale(s => Math.max(0.1, s - 0.1)); }} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-xs font-bold">-</button>
                            <span className="text-[10px] w-8 text-center font-bold text-gray-600">{Math.round(scale * 100)}%</span>
                            <button onClick={() => { setIsAutoFit(false); setScale(s => Math.min(3, s + 0.1)); }} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-xs font-bold">+</button>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" /> Enregistrer
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold shadow-md shadow-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        PDF
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shadow-md shadow-green-200 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" /> HTML
                    </button>
                </div>
            </div>

            {/* Split/Main Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Code Editor Column (Split or Code mode) */}
                {(mode === 'code' || mode === 'split') && (
                    <div className={`${mode === 'split' ? 'w-1/3' : 'w-full'} border-r border-gray-200 bg-[#1e1e1e] flex flex-col`}>
                        <div className="h-8 bg-[#252526] flex items-center px-4">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">index.html</span>
                        </div>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className="flex-1 w-full p-6 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] resize-none focus:outline-none custom-scrollbar"
                            spellCheck={false}
                        />
                    </div>
                )}

                {/* Preview Column (Split or Preview mode) */}
                {(mode === 'preview' || mode === 'split') && (
                    <div ref={containerRef} className="flex-1 bg-[#f0f2f5] overflow-auto flex items-center justify-center relative select-none p-12 custom-scrollbar">
                        <div
                            className="shadow-[0_30px_60px_-12px_rgba(50,50,93,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)] ring-1 ring-black/5 bg-white overflow-hidden transition-all duration-300"
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                                width: `${width}px`,
                                height: `${height}px`,
                                minWidth: `${width}px`,
                                minHeight: `${height}px`
                            }}
                        >
                            <div
                                ref={previewRef}
                                className="w-full h-full relative"
                            />
                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-200 shadow-xl opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                                <Layout className="w-3 h-3" />
                                {interactionMode === 'edit' ? 'MODE ÉDITION TEXTE' : 'MODE DÉPLACEMENT BLOCS'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HtmlEditor;
