import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Copy, Trash2 } from 'lucide-react';

interface TemplateGalleryProps {
    onNewTemplate: () => void;
    onEditTemplate: (template: any) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onNewTemplate, onEditTemplate }) => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadTemplates();
    }, [filter]);

    const loadTemplates = async () => {
        try {
            const url = filter === 'all'
                ? '/api/canvas/templates'
                : `/api/canvas/templates?category=${filter}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDuplicate = async (templateId: string) => {
        try {
            const response = await fetch(`/api/canvas/templates/${templateId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                loadTemplates();
            }
        } catch (error) {
            console.error('Failed to duplicate template:', error);
        }
    };

    const handleDelete = async (templateId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

        try {
            const response = await fetch(`/api/canvas/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                loadTemplates();
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors = {
            certificate: 'bg-blue-100 text-blue-700',
            attestation: 'bg-green-100 text-green-700',
            poster: 'bg-purple-100 text-purple-700',
            other: 'bg-gray-100 text-gray-700'
        };

        return colors[category as keyof typeof colors] || colors.other;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des templates...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Filters */}
            <div className="mb-6 flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
                {['all', 'certificate', 'attestation', 'poster', 'other'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* New Template Card */}
                <button
                    onClick={onNewTemplate}
                    className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-8 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all aspect-[3/4] flex flex-col items-center justify-center"
                >
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-blue-900">Nouveau Template</p>
                    <p className="text-sm text-blue-600 mt-1">Générer avec l'IA</p>
                </button>

                {/* Template Cards */}
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all aspect-[3/4]"
                    >
                        {/* Preview */}
                        <div className="h-3/4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white rounded-lg shadow-md mx-auto mb-2 flex items-center justify-center">
                                    <span className="text-2xl">📄</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {template.width} × {template.height}px
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="h-1/4 p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{template.description}</p>
                                </div>
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getCategoryBadge(template.category)}`}>
                                    {template.category}
                                </span>
                            </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onEditTemplate(template)}
                                    className="p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Éditer"
                                >
                                    <Edit2 className="w-5 h-5 text-blue-600" />
                                </button>
                                <button
                                    onClick={() => handleDuplicate(template.id)}
                                    className="p-3 bg-white rounded-lg hover:bg-green-50 transition-colors"
                                    title="Dupliquer"
                                >
                                    <Copy className="w-5 h-5 text-green-600" />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {templates.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun template</h3>
                    <p className="text-gray-600 mb-6">Commencez par créer votre premier template avec l'IA</p>
                    <button
                        onClick={onNewTemplate}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Créer un template
                    </button>
                </div>
            )}
        </div>
    );
};

export default TemplateGallery;
