import React, { useState } from 'react';
import { TemplateElement } from '../../types';

interface TransformationHandlesProps {
  element: TemplateElement;
  onStartTransform: (handle: string, startX: number, startY: number) => void;
  onStartDeform?: (pointIndex: number, startX: number, startY: number) => void;
  onStartSkew?: (handle: string, startX: number, startY: number) => void;
  zoom: number;
  showControlPoints?: boolean;
  isEditPathMode?: boolean;
  isPerspectiveMode?: boolean;
  isCurvatureMode?: boolean;
}

const TransformationHandles: React.FC<TransformationHandlesProps> = ({
  element,
  onStartTransform,
  onStartDeform,
  onStartSkew,
  zoom,
  showControlPoints = false,
  isEditPathMode = false,
  isPerspectiveMode = false,
  isCurvatureMode = false
}) => {
  const handleSize = 8 / zoom;
  const handleOffset = handleSize / 2;
  const rotationHandleDistance = 30 / zoom;

  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [currentRotation, setCurrentRotation] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onStartTransform(handle, e.clientX, e.clientY);
  };

  const handleSkewMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (onStartSkew) {
      onStartSkew(handle, e.clientX, e.clientY);
    }
  };

  const handleControlPointMouseDown = (e: React.MouseEvent, pointIndex: number) => {
    e.stopPropagation();
    if (onStartDeform) {
      onStartDeform(pointIndex, e.clientX, e.clientY);
    }
  };

  // Calculate rotation handle position (above the center of the element)
  const rotationHandleX = element.width / 2;
  const rotationHandleY = -rotationHandleDistance;

  // For lines, only show endpoint handles
  if (element.isLine) {
    return (
      <>
        {/* Line endpoints */}
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-pointer hover:bg-blue-600"
          style={{
            left: -handleOffset,
            top: element.height / 2 - handleOffset,
            width: handleSize,
            height: handleSize,
            zIndex: 1000
          }}
          onMouseDown={(e) => handleMouseDown(e, 'line-start')}
          onMouseEnter={() => setHoveredHandle('line-start')}
          onMouseLeave={() => setHoveredHandle(null)}
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-pointer hover:bg-blue-600"
          style={{
            left: element.width - handleOffset,
            top: element.height / 2 - handleOffset,
            width: handleSize,
            height: handleSize,
            zIndex: 1000
          }}
          onMouseDown={(e) => handleMouseDown(e, 'line-end')}
          onMouseEnter={() => setHoveredHandle('line-end')}
          onMouseLeave={() => setHoveredHandle(null)}
        />
      </>
    );
  }

  return (
    <>
      {/* Corner resize handles */}
      {/* Top-left */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-nw-resize hover:bg-blue-100"
        style={{
          left: -handleOffset,
          top: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
        onMouseEnter={() => setHoveredHandle('nw')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Top-right */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-ne-resize hover:bg-blue-100"
        style={{
          left: element.width - handleOffset,
          top: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
        onMouseEnter={() => setHoveredHandle('ne')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Bottom-left */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-sw-resize hover:bg-blue-100"
        style={{
          left: -handleOffset,
          top: element.height - handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
        onMouseEnter={() => setHoveredHandle('sw')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Bottom-right */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-se-resize hover:bg-blue-100"
        style={{
          left: element.width - handleOffset,
          top: element.height - handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'se')}
        onMouseEnter={() => setHoveredHandle('se')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Side resize handles */}
      {/* Top */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-n-resize hover:bg-blue-100"
        style={{
          left: element.width / 2 - handleOffset,
          top: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'n')}
        onMouseEnter={() => setHoveredHandle('n')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Bottom */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-s-resize hover:bg-blue-100"
        style={{
          left: element.width / 2 - handleOffset,
          top: element.height - handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 's')}
        onMouseEnter={() => setHoveredHandle('s')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Left */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-w-resize hover:bg-blue-100"
        style={{
          left: -handleOffset,
          top: element.height / 2 - handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        onMouseEnter={() => setHoveredHandle('w')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Right */}
      <div
        className="absolute bg-white border-2 border-blue-500 rounded cursor-e-resize hover:bg-blue-100"
        style={{
          left: element.width - handleOffset,
          top: element.height / 2 - handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'e')}
        onMouseEnter={() => setHoveredHandle('e')}
        onMouseLeave={() => setHoveredHandle(null)}
      />

      {/* Rotation handle */}
      <div
        className="absolute bg-green-500 border-2 border-white rounded-full cursor-pointer hover:bg-green-600 flex items-center justify-center"
        style={{
          left: rotationHandleX - handleOffset,
          top: rotationHandleY - handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'rotate')}
        onMouseEnter={() => setHoveredHandle('rotate')}
        onMouseLeave={() => setHoveredHandle(null)}
        title="Rotation"
      >
        <div className="w-1 h-3 bg-white rounded-full transform rotate-45" />
      </div>

      {/* Rotation guide line */}
      {hoveredHandle === 'rotate' && (
        <div
          className="absolute border-t border-dashed border-green-500 pointer-events-none"
          style={{
            left: 0,
            top: element.height / 2,
            width: element.width,
            zIndex: 999
          }}
        />
      )}

      {/* Rotation angle display */}
      {(hoveredHandle === 'rotate' || hoveredHandle === 'rotating') && (
        <div
          className="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none"
          style={{
            left: rotationHandleX + 20,
            top: rotationHandleY - 10,
            zIndex: 1001
          }}
        >
          {Math.round(element.rotation || 0)}°
        </div>
      )}

      {/* Skew handles - only for shapes that support skew */}
      {element.type === 'shape' && !element.isCircle && !element.isLine && (
        <>
          {/* Horizontal skew handle (right side) */}
          <div
            className="absolute bg-purple-500 border-2 border-white rounded cursor-pointer hover:bg-purple-600"
            style={{
              left: element.width + 10 / zoom - handleOffset,
              top: element.height / 2 - handleOffset,
              width: handleSize,
              height: handleSize,
              zIndex: 1000
            }}
            onMouseDown={(e) => handleSkewMouseDown(e, 'skew-x')}
            onMouseEnter={() => setHoveredHandle('skew-x')}
            onMouseLeave={() => setHoveredHandle(null)}
            title="Inclinaison horizontale"
          />

          {/* Vertical skew handle (bottom side) */}
          <div
            className="absolute bg-purple-500 border-2 border-white rounded cursor-pointer hover:bg-purple-600"
            style={{
              left: element.width / 2 - handleOffset,
              top: element.height + 10 / zoom - handleOffset,
              width: handleSize,
              height: handleSize,
              zIndex: 1000
            }}
            onMouseDown={(e) => handleSkewMouseDown(e, 'skew-y')}
            onMouseEnter={() => setHoveredHandle('skew-y')}
            onMouseLeave={() => setHoveredHandle(null)}
            title="Inclinaison verticale"
          />
        </>
      )}

      {/* Control points for shape deformation */}
      {showControlPoints && element.type === 'shape' && element.controlPoints && !isPerspectiveMode && element.controlPoints.map((point, index) => (
        <div
          key={`control-point-${index}`}
          className={`absolute border-2 rounded-full cursor-pointer hover:scale-110 transition-transform ${
            isEditPathMode ? 'bg-blue-500 border-white' : 'bg-red-500 border-white hover:bg-red-600'
          }`}
          style={{
            left: point.x - element.x - handleOffset,
            top: point.y - element.y - handleOffset,
            width: handleSize,
            height: handleSize,
            zIndex: 1000
          }}
          onMouseDown={(e) => handleControlPointMouseDown(e, index)}
          title={`Point ${index + 1} - Glissez pour déformer`}
        />
      ))}

      {/* Perspective grid points */}
      {isPerspectiveMode && element.type === 'shape' && (
        <>
          {/* Grid intersection points */}
          {[
            { x: element.width / 3, y: element.height / 3, label: 'Haut-Gauche' },
            { x: (2 * element.width) / 3, y: element.height / 3, label: 'Haut-Droite' },
            { x: (2 * element.width) / 3, y: (2 * element.height) / 3, label: 'Bas-Droite' },
            { x: element.width / 3, y: (2 * element.height) / 3, label: 'Bas-Gauche' }
          ].map((point, index) => (
            <div
              key={`grid-point-${index}`}
              className="absolute bg-orange-500 border-2 border-yellow-300 rounded-full cursor-pointer hover:bg-orange-600 hover:scale-110 transition-transform"
              style={{
                left: point.x - handleOffset,
                top: point.y - handleOffset,
                width: handleSize,
                height: handleSize,
                zIndex: 1000
              }}
              onMouseDown={(e) => handleControlPointMouseDown(e, index)}
              title={`${point.label} - Perspective: glissez pour déformer la grille`}
            />
          ))}
        </>
      )}

      {/* Curvature handles */}
      {isCurvatureMode && element.type === 'shape' && element.curvaturePoints && (
        <>
          {element.curvaturePoints.map((point, index) => {
            let label = '';
            if (element.shapeType === 'rectangle') {
              const labels = ['Haut', 'Droite', 'Bas', 'Gauche'];
              label = labels[index] || `Point ${index + 1}`;
            } else if (element.shapeType === 'triangle') {
              const labels = ['Sommet', 'Bas-Gauche', 'Bas-Droite'];
              label = labels[index] || `Point ${index + 1}`;
            }

            return (
              <div
                key={`curvature-point-${index}`}
                className="absolute bg-pink-500 border-2 border-white rounded-full cursor-pointer hover:bg-pink-600 hover:scale-110 transition-transform"
                style={{
                  left: point.x - element.x - handleOffset,
                  top: point.y - element.y - handleOffset,
                  width: handleSize * 1.2, // Slightly larger for visibility
                  height: handleSize * 1.2,
                  zIndex: 1000
                }}
                onMouseDown={(e) => handleControlPointMouseDown(e, index)}
                title={`${label} - Courbure: glissez pour courber le côté`}
              />
            );
          })}
        </>
      )}

      {/* Path editing mode - show Bezier handles */}
      {isEditPathMode && element.bezierHandles && element.bezierHandles.map((handle, index) => (
        <div
          key={`bezier-handle-${index}`}
          className="absolute bg-yellow-500 border border-white rounded cursor-pointer hover:bg-yellow-600"
          style={{
            left: handle.x - element.x - handleOffset,
            top: handle.y - element.y - handleOffset,
            width: handleSize * 0.8,
            height: handleSize * 0.8,
            zIndex: 1000
          }}
          onMouseDown={(e) => handleControlPointMouseDown(e, index)}
        />
      ))}
    </>
  );
};

export default TransformationHandles;