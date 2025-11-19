import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, Palette, Trash2, Layers, Edit, X, ChevronDown } from 'lucide-react';
import { CertificateTemplate } from '../types';
import { templatesApi } from '../utils/api';
import { defaultTemplates } from '../utils/certificateTemplates';
import JSZip from 'jszip';

interface CertificateTemplatesProps {
    onBack: () => void;
    onNewTemplate?: () => void;
    onEditTemplate?: (template: CertificateTemplate) => void;
}

const CertificateTemplates: React.FC<CertificateTemplatesProps> = ({ onBack, onNewTemplate, onEditTemplate }) => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState<string | null>(null);

  React.useEffect(() => {
    loadTemplates();
  }, []);

  // Auto-select Yann template if it exists and has canvasData, otherwise first canvas template
  React.useEffect(() => {
    if (templates.length && !selectedTemplate) {
      // Priorité Yann si présent et canvas
      const yann = templates.find(t => (t.name || '').toLowerCase().includes('yann') && !!t.canvasData);
      if (yann) {
        setSelectedTemplate(yann);
        console.log('🎯 Auto-selected Yann template:', yann.name);
      } else {
        // Sélectionner le premier template Canvas si disponible
        const firstCanvas = templates.find(t => !!t.canvasData);
        if (firstCanvas) {
          setSelectedTemplate(firstCanvas);
          console.log('🎯 Auto-selected first Canvas template:', firstCanvas.name);
        } else if (templates.length > 0) {
          // Fallback to first template
          setSelectedTemplate(templates[0]);
          console.log('🎯 Auto-selected first template (no Canvas):', templates[0].name);
        }
      }
    }
  }, [templates.length, selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const savedTemplates = await templatesApi.getAll();
      // Combine default templates with saved custom templates
      const allTemplates = [...defaultTemplates, ...savedTemplates];

      // Sort templates: Yann first, then others
      const sortedTemplates = allTemplates.sort((a, b) => {
        const aIsYann = (a.name || '').toLowerCase().includes('yann');
        const bIsYann = (b.name || '').toLowerCase().includes('yann');

        // Yann toujours en premier
        if (aIsYann && !bIsYann) return -1;
        if (!aIsYann && bIsYann) return 1;

        return 0; // Maintain original order for same type
      });

      setTemplates(sortedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(defaultTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        await templatesApi.delete(templateId);
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handlePreviewTemplate = (template: CertificateTemplate) => {
    setPreviewTemplate(template);
  };

  const handleEditTemplate = (template: CertificateTemplate) => {
    console.log('📝 CertificateTemplates: Editing template:', template.name, template.id);
    if (onEditTemplate) {
      onEditTemplate(template);
    } else {
      console.error('❌ CertificateTemplates: onEditTemplate not provided');
      alert('Fonctionnalité d\'édition à implémenter');
    }
  };

  const handleDownloadTemplate = async (template: CertificateTemplate, format: string) => {
    try {
      let url: string;
      let filename: string;

      switch (format) {
        case 'png':
          // Generate PNG from canvas
          url = await generateTemplateImage(template, 'png');
          filename = `${template.name || 'template'}.png`;
          break;
        case 'jpg':
          url = await generateTemplateImage(template, 'jpg');
          filename = `${template.name || 'template'}.jpg`;
          break;
        case 'pdf':
          url = await generateTemplatePDF(template);
          filename = `${template.name || 'template'}.pdf`;
          break;
        case 'psd':
          // For PSD, we'd need a library or backend conversion
          alert('Export PSD à implémenter');
          return;
        case 'zip':
          url = await generateTemplateZIP(template);
          filename = `${template.name || 'template'}.zip`;
          break;
        default:
          return;
      }

      // Download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up blob URLs
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Download error:', error);
      alert('Erreur lors du téléchargement');
    }
    setShowDownloadMenu(null);
  };

  const generateTemplateImage = async (template: CertificateTemplate, format: 'png' | 'jpg'): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      canvas.width = template.width || 800;
      canvas.height = template.height || 600;

      // Fill background
      ctx.fillStyle = template.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      template.elements.forEach(element => {
        if (element.type === 'text') {
          ctx.fillStyle = element.color || '#000000';
          ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
          ctx.fillText(
            element.content?.replace(/\{\{.*?\}\}/g, 'Exemple') || '',
            element.x,
            element.y + (element.fontSize || 16)
          );
        } else if (element.type === 'shape') {
          ctx.fillStyle = element.backgroundColor || '#cccccc';
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }
        // Images would need to be loaded asynchronously
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          throw new Error('Failed to generate image');
        }
      }, format === 'jpg' ? 'image/jpeg' : 'image/png', format === 'jpg' ? 0.8 : 1.0);
    });
  };

  const generateTemplatePDF = async (template: CertificateTemplate): Promise<string> => {
    // For now, generate as image and return - full PDF would need jsPDF
    return generateTemplateImage(template, 'png');
  };

  const generateTemplateZIP = async (template: CertificateTemplate): Promise<string> => {
    // Create a ZIP with template JSON and images
    const zip = new JSZip();

    // Add template JSON
    zip.file(`${template.name || 'template'}.json`, JSON.stringify(template, null, 2));

    // Add images if any
    const imagePromises = template.elements
      .filter(el => el.type === 'image' && el.imageUrl)
      .map(async (el, index) => {
        try {
          const response = await fetch(el.imageUrl!);
          const blob = await response.blob();
          zip.file(`image_${index + 1}.png`, blob);
        } catch (error) {
          console.warn('Failed to include image in ZIP:', error);
        }
      });

    await Promise.all(imagePromises);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return URL.createObjectURL(zipBlob);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Templates de Certificats</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion des modèles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
           <p className="text-gray-600">
             Gérez vos modèles de certificats
           </p>
           {onNewTemplate && (
             <button
               onClick={onNewTemplate}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
             >
               <Palette className="w-4 h-4 mr-2" />
               Nouveau Template
             </button>
           )}
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: template.backgroundColor,
                    transform: 'scale(0.2)',
                    transformOrigin: 'top left',
                    width: '500%',
                    height: '500%'
                  }}
                >
                  {template.elements
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .slice(0, 10) // Limit elements for preview
                    .map((element) => (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                          opacity: element.opacity || 1
                        }}
                      >
                        {element.type === 'text' && (
                          <div
                            className="w-full h-full flex items-center"
                            style={{
                              fontSize: element.fontSize,
                              fontFamily: element.fontFamily,
                              fontWeight: element.fontWeight,
                              color: element.color,
                              textAlign: element.textAlign,
                              backgroundColor: element.backgroundColor || 'transparent',
                              borderRadius: element.borderRadius || 0
                            }}
                          >
                            {element.content?.replace(/\{\{.*?\}\}/g, 'Sample')}
                          </div>
                        )}
                        {element.type === 'shape' && (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: element.backgroundColor,
                              borderRadius: element.borderRadius || 0
                            }}
                          />
                        )}
                        {element.type === 'image' && element.imageUrl && (
                          <img
                            src={element.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{
                              borderRadius: element.borderRadius || 0
                            }}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.canvasData ? (
                      <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium flex items-center">
                        <Palette className="w-3 h-3 mr-1" />
                        Canvas
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        HTML
                      </span>
                    )}
                    {(template.name || '').toLowerCase().includes('yann') && template.canvasData && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center">
                        <Layers className="w-3 h-3 mr-1" />
                        Yann
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTemplate?.id === template.id && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Sélectionné
                      </span>
                    )}
                    {template.type !== 'custom' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Défaut
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {template.elements.length} élément{template.elements.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {template.width} × {template.height}px
                  </p>
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 flex items-center justify-center px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Aperçu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowDownloadMenu(showDownloadMenu === template.id ? null : template.id)}
                      className="flex items-center justify-center px-2 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                    {showDownloadMenu === template.id && (
                      <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                        <button
                          onClick={() => handleDownloadTemplate(template, 'png')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          PNG
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate(template, 'jpg')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          JPG
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate(template, 'pdf')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate(template, 'psd')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          PSD
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate(template, 'zip')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          ZIP
                        </button>
                      </div>
                    )}
                  </div>
                  {(template.editableAfterSave || template.type === 'custom') && (
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="flex items-center justify-center px-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {template.type === 'custom' && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex items-center justify-center px-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun template
            </h3>
            <p className="text-gray-500">
              Les templates par défaut seront chargés automatiquement
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Aperçu: {previewTemplate.name}</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer l'aperçu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="flex justify-center">
                <div
                  className="relative border border-gray-300 bg-white shadow-lg"
                  style={{
                    width: previewTemplate.width || 800,
                    height: previewTemplate.height || 600,
                    maxWidth: '100%',
                    maxHeight: '70vh'
                  }}
                >
                  {previewTemplate.elements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute"
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                        opacity: element.opacity || 1
                      }}
                    >
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full flex items-center"
                          style={{
                            fontSize: element.fontSize,
                            fontFamily: element.fontFamily,
                            fontWeight: element.fontWeight,
                            color: element.color,
                            textAlign: element.textAlign,
                            backgroundColor: element.backgroundColor || 'transparent',
                            borderRadius: element.borderRadius || 0,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {element.content?.replace(/\{\{.*?\}\}/g, (match) => {
                            // Replace variables with sample data
                            const varName = match.slice(2, -2);
                            const sampleData: Record<string, string> = {
                              participant_name: 'Jean Dupont',
                              training_name: 'Formation React',
                              date: '15 décembre 2024',
                              trainer_name: 'Marie Martin',
                              duration: '40 heures',
                              location: 'Paris'
                            };
                            return sampleData[varName] || match;
                          })}
                        </div>
                      )}
                      {element.type === 'shape' && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: element.backgroundColor,
                            borderRadius: element.borderRadius || 0
                          }}
                        />
                      )}
                      {element.type === 'image' && element.imageUrl && (
                        <img
                          src={element.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{
                            borderRadius: element.borderRadius || 0
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Aperçu avec données d'exemple - Les variables sont remplacées par des valeurs fictives</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplates;