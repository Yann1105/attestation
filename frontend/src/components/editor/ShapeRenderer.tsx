import React from 'react';
import { TemplateElement } from '../../types';

interface ShapeRendererProps {
  element: TemplateElement;
  isPerspectiveMode?: boolean;
  isCurvatureMode?: boolean;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({ element, isPerspectiveMode = false, isCurvatureMode = false }) => {
  // Build fill style
  const getFillStyle = () => {
    if (element.fillType === 'none') {
      return 'transparent';
    }

    if (element.fillType === 'gradient' && element.fillGradient) {
      const gradient = element.fillGradient;
      if (gradient.type === 'linear') {
        const angle = gradient.angle || 0;
        const colors = gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ');
        return `linear-gradient(${angle}deg, ${colors})`;
      } else if (gradient.type === 'radial') {
        const colors = gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ');
        return `radial-gradient(circle, ${colors})`;
      }
    }

    // Default to solid color
    return element.fillColor || element.backgroundColor || '#cccccc';
  };

  // Build stroke style
  const getStrokeStyle = () => {
    if (!element.strokeColor || element.strokeWidth === 0) {
      return {};
    }

    return {
      borderWidth: `${element.strokeWidth || 1}px`,
      borderColor: element.strokeColor,
      borderStyle: element.strokeStyle || 'solid',
    };
  };

  // Build shadow style
  const getShadowStyle = () => {
    if (!element.shadows || element.shadows.length === 0) {
      return {};
    }

    const shadowStrings = element.shadows.map(shadow => {
      const { color, opacity, blur, distance, angle, spread } = shadow;
      const x = Math.cos((angle - 90) * Math.PI / 180) * distance;
      const y = Math.sin((angle - 90) * Math.PI / 180) * distance;
      const rgba = color.startsWith('#') ? hexToRgba(color, opacity) : color;
      const spreadStr = spread ? ` ${spread}px` : '';
      return `${x}px ${y}px ${blur}px${spreadStr} ${rgba}`;
    });

    return {
      boxShadow: shadowStrings.join(', '),
    };
  };

  // Build filter style
  const getFilterStyle = () => {
    if (!element.filter) return {};
    const { blur = 0, brightness = 100, contrast = 100, grayscale = 0, sepia = 0, hueRotate = 0, saturate = 100 } = element.filter;

    const filters = [];
    if (blur > 0) filters.push(`blur(${blur}px)`);
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
    if (sepia > 0) filters.push(`sepia(${sepia}%)`);
    if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`);

    if (filters.length === 0) return {};
    return { filter: filters.join(' ') };
  };

  // Build border radius style
  const getBorderRadiusStyle = () => {
    if (element.borderRadiusTopLeft !== undefined ||
      element.borderRadiusTopRight !== undefined ||
      element.borderRadiusBottomLeft !== undefined ||
      element.borderRadiusBottomRight !== undefined) {
      return {
        borderTopLeftRadius: `${element.borderRadiusTopLeft || 0}px`,
        borderTopRightRadius: `${element.borderRadiusTopRight || 0}px`,
        borderBottomLeftRadius: `${element.borderRadiusBottomLeft || 0}px`,
        borderBottomRightRadius: `${element.borderRadiusBottomRight || 0}px`,
      };
    }

    return {
      borderRadius: `${element.borderRadius || 0}px`,
    };
  };

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Helper function to check if a point is inside a quadrilateral
  const isPointInQuad = (px: number, py: number, points: { x: number; y: number }[]): boolean => {
    if (points.length < 4) return false;

    // Use ray casting algorithm for quadrilateral
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;

      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Render pixel-based shape for perspective mode
  const renderPixelShape = () => {
    if (!element.controlPoints || element.controlPoints.length < 4) {
      return (
        <div
          className="w-full h-full"
          style={combinedStyle}
        />
      );
    }

    const pixelSize = 4; // Size of each pixel
    const width = Math.ceil(element.width / pixelSize);
    const height = Math.ceil(element.height / pixelSize);

    const pixels = [];

    // Create pixel grid
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelX = x * pixelSize;
        const pixelY = y * pixelSize;

        // Check if this pixel center is inside the shape
        const isInside = isPointInQuad(pixelX + pixelSize / 2, pixelY + pixelSize / 2, element.controlPoints);

        // Check if this pixel is on a grid line
        const gridLineWidth = 2; // Thickness of grid lines in pixels
        const isOnGridLine =
          (Math.abs(pixelX + pixelSize / 2 - element.width / 3) < gridLineWidth && pixelX + pixelSize / 2 <= element.width) ||
          (Math.abs(pixelX + pixelSize / 2 - (2 * element.width) / 3) < gridLineWidth && pixelX + pixelSize / 2 <= element.width) ||
          (Math.abs(pixelY + pixelSize / 2 - element.height / 3) < gridLineWidth && pixelY + pixelSize / 2 <= element.height) ||
          (Math.abs(pixelY + pixelSize / 2 - (2 * element.height) / 3) < gridLineWidth && pixelY + pixelSize / 2 <= element.height);

        pixels.push(
          <div
            key={`pixel-${x}-${y}`}
            className="absolute border border-gray-400"
            style={{
              left: pixelX,
              top: pixelY,
              width: pixelSize,
              height: pixelSize,
              backgroundColor: isInside
                ? (isOnGridLine ? '#ff6b35' : (element.fillColor || element.backgroundColor || '#cccccc'))
                : 'transparent',
              opacity: isInside ? (element.fillOpacity !== undefined ? element.fillOpacity : 1) : 0.3,
            }}
          />
        );
      }
    }

    return (
      <div className="relative w-full h-full overflow-hidden bg-gray-100">
        {pixels}
      </div>
    );
  };

  const combinedStyle = {
    width: '100%',
    height: '100%',
    background: getFillStyle(),
    opacity: element.fillOpacity !== undefined ? element.fillOpacity : 1,
    ...getStrokeStyle(),
    ...getShadowStyle(),
    ...getBorderRadiusStyle(),
    ...getFilterStyle(),
  };

  // Render pixel-based shape in perspective mode
  if (isPerspectiveMode && element.controlPoints && element.controlPoints.length >= 4) {
    return renderPixelShape();
  }

  // Render curved shape in curvature mode
  if (isCurvatureMode && element.curvaturePoints && element.pathData) {
    return (
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${element.width} ${element.height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        <defs>
          {element.fillType === 'gradient' && element.fillGradient && (
            <linearGradient
              id={`gradient-${element.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              gradientTransform={`rotate(${element.fillGradient.angle || 0})`}
            >
              {element.fillGradient.colors.map((color, index) => (
                <stop
                  key={index}
                  offset={`${color.position}%`}
                  stopColor={color.color}
                />
              ))}
            </linearGradient>
          )}
        </defs>
        <path
          d={element.pathData}
          fill={element.fillType === 'gradient' && element.fillGradient
            ? `url(#gradient-${element.id})`
            : element.fillType === 'none'
              ? 'transparent'
              : element.fillColor || element.backgroundColor || '#cccccc'
          }
          fillOpacity={element.fillOpacity !== undefined ? element.fillOpacity : 1}
          stroke={element.strokeColor}
          strokeWidth={element.strokeWidth}
          strokeDasharray={element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : undefined}
          style={getShadowStyle()}
        />
      </svg>
    );
  }

  if (element.shapeType === 'circle') {
    return (
      <div
        className="w-full h-full rounded-full"
        style={combinedStyle}
      />
    );
  } else if (element.shapeType === 'ellipse') {
    return (
      <div
        className="w-full h-full"
        style={{
          ...combinedStyle,
          borderRadius: '50%',
        }}
      />
    );
  } else if (element.pathData) {
    return (
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${element.width} ${element.height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        <defs>
          {element.fillType === 'gradient' && element.fillGradient && (
            <linearGradient
              id={`gradient-${element.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              gradientTransform={`rotate(${element.fillGradient.angle || 0})`}
            >
              {element.fillGradient.colors.map((color, index) => (
                <stop
                  key={index}
                  offset={`${color.position}%`}
                  stopColor={color.color}
                />
              ))}
            </linearGradient>
          )}
        </defs>
        <path
          d={element.pathData}
          fill={element.fillType === 'gradient' && element.fillGradient
            ? `url(#gradient-${element.id})`
            : element.fillType === 'none'
              ? 'transparent'
              : element.fillColor || element.backgroundColor || '#cccccc'
          }
          fillOpacity={element.fillOpacity !== undefined ? element.fillOpacity : 1}
          stroke={element.strokeColor}
          strokeWidth={element.strokeWidth}
          strokeDasharray={element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : undefined}
          style={getShadowStyle()}
        />
      </svg>
    );
  } else {
    return (
      <div
        className="w-full h-full"
        style={combinedStyle}
      />
    );
  }
};

export default ShapeRenderer;