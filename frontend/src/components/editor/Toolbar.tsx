import React from 'react';
import { Type, Square, Image } from 'lucide-react';
import { TemplateElement } from '../../types';

interface ToolbarProps {
  onAddElement: (type: TemplateElement['type']) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddElement }) => {
  const tools = [
    { type: 'text' as const, icon: Type, label: 'Texte' },
    { type: 'shape' as const, icon: Square, label: 'Forme' },
    { type: 'image' as const, icon: Image, label: 'Image' },
  ];

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => onAddElement(tool.type)}
          className="w-12 h-12 mb-2 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors group"
          title={tool.label}
        >
          <tool.icon className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
        </button>
      ))}
    </div>
  );
};

export default Toolbar;