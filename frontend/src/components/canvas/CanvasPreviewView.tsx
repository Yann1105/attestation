import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle as KonvaCircle, Line, Image as KonvaImage } from 'react-konva';
import { Share2, Download, Save, FileJson, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface CanvasPreviewViewProps {
    template: any;
    onSave: (template: any) => void;
    onExport: () => void;
}

const CanvasPreviewView: React.FC<CanvasPreviewViewProps> = ({
    template,
    onSave,
    onExport
}) => {
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [canvasData, setCanvasData] = useState(template?.canvasData || {
        attrs: { width: template?.width || 1200, height: template?.height || 800 },
        children: [{ attrs: { name: 'background' }, className: 'Layer', children: [] }]
    });
    const stageRef = useRef<any>(null);

    const width = canvasData.attrs?.width || template?.width || 1200;
    const height = canvasData.attrs?.height || template?.height || 800;

    const handleJSONChange = (value: string | undefined) => {
        if (!value) return;
        try {
            const parsed = JSON.parse(value);
            setCanvasData(parsed);
        } catch (error) {
            console.error('Invalid JSON:', error);
        }
    };

    const renderElements = () => {
        // Simplified rendering for the preview
        const layers = canvasData.children || [];
        // Helper to safely map children
        return layers.flatMap((layer: any) => {
            const children = layer.children || [];
            if (!Array.isArray(children)) return [];

            return children.map((element: any, idx: number) => {
                const key = `elem-${idx}`;
                const { attrs, className } = element;

                if (className === 'Text') return <Text key={key} {...attrs} draggable />;
                if (className === 'Rect') return <Rect key={key} {...attrs} draggable />;
                if (className === 'Circle') return <KonvaCircle key={key} {...attrs} draggable />;
                if (className === 'Line') return <Line key={key} {...attrs} draggable />;
                if (className === 'Image') return <KonvaImage key={key} {...attrs} draggable image={new window.Image()} />;
                return null;
            });
        });
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('code')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileJson className="w-4 h-4" />
                            Code
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                            Aperçu
                        </button>
                    </div>
                    <div className="h-6 w-px bg-gray-200" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                        {template?.name || 'Nouveau Design'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSave({ ...template, canvasData })}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Enregistrer
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-medium transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-900/10">
                        <Share2 className="w-4 h-4" />
                        Partager
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {viewMode === 'code' ? (
                    <div className="h-full w-full">
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            value={JSON.stringify(canvasData, null, 2)}
                            onChange={handleJSONChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                padding: { top: 20 }
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-full w-full flex items-center justify-center p-12 overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                        <div className="bg-white shadow-2xl relative" style={{ width, height }}>
                            <Stage width={width} height={height} ref={stageRef}>
                                <Layer>
                                    <Rect x={0} y={0} width={width} height={height} fill="#ffffff" />
                                    {renderElements()}
                                </Layer>
                            </Stage>

                            {/* Floating Helper */}
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 text-xs text-gray-500 whitespace-nowrap">
                                <span>Double-cliquez pour éditer</span>
                                <div className="w-px h-4 bg-gray-200" />
                                <span>Glissez les éléments</span>
                                <div className="w-px h-4 bg-gray-200" />
                                <span>Ctrl+S pour sauver</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CanvasPreviewView;
