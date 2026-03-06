import React, { useState } from 'react';
import { Save, Download } from 'lucide-react';

interface CanvasEditorProps {
    template: any;
    onBack?: () => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ template }) => {
    const [templateName] = useState(template?.name || 'Nouveau Template');

    // Extract HTML content from template
    const htmlContent = typeof template?.canvasData === 'string'
        ? template.canvasData
        : template?.canvasData?.html || template?.html || '';

    const handleSave = async () => {
        try {
            const response = await fetch('/api/canvas/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: templateName,
                    canvasData: { html: htmlContent },
                    html: htmlContent,
                    category: template?.category || 'certificate',
                    width: template?.width || 1200,
                    height: template?.height || 800
                })
            });

            if (response.ok) {
                alert('Template sauvegardé avec succès !');
            } else {
                alert('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Erreur de connexion');
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await fetch('/api/canvas/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    html: htmlContent,
                    format: 'pdf'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${templateName}.pdf`;
                a.click();
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export PDF');
        }
    };

    if (!htmlContent) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Aucun contenu HTML disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">{templateName}</h2>
                    <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            Mode HTML (IA)
                        </span>
                        <button
                            onClick={handleSave}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* HTML Preview */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
                <div className="bg-white shadow-2xl mx-auto" style={{ maxWidth: '1200px' }}>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
            </div>
        </div>
    );
};

export default CanvasEditor;
