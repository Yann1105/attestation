import { useState, useRef, useEffect } from 'react';

export const useSyncHTMLCode = () => {
    const [html, setHtml] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Aperçu → Code
    const syncFromPreview = () => {
        if (iframeRef.current?.contentDocument) {
            const doc = iframeRef.current.contentDocument;
            const newHtml = doc.documentElement.outerHTML;
            setHtml(newHtml);
        }
    };

    // Code → Aperçu
    const syncToPreview = (newHtml: string) => {
        setHtml(newHtml);
        if (iframeRef.current?.contentDocument) {
            const doc = iframeRef.current.contentDocument;
            doc.open();
            doc.write(newHtml);
            doc.close();
        }
    };

    return { html, setHtml, iframeRef, syncFromPreview, syncToPreview };
};
