import React, { useState, useEffect } from 'react';
import { Type, Palette, Move } from 'lucide-react';

interface VisualEditorPanelProps {
    selectedElement: HTMLElement | null;
    onUpdate: () => void;
}

export const VisualEditorPanel: React.FC<VisualEditorPanelProps> = ({
    selectedElement,
    onUpdate
}) => {
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState('16');
    const [textColor, setTextColor] = useState('#000000');

    useEffect(() => {
        if (selectedElement) {
            setText(selectedElement.textContent || '');

            // Extraire la taille de police
            const computedStyle = window.getComputedStyle(selectedElement);
            setFontSize(parseInt(computedStyle.fontSize).toString());

            // Extraire la couleur
            setTextColor(rgbToHex(computedStyle.color));
        }
    }, [selectedElement]);

    const rgbToHex = (rgb: string): string => {
        const match = rgb.match(/\d+/g);
        if (!match) return '#000000';
        const [r, g, b] = match.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    const handleTextChange = (newText: string) => {
        setText(newText);
        if (selectedElement) {
            selectedElement.textContent = newText;
            onUpdate();
        }
    };

    const handleFontSizeChange = (size: string) => {
        setFontSize(size);
        if (selectedElement) {
            selectedElement.style.fontSize = `${size}px`;
            onUpdate();
        }
    };

    const handleColorChange = (color: string) => {
        setTextColor(color);
        if (selectedElement) {
            selectedElement.style.color = color;
            onUpdate();
        }
    };

    if (!selectedElement) {
        return (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
                <div className="text-center text-gray-500">
                    <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                        Cliquez sur un élément dans l'aperçu pour le modifier
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Édition Visuelle</h2>

            {/* Éditeur de texte */}
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Type className="w-4 h-4" />
                    Texte
                </label>
                <textarea
                    value={text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                />
            </div>

            {/* Taille de police */}
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Move className="w-4 h-4" />
                    Taille de police
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min="12"
                        max="72"
                        value={fontSize}
                        onChange={(e) => handleFontSizeChange(e.target.value)}
                        className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                        {fontSize}px
                    </span>
                </div>
            </div>

            {/* Couleur du texte */}
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4" />
                    Couleur
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={textColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                </div>
            </div>

            {/* Classes Tailwind */}
            <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Classes CSS
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <code className="text-xs text-gray-700 break-all">
                        {selectedElement.className || 'Aucune classe'}
                    </code>
                </div>
            </div>

            {/* Informations */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Astuce
                </h3>
                <p className="text-xs text-blue-700">
                    Les modifications sont synchronisées en temps réel avec le code HTML.
                </p>
            </div>
        </div>
    );
};
