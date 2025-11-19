import React, { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { Stage, Layer, Rect, Text, Image, Circle, Line, Transformer } from 'react-konva';
import Konva from 'konva';
import { useEditorStore, CanvasElement } from '../../store/editorStore';

interface CanvasStageProps {
  width: number;
  height: number;
}

export interface CanvasStageRef {
  getCanvas: () => HTMLCanvasElement | null;
}

const CanvasStage = forwardRef<CanvasStageRef, CanvasStageProps>(({ width, height }, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    elements,
    selectedElementId,
    zoom,
    showGrid,
    backgroundColor,
    selectElement,
    updateElement,
    setZoom
  } = useEditorStore();

  // Handle element selection
  const handleElementClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, element: CanvasElement) => {
    e.cancelBubble = true;
    selectElement(element.id);

    // Attach transformer to selected element
    if (transformerRef.current) {
      const stage = stageRef.current;
      if (stage) {
        const selectedNode = stage.findOne(`#${element.id}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    }
  }, [selectElement]);

  // Handle stage click (deselect)
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectElement]);

  // Handle element drag end
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, element: CanvasElement) => {
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  }, [updateElement]);

  // Handle element transform end
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, element: CanvasElement) => {
    const node = e.target;
    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation()
    });
  }, [updateElement]);

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 20;
    const lines = [];

    // Vertical lines
    for (let i = 0; i < width / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, height]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i < height / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, width, i * gridSize]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }

    return lines;
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getCanvas: () => {
      if (stageRef.current) {
        return stageRef.current.toCanvas();
      }
      return null;
    }
  }));

  // Render element based on type
  const renderElement = (element: CanvasElement) => {
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible,
      draggable: element.locked ? false : true,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleElementClick(e, element),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, element),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, element),
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            {...commonProps}
            text={element.text || 'Text'}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || 'Arial'}
            fontStyle={element.fontStyle || ''}
            fill={element.fill || '#000000'}
            width={element.width}
            align={element.textAlign || 'left'}
          />
        );

      case 'rectangle':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            width={element.width || 100}
            height={element.height || 100}
            fill={element.backgroundColor || '#3b82f6'}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );

      case 'circle':
        return (
          <Circle
            key={element.id}
            {...commonProps}
            radius={(element.width || 50) / 2}
            fill={element.backgroundColor || '#3b82f6'}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );

      case 'image':
        if (!element.imageUrl) return null;
        return (
          <Image
            key={element.id}
            {...commonProps}
            image={(() => {
              const img = new window.Image();
              img.src = element.imageUrl!;
              return img;
            })()}
            width={element.width}
            height={element.height}
          />
        );

      case 'line':
        return (
          <Line
            key={element.id}
            {...commonProps}
            points={[0, 0, element.width || 100, 0]}
            stroke={element.stroke || '#000000'}
            strokeWidth={element.strokeWidth || 2}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div
        className="overflow-auto"
        style={{
          maxWidth: '100%',
          maxHeight: '600px', // Limite la hauteur pour forcer le scroll
        }}
      >
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scaleX={zoom / 100}
          scaleY={zoom / 100}
          onClick={handleStageClick}
          style={{
            display: 'block',
            margin: '0 auto',
          }}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={backgroundColor}
            />

            {/* Grid */}
            {renderGrid()}

            {/* Elements */}
            {elements.map(renderElement)}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CanvasStage;