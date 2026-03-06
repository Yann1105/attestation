import React, { useState } from 'react';
import { aiTemplatesApi } from '../../utils/api';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerationPanelProps {
    onGenerate: (result: {
        type: string;
        html: string;
        variables: string[];
        description: string;
    }) => void;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({ onGenerate }) => {
    const [type, setType] = useState<'attestation' | 'certificat' | 'affiche'>('certificat');
    const [customPrompt, setCustomPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const result = await aiTemplatesApi.generate({
                type,
                customPrompt: customPrompt.trim() || undefined,
                save: false,
            });

            onGenerate(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
            console.error('Generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Générateur IA</h2>
            </div>

            {/* Sélecteur de type */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document
                </label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isGenerating}
                >
                    <option value="certificat">Certificat</option>
                    <option value="attestation">Attestation</option>
                    <option value="affiche">Affiche</option>
                </select>
            </div>

            {/* Prompt personnalisé */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt personnalisé (optionnel)
                </label>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Design moderne avec couleurs bleues et dorées..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    disabled={isGenerating}
                />
            </div>

            {/* Bouton de génération */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Génération en cours...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Générer avec IA
                    </>
                )}
            </button>

            {/* Erreur */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Informations */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">
                    💡 Comment ça marche ?
                </h3>
                <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Choisissez le type de document</li>
                    <li>• Ajoutez un prompt personnalisé (optionnel)</li>
                    <li>• Cliquez sur "Générer"</li>
                    <li>• Modifiez visuellement le résultat</li>
                </ul>
            </div>
        </div>
    );
};
