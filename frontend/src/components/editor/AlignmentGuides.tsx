import React from 'react';
import { TemplateElement } from '../../types';

interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  elements: TemplateElement[];
}

interface AlignmentGuidesProps {
  elements: TemplateElement[];
  selectedElement: TemplateElement | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panOffset: { x: number; y: number };
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  elements,
  selectedElement,
  canvasWidth,
  canvasHeight,
  zoom,
  panOffset
}) => {
  const [guides, setGuides] = React.useState<AlignmentGuide[]>([]);

  React.useEffect(() => {
    if (!selectedElement) {
      setGuides([]);
      return;
    }

    const newGuides: AlignmentGuide[] = [];
    const snapThreshold = 5 / zoom; // Adjust threshold based on zoom

    // Check horizontal alignments
    const selectedCenterY = selectedElement.y + selectedElement.height / 2;
    const selectedTop = selectedElement.y;
    const selectedBottom = selectedElement.y + selectedElement.height;

    elements.forEach(element => {
      if (element.id === selectedElement.id) return;

      const elementCenterY = element.y + element.height / 2;
      const elementTop = element.y;
      const elementBottom = element.y + element.height;

      // Center alignment
      if (Math.abs(selectedCenterY - elementCenterY) < snapThreshold) {
        newGuides.push({
          type: 'horizontal',
          position: elementCenterY,
          elements: [selectedElement, element]
        });
      }

      // Top alignment
      if (Math.abs(selectedTop - elementTop) < snapThreshold) {
        newGuides.push({
          type: 'horizontal',
          position: elementTop,
          elements: [selectedElement, element]
        });
      }

      // Bottom alignment
      if (Math.abs(selectedBottom - elementBottom) < snapThreshold) {
        newGuides.push({
          type: 'horizontal',
          position: elementBottom,
          elements: [selectedElement, element]
        });
      }
    });

    // Check vertical alignments
    const selectedCenterX = selectedElement.x + selectedElement.width / 2;
    const selectedLeft = selectedElement.x;
    const selectedRight = selectedElement.x + selectedElement.width;

    elements.forEach(element => {
      if (element.id === selectedElement.id) return;

      const elementCenterX = element.x + element.width / 2;
      const elementLeft = element.x;
      const elementRight = element.x + element.width;

      // Center alignment
      if (Math.abs(selectedCenterX - elementCenterX) < snapThreshold) {
        newGuides.push({
          type: 'vertical',
          position: elementCenterX,
          elements: [selectedElement, element]
        });
      }

      // Left alignment
      if (Math.abs(selectedLeft - elementLeft) < snapThreshold) {
        newGuides.push({
          type: 'vertical',
          position: elementLeft,
          elements: [selectedElement, element]
        });
      }

      // Right alignment
      if (Math.abs(selectedRight - elementRight) < snapThreshold) {
        newGuides.push({
          type: 'vertical',
          position: elementRight,
          elements: [selectedElement, element]
        });
      }
    });

    // Canvas edge alignments
    if (Math.abs(selectedElement.x) < snapThreshold) {
      newGuides.push({
        type: 'vertical',
        position: 0,
        elements: [selectedElement]
      });
    }

    if (Math.abs(selectedElement.x + selectedElement.width - canvasWidth) < snapThreshold) {
      newGuides.push({
        type: 'vertical',
        position: canvasWidth,
        elements: [selectedElement]
      });
    }

    if (Math.abs(selectedElement.y) < snapThreshold) {
      newGuides.push({
        type: 'horizontal',
        position: 0,
        elements: [selectedElement]
      });
    }

    if (Math.abs(selectedElement.y + selectedElement.height - canvasHeight) < snapThreshold) {
      newGuides.push({
        type: 'horizontal',
        position: canvasHeight,
        elements: [selectedElement]
      });
    }

    setGuides(newGuides);
  }, [elements, selectedElement, canvasWidth, canvasHeight, zoom]);

  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 999 }}>
      {guides.map((guide, index) => (
        <div key={index}>
          {guide.type === 'horizontal' ? (
            <>
              <div
                className="absolute bg-red-500 opacity-75"
                style={{
                  left: panOffset.x,
                  top: panOffset.y + guide.position * zoom,
                  width: canvasWidth * zoom,
                  height: 1,
                  transform: `scaleY(${1 / zoom})`,
                  transformOrigin: 'top left'
                }}
              />
              {/* Distance indicator */}
              <div
                className="absolute bg-red-600 text-white text-xs px-1 py-0.5 rounded pointer-events-auto"
                style={{
                  left: panOffset.x + (canvasWidth * zoom) / 2 - 20,
                  top: panOffset.y + guide.position * zoom - 10,
                  transform: 'translateX(-50%)',
                  fontSize: '10px'
                }}
              >
                {Math.round(guide.position)}px
              </div>
            </>
          ) : (
            <>
              <div
                className="absolute bg-red-500 opacity-75"
                style={{
                  left: panOffset.x + guide.position * zoom,
                  top: panOffset.y,
                  width: 1,
                  height: canvasHeight * zoom,
                  transform: `scaleX(${1 / zoom})`,
                  transformOrigin: 'top left'
                }}
              />
              {/* Distance indicator */}
              <div
                className="absolute bg-red-600 text-white text-xs px-1 py-0.5 rounded pointer-events-auto"
                style={{
                  left: panOffset.x + guide.position * zoom + 5,
                  top: panOffset.y + (canvasHeight * zoom) / 2 - 8,
                  transform: 'translateY(-50%)',
                  fontSize: '10px'
                }}
              >
                {Math.round(guide.position)}px
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlignmentGuides;