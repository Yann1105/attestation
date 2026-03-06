import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AIPromptModalProps {
    onClose: () => void;
    onGenerate: (template: any) => void;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState<'certificate' | 'attestation' | 'poster'>('certificate');
    const [style, setStyle] = useState<'modern' | 'classic' | 'elegant' | 'minimal'>('modern');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Veuillez entrer une description');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const response = await fetch('/api/canvas/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    prompt,
                    category,
                    style,
                    format: "html"
                })
            });

            const data = await response.json();

            console.log("Canvas Generation Response:", data);

            const html = data?.html;

            if (!html) {
                throw new Error("Aucun HTML reçu du backend");
            }

            onGenerate(html);
        } catch (err) {
            console.error('Generation error:', err);
            setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Générer avec l'IA</h2>
                            <p className="text-sm text-gray-600">Décrivez votre template idéal</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description du template
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Créer un certificat de formation professionnel avec bordure dorée, logo en haut, nom du participant au centre en grande police élégante, et signature en bas à droite"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type de document
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['certificate', 'attestation', 'poster'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-3 rounded-lg border-2 transition-all ${category === cat
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                >
                                    {cat === 'certificate' && '🎓 Certificat'}
                                    {cat === 'attestation' && '📄 Attestation'}
                                    {cat === 'poster' && '🎨 Affiche'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Style
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {(['modern', 'classic', 'elegant', 'minimal'] as const).map((sty) => (
                                <button
                                    key={sty}
                                    onClick={() => setStyle(sty)}
                                    className={`px-4 py-3 rounded-lg border-2 transition-all ${style === sty
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                >
                                    {sty.charAt(0).toUpperCase() + sty.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Examples */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">💡 Exemples de prompts :</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• "Certificat moderne avec bordure bleue et logo centré"</li>
                            <li>• "Attestation élégante avec filigrane doré"</li>
                            <li>• "Affiche minimaliste pour événement avec titre accrocheur"</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={isGenerating}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Génération...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Générer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIPromptModal;
