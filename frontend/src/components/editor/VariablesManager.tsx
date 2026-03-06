import React, { useMemo, useState } from 'react';
import { Variable, Download } from 'lucide-react';

interface VariablesManagerProps {
    html: string;
    onExport?: (htmlWithValues: string) => void;
}

export const VariablesManager: React.FC<VariablesManagerProps> = ({ html, onExport }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    // Détecter les variables dans le HTML
    const detectedVars = useMemo(() => {
        const regex = /\{\{(\w+)\}\}/g;
        const matches = [...html.matchAll(regex)];
        return [...new Set(matches.map(m => m[1]))];
    }, [html]);

    // Injecter les valeurs dans le HTML
    const injectValues = (htmlContent: string): string => {
        let result = htmlContent;
        Object.entries(values).forEach(([key, value]) => {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        });
        return result;
    };

    const handleExport = () => {
        const htmlWithValues = injectValues(html);
        if (onExport) {
            onExport(htmlWithValues);
        } else {
            // Télécharger le HTML
            const blob = new Blob([htmlWithValues], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template-filled.html';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (detectedVars.length === 0) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                    Aucune variable détectée dans ce template
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Variable className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Variables Dynamiques
                </h3>
            </div>

            {/* Formulaire des variables */}
            <div className="space-y-3">
                {detectedVars.map(varName => (
                    <div key={varName}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {varName.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                            type="text"
                            value={values[varName] || ''}
                            onChange={(e) => setValues({ ...values, [varName]: e.target.value })}
                            placeholder={`Entrez ${varName}...`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                ))}
            </div>

            {/* Bouton d'export */}
            <button
                onClick={handleExport}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4" />
                Exporter avec valeurs
            </button>

            {/* Aperçu des variables */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-2">
                    Variables détectées : {detectedVars.length}
                </p>
                <div className="flex flex-wrap gap-1">
                    {detectedVars.map(varName => (
                        <span
                            key={varName}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-mono"
                        >
                            {`{{${varName}}}`}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
