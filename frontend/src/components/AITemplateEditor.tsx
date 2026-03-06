import React, { useState } from 'react';
import { Layout, Sparkles } from 'lucide-react';
import { GenerationPanel } from './editor/GenerationPanel';
import HtmlEditor from './canvas/HtmlEditor';

interface AITemplateEditorProps {
    onBack: () => void;
}

export const AITemplateEditor: React.FC<AITemplateEditorProps> = ({ onBack }) => {
    const [html, setHtml] = useState<string>('');

    const handleGenerate = (result: {
        html: string;
    }) => {
        setHtml(result.html);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Generation */}
                <div className="w-[380px] border-r border-gray-200 bg-white flex flex-col shadow-xl z-20">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Designer</h2>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Configurez votre demande et laissez l'IA créer votre template premium.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <GenerationPanel onGenerate={handleGenerate} />
                    </div>

                    <button
                        onClick={onBack}
                        className="m-6 p-3 text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Layout className="w-4 h-4" /> Retour au Tableau de bord
                    </button>
                </div>

                {/* Right Panel - Unified Premium Editor */}
                <div className="flex-1 flex flex-col bg-[#f0f2f5]">
                    {html ? (
                        <HtmlEditor
                            html={html}
                            onBack={onBack}
                            onSave={(newHtml) => {
                                console.log('Saving from AI Editor...');
                                setHtml(newHtml);
                                // Here we could also call an API to save
                            }}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="max-w-md w-full p-12 text-center bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Prêt à créer ?</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                    Utilisez le panneau latéral pour décrire votre document. L'IA générera un code HTML premium avec Tailwind CSS prêt à l'emploi.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600 text-xs font-bold">1</div>
                                        <p className="text-xs font-bold text-gray-700">Décrivez votre design</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-green-600 text-xs font-bold">2</div>
                                        <p className="text-xs font-bold text-gray-700">Générez le template complet</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-purple-600 text-xs font-bold">3</div>
                                        <p className="text-xs font-bold text-gray-700">Ajustez visuellement ou via le code</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
