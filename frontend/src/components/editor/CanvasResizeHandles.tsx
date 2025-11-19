import React from 'react';

interface CanvasResizeHandlesProps {
  onResizeStart: (handle: string, startX: number, startY: number) => void;
  onResize: (deltaX: number, deltaY: number, handle: string) => void;
  onResizeEnd: () => void;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

const CanvasResizeHandles: React.FC<CanvasResizeHandlesProps> = ({
  onResizeStart,
  onResize,
  onResizeEnd,
  canvasWidth,
  canvasHeight,
  zoom
}) => {
  const handleSize = 8 / zoom; // Adjust handle size based on zoom
  const handleOffset = handleSize / 2;

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onResizeStart(handle, e.clientX, e.clientY);
  };

  return (
    <>
      {/* Corner resize handles */}
      {/* Top-left */}
      <div
        className="absolute bg-blue-500 border border-white rounded-full cursor-nw-resize hover:bg-blue-600"
        style={{
          left: -handleOffset,
          top: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
      />

      {/* Top-right */}
      <div
        className="absolute bg-blue-500 border border-white rounded-full cursor-ne-resize hover:bg-blue-600"
        style={{
          right: -handleOffset,
          top: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
      />

      {/* Bottom-left */}
      <div
        className="absolute bg-blue-500 border border-white rounded-full cursor-sw-resize hover:bg-blue-600"
        style={{
          left: -handleOffset,
          bottom: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
      />

      {/* Bottom-right */}
      <div
        className="absolute bg-blue-500 border border-white rounded-full cursor-se-resize hover:bg-blue-600"
        style={{
          right: -handleOffset,
          bottom: -handleOffset,
          width: handleSize,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'se')}
      />

      {/* Edge resize handles */}
      {/* Top */}
      <div
        className="absolute bg-blue-500 border border-white cursor-n-resize hover:bg-blue-600"
        style={{
          left: handleOffset,
          top: -handleOffset,
          right: handleOffset,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'n')}
      />

      {/* Bottom */}
      <div
        className="absolute bg-blue-500 border border-white cursor-s-resize hover:bg-blue-600"
        style={{
          left: handleOffset,
          bottom: -handleOffset,
          right: handleOffset,
          height: handleSize,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 's')}
      />

      {/* Left */}
      <div
        className="absolute bg-blue-500 border border-white cursor-w-resize hover:bg-blue-600"
        style={{
          left: -handleOffset,
          top: handleOffset,
          width: handleSize,
          bottom: handleOffset,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'w')}
      />

      {/* Right */}
      <div
        className="absolute bg-blue-500 border border-white cursor-e-resize hover:bg-blue-600"
        style={{
          right: -handleOffset,
          top: handleOffset,
          width: handleSize,
          bottom: handleOffset,
          zIndex: 1000
        }}
        onMouseDown={(e) => handleMouseDown(e, 'e')}
      />
    </>
  );
};

export default CanvasResizeHandles;