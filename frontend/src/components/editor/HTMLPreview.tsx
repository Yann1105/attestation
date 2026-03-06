import React, { useEffect } from 'react';

interface HTMLPreviewProps {
    html: string;
    iframeRef: React.RefObject<HTMLIFrameElement>;
    onElementSelect?: (element: HTMLElement) => void;
}

export const HTMLPreview: React.FC<HTMLPreviewProps> = ({ html, iframeRef, onElementSelect }) => {
    useEffect(() => {
        if (iframeRef.current && html) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(html);
                doc.close();

                // Ajouter les event listeners pour la sélection
                if (onElementSelect) {
                    attachClickHandlers(doc, onElementSelect);
                }
            }
        }
    }, [html, iframeRef, onElementSelect]);

    const attachClickHandlers = (doc: Document, onSelect: (element: HTMLElement) => void) => {
        const editables = doc.querySelectorAll('[data-editable="true"]');
        editables.forEach(el => {
            (el as HTMLElement).addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Retirer le highlight des autres éléments
                editables.forEach(other => {
                    (other as HTMLElement).style.outline = '';
                });

                // Highlight l'élément sélectionné
                (el as HTMLElement).style.outline = '2px solid #3b82f6';

                onSelect(el as HTMLElement);
            });
        });
    };

    return (
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <iframe
                    ref={iframeRef}
                    className="w-full h-[800px] border-0"
                    title="Template Preview"
                    sandbox="allow-same-origin"
                />
            </div>
        </div>
    );
};
