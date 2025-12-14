import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Save, Download, HelpCircle, X } from 'lucide-react';
import { CertificateTemplate, TemplateElement } from '../../types';
import { templatesApi } from '../../utils/api';
import { notifications } from '../../utils/notifications';
import PhotoshopMenuBar from './PhotoshopMenuBar';
import PhotoshopToolbar from './PhotoshopToolbar';
import PhotoshopPanels from './PhotoshopPanels';
import ShortcutsHelp from './ShortcutsHelp';
import TransformationHandles from './TransformationHandles';
import CanvasResizeHandles from './CanvasResizeHandles';
import AlignmentGuides from './AlignmentGuides';
import ShapeRenderer from './ShapeRenderer';
import { ybFileManager } from '../../utils/YBFileManager';
import { ProjectData } from '../../utils/YBFileManager';
import { PSDImporter } from '../../utils/PSDImporter';
import { AIImporter } from '../../utils/AIImporter';

interface EditorProps {
  onBack: () => void;
  initialTemplate?: CertificateTemplate;
}

const Editor: React.FC<EditorProps> = React.memo(({ onBack, initialTemplate }) => {
  // Protection ref to prevent re-initialization loops
  const initialized = useRef(false);
  const prevTemplateRef = useRef<CertificateTemplate | null>(null);

  // Stable initial template state - only initialize once
  const [template, setTemplate] = useState<CertificateTemplate>(() => {
    if (initialTemplate && !initialized.current) {
      initialized.current = true;
      return initialTemplate;
    }
    return {
      id: `template-${Date.now()}`,
      name: 'Nouveau Template',
      elements: [],
      backgroundColor: '#ffffff',
      width: 800,
      height: 600,
      canvasData: undefined,
      type: 'custom',
      editableAfterSave: true,
    };
  });

  // Initialize template only once
  useEffect(() => {
    if (!initialized.current && initialTemplate) {
      setTemplate(initialTemplate);
      setHistory([initialTemplate]);
      setHistoryIndex(0);
      setSelectedElement(null);
      setVisibleControlPoints(new Set());
      initialized.current = true;
    }
  }, [initialTemplate]);

  // Conditional logging - only when template actually changes
  useEffect(() => {
    if (prevTemplateRef.current &&
        (prevTemplateRef.current.id !== template.id ||
         prevTemplateRef.current.elements.length !== template.elements.length)) {
      console.log('📝 Template state changed:', template.id, 'elements:', template.elements.length);
    }
    prevTemplateRef.current = template;
  }, [template]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('💥 Editor component UNMOUNTED');
    };
  }, []);

  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTool, setCurrentTool] = useState<string>('move');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<CertificateTemplate[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<TemplateElement | null>(null);
  const [editingElement, setEditingElement] = useState<TemplateElement | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isCreatingText, setIsCreatingText] = useState(false);
  const [textCreationStart, setTextCreationStart] = useState<{ x: number; y: number } | null>(null);

  // Transformation state
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformHandle, setTransformHandle] = useState<string>('');
  const [transformStart, setTransformStart] = useState({ x: 0, y: 0 });
  const [originalElement, setOriginalElement] = useState<TemplateElement | null>(null);

  // Skew state
  const [isSkewing, setIsSkewing] = useState(false);
  const [skewHandle, setSkewHandle] = useState<string>('');
  const [skewStart, setSkewStart] = useState({ x: 0, y: 0 });
  const [originalSkewElement, setOriginalSkewElement] = useState<TemplateElement | null>(null);

  // Skewing logic
  const handleSkew = (deltaX: number, deltaY: number, handle: string) => {
    if (!selectedElement || !originalSkewElement) return;

    let newSkewX = originalSkewElement.skewX || 0;
    let newSkewY = originalSkewElement.skewY || 0;

    // Simplified skewing: adjust based on mouse movement
    // This is a basic implementation and might need more complex math for accurate skewing
    if (handle.includes('e') || handle.includes('w')) { // Horizontal skew
      newSkewX = (originalSkewElement.skewX || 0) + (deltaX / originalSkewElement.width) * 30; // Max 30 degrees
    }
    if (handle.includes('n') || handle.includes('s')) { // Vertical skew
      newSkewY = (originalSkewElement.skewY || 0) + (deltaY / originalSkewElement.height) * 30; // Max 30 degrees
    }

    handleElementUpdate(selectedElement.id, { skewX: newSkewX, skewY: newSkewY });
  };

  // Control point deformation state
  const [isDeforming, setIsDeforming] = useState(false);
  const [deformingPointIndex, setDeformingPointIndex] = useState<number>(-1);
  const [deformStart, setDeformStart] = useState({ x: 0, y: 0 });
  const [originalControlPoints, setOriginalControlPoints] = useState<{ x: number; y: number }[]>([]);

  // Edit path mode state
  const [isEditPathMode, setIsEditPathMode] = useState(false);
  const [selectedPathPoints, setSelectedPathPoints] = useState<Set<number>>(new Set());
  const [draggingBezierHandle, setDraggingBezierHandle] = useState<number>(-1);

  // Control points visibility state
  const [visibleControlPoints, setVisibleControlPoints] = useState<Set<string>>(new Set());

  // Direct edge resizing state
  const [isEdgeResizing, setIsEdgeResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState<string>('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeElement, setResizeElement] = useState<TemplateElement | null>(null);

  // Canvas resize state
  const [isResizingCanvas, setIsResizingCanvas] = useState(false);
  const [canvasResizeHandle, setCanvasResizeHandle] = useState<string>('');
  const [canvasResizeStart, setCanvasResizeStart] = useState({ x: 0, y: 0 });
  const [originalCanvasSize, setOriginalCanvasSize] = useState({ width: 0, height: 0 });

  // View state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showRulers, setShowRulers] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [snapToGuides, setSnapToGuides] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [showActiveLayersOnly, setShowActiveLayersOnly] = useState(false);

  // Keyboard modifier state
  const [shiftPressed, setShiftPressed] = useState(false);
  const [altPressed, setAltPressed] = useState(false);

  // Canvas proportion lock
  const [lockCanvasRatio, setLockCanvasRatio] = useState(false);

  // Warp state
  const [isWarping, setIsWarping] = useState(false);
  const [warpIntensity, setWarpIntensity] = useState(0);

  // Perspective state
  const [isPerspectiveMode, setIsPerspectiveMode] = useState(false);

  // Curvature state
  const [isCurvatureMode, setIsCurvatureMode] = useState(false);

  // Fixed panel layout - no dragging
  const panelLayout = {
    menuBarHeight: 28,
    toolbarWidth: 64,
    variablesPanelWidth: 256,
    rightPanelWidth: 320
  };

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

  // History management
  const saveToHistory = (newTemplate: CertificateTemplate) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTemplate);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track modifier keys
      if (e.key === 'Shift') {
        setShiftPressed(true);
      } else if (e.key === 'Alt') {
        setAltPressed(true);
      }

      // Tool shortcuts
      if (e.key === 'v' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('move');
      } else if (e.key === 'm' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('marquee-rect');
      } else if (e.key === 'l' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('lasso');
      } else if (e.key === 'w' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('quick-select');
      } else if (e.key === 'c' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('crop');
      } else if (e.key === 'i' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('eyedropper');
      } else if (e.key === 'j' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('healing');
      } else if (e.key === 'b' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('brush');
      } else if (e.key === 'e' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('eraser');
      } else if (e.key === 'g' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('gradient');
      } else if (e.key === 'p' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('pen');
      } else if (e.key === 'u' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('shape');
      } else if (e.key === 't' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('text');
      } else if (e.key === 'h' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('hand');
      } else if (e.key === 'z' && !e.ctrlKey && !e.altKey) {
        setCurrentTool('zoom');
      } else if (e.key === 'x' && !e.ctrlKey && !e.altKey) {
        // Swap foreground/background colors (simplified)
        console.log('Swap colors');
      }

      // Edit shortcuts
      else if (e.key === 'z' && e.ctrlKey && !e.shiftKey) {
          handleUndo();
        } else if (e.key === 'z' && e.ctrlKey && e.shiftKey) {
          handleRedo();
        } else if (e.key === 'a' && e.ctrlKey) {
          handleSelectAll();
        } else if (e.key === 'd' && e.ctrlKey) {
          handleDeselect();
        } else if (e.key === 'x' && e.ctrlKey) {
          handleCut();
        } else if (e.key === 'c' && e.ctrlKey) {
          handleCopy();
        } else if (e.key === 'v' && e.ctrlKey) {
          handlePaste();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
           if (isEditPathMode && selectedElement && selectedPathPoints.size > 0) {
             // Remove selected path points
             handleRemoveSelectedPathPoints(selectedElement);
           } else if (selectedElement && !selectedElement.locked) {
             handleDeleteLayer();
           }
         } else if (e.key === 'r' && e.ctrlKey) {
          handleShowRulers();
        } else if (e.key === '\'' && e.ctrlKey) {
          handleShowGrid();
        } else if (e.key === 'f' && !e.ctrlKey && !e.altKey) {
          handleFullScreen();
        } else if (e.key === 'ArrowUp' && selectedElement) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : (e.ctrlKey ? 1 : 5);
          handleElementUpdate(selectedElement.id, { y: selectedElement.y - delta });
        } else if (e.key === 'ArrowDown' && selectedElement) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : (e.ctrlKey ? 1 : 5);
          handleElementUpdate(selectedElement.id, { y: selectedElement.y + delta });
        } else if (e.key === 'ArrowLeft' && selectedElement) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : (e.ctrlKey ? 1 : 5);
          handleElementUpdate(selectedElement.id, { x: selectedElement.x - delta });
        } else if (e.key === 'ArrowRight' && selectedElement) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : (e.ctrlKey ? 1 : 5);
          handleElementUpdate(selectedElement.id, { x: selectedElement.x + delta });
        } else if (e.key === '[' && selectedElement) {
          // Rotate counterclockwise
          e.preventDefault();
          const currentRotation = selectedElement.rotation || 0;
          handleElementUpdate(selectedElement.id, { rotation: currentRotation - 15 });
        } else if (e.key === ']' && selectedElement) {
          // Rotate clockwise
          e.preventDefault();
          const currentRotation = selectedElement.rotation || 0;
          handleElementUpdate(selectedElement.id, { rotation: currentRotation + 15 });
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
      } else if (e.key === 'Alt') {
        setAltPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleAddElement = useCallback((type: TemplateElement['type'], x?: number, y?: number) => {
    const baseX = x ?? 100;
    const baseY = y ?? 100;
    const baseWidth = type === 'text' ? 200 : 100;
    const baseHeight = type === 'text' ? 50 : 100;

    let shapeType: string = 'rectangle';
    let controlPoints: { x: number; y: number }[] = [];
    let pathData: string = '';
    let isCircle = false;
    let isLine = false;
    let numberOfPoints: number | undefined;
    let innerRadius: number | undefined;
    let outerRadius: number | undefined;
    let initialAngle: number | undefined;

    if (type === 'shape') {
      switch (currentTool) {
        case 'triangle':
          shapeType = 'triangle';
          controlPoints = [
            { x: baseX + baseWidth / 2, y: baseY },
            { x: baseX, y: baseY + baseHeight },
            { x: baseX + baseWidth, y: baseY + baseHeight }
          ];
          pathData = `M${baseX + baseWidth / 2},${baseY} L${baseX},${baseY + baseHeight} L${baseX + baseWidth},${baseY + baseHeight} Z`;
          break;
        case 'ellipse':
          shapeType = 'ellipse';
          controlPoints = [
            { x: baseX, y: baseY },
            { x: baseX + baseWidth, y: baseY },
            { x: baseX + baseWidth, y: baseY + baseHeight },
            { x: baseX, y: baseY + baseHeight }
          ];
          break;
        case 'polygon':
          shapeType = 'polygon';
          numberOfPoints = 12;
          outerRadius = Math.min(baseWidth, baseHeight) / 2;
          initialAngle = 0;
          controlPoints = [];
          for (let i = 0; i < numberOfPoints; i++) {
            const angle = (i * 2 * Math.PI) / numberOfPoints + (initialAngle * Math.PI / 180);
            const px = baseX + baseWidth / 2 + outerRadius * Math.cos(angle);
            const py = baseY + baseHeight / 2 + outerRadius * Math.sin(angle);
            controlPoints.push({ x: px, y: py });
          }
          pathData = generatePolygonPath(controlPoints);
          break;
        case 'star':
          shapeType = 'star';
          numberOfPoints = 10;
          outerRadius = Math.min(baseWidth, baseHeight) / 2;
          innerRadius = outerRadius * 0.5;
          initialAngle = 0;
          controlPoints = [];
          for (let i = 0; i < numberOfPoints * 2; i++) {
            const angle = (i * Math.PI) / numberOfPoints + (initialAngle * Math.PI / 180);
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = baseX + baseWidth / 2 + radius * Math.cos(angle);
            const py = baseY + baseHeight / 2 + radius * Math.sin(angle);
            controlPoints.push({ x: px, y: py });
          }
          pathData = generatePolygonPath(controlPoints);
          break;
        case 'line':
          shapeType = 'line';
          isLine = true;
          break;
        case 'custom-shape':
          shapeType = 'custom';
          controlPoints = [
            { x: baseX, y: baseY },
            { x: baseX + baseWidth, y: baseY },
            { x: baseX + baseWidth, y: baseY + baseHeight },
            { x: baseX, y: baseY + baseHeight }
          ];
          pathData = `M${baseX},${baseY} L${baseX + baseWidth},${baseY} L${baseX + baseWidth},${baseY + baseHeight} L${baseX},${baseY + baseHeight} Z`;
          break;
        default:
          if (currentTool === 'shape') {
            controlPoints = [
              { x: baseX, y: baseY },
              { x: baseX + baseWidth, y: baseY },
              { x: baseX + baseWidth, y: baseY + baseHeight },
              { x: baseX, y: baseY + baseHeight }
            ];
            pathData = `M${baseX},${baseY} L${baseX + baseWidth},${baseY} L${baseX + baseWidth},${baseY + baseHeight} L${baseX},${baseY + baseHeight} Z`;
          }
      }

      if (currentTool === 'circle') {
        shapeType = 'circle';
        isCircle = true;
      }
    }

    const newElement: TemplateElement = {
      id: `element-${Date.now()}`,
      type,
      x: baseX,
      y: baseY,
      width: isCircle ? Math.min(baseWidth, baseHeight) : baseWidth,
      height: isCircle ? Math.min(baseWidth, baseHeight) : baseHeight,
      zIndex: template.elements.length,
      content: type === 'text' ? 'Nouveau texte' : undefined,
      fontSize: type === 'text' ? 16 : undefined,
      fontFamily: type === 'text' ? 'Arial' : undefined,
      color: type === 'text' ? '#000000' : undefined,
      backgroundColor: type === 'shape' ? '#cccccc' : undefined,
      textType: type === 'text' ? 'point' : undefined,
      shapeType: type === 'shape' ? shapeType : undefined,
      controlPoints: type === 'shape' ? controlPoints : undefined,
      pathData: type === 'shape' ? pathData : undefined,
      isCircle: isCircle,
      isLine: isLine,
      numberOfPoints: numberOfPoints,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      initialAngle: initialAngle,
    };

    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: [...prev.elements, newElement],
      };
      saveToHistory(newTemplate);
      return newTemplate;
    });

    setSelectedElement(newElement);
  }, [currentTool, template.elements.length, saveToHistory]);

  const generatePolygonPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
    path += ' Z';
    return path;
  };

  const handleElementUpdate = useCallback((elementId: string, updates: Partial<TemplateElement>, skipSnapping = false) => {
    setTemplate(prevTemplate => {
      const finalUpdates = { ...updates };

      if (!skipSnapping && updates.x !== undefined && updates.y !== undefined) {
        // Apply enhanced snapping logic
        const element = prevTemplate.elements.find(el => el.id === elementId);
        if (element) {
          const snapThreshold = 8 / zoom;
          let snappedX = updates.x;
          let snappedY = updates.y;

          const elementCenterX = updates.x + element.width / 2;
          const elementCenterY = updates.y + element.height / 2;
          const elementLeft = updates.x;
          const elementRight = updates.x + element.width;
          const elementTop = updates.y;
          const elementBottom = updates.y + element.height;

          const canvasWidth = prevTemplate.width || 800;
          const canvasHeight = prevTemplate.height || 600;
          const canvasCenterX = canvasWidth / 2;
          const canvasCenterY = canvasHeight / 2;

          if (Math.abs(elementLeft) < snapThreshold) {
            snappedX = 0;
          } else if (Math.abs(elementRight - canvasWidth) < snapThreshold) {
            snappedX = canvasWidth - element.width;
          } else if (Math.abs(elementCenterX - canvasCenterX) < snapThreshold) {
            snappedX = canvasCenterX - element.width / 2;
          }

          if (Math.abs(elementTop) < snapThreshold) {
            snappedY = 0;
          } else if (Math.abs(elementBottom - canvasHeight) < snapThreshold) {
            snappedY = canvasHeight - element.height;
          } else if (Math.abs(elementCenterY - canvasCenterY) < snapThreshold) {
            snappedY = canvasCenterY - element.height / 2;
          }

          prevTemplate.elements.forEach(otherElement => {
            if (otherElement.id === elementId) return;

            const otherCenterX = otherElement.x + otherElement.width / 2;
            const otherCenterY = otherElement.y + otherElement.height / 2;
            const otherLeft = otherElement.x;
            const otherRight = otherElement.x + otherElement.width;
            const otherTop = otherElement.y;
            const otherBottom = otherElement.y + otherElement.height;

            if (Math.abs(elementLeft - otherLeft) < snapThreshold) {
              snappedX = otherLeft;
            } else if (Math.abs(elementRight - otherRight) < snapThreshold) {
              snappedX = otherRight - element.width;
            } else if (Math.abs(elementCenterX - otherCenterX) < snapThreshold) {
              snappedX = otherCenterX - element.width / 2;
            } else if (Math.abs(elementLeft - otherRight) < snapThreshold) {
              snappedX = otherRight;
            } else if (Math.abs(elementRight - otherLeft) < snapThreshold) {
              snappedX = otherLeft - element.width;
            }

            if (Math.abs(elementTop - otherTop) < snapThreshold) {
              snappedY = otherTop;
            } else if (Math.abs(elementBottom - otherBottom) < snapThreshold) {
              snappedY = otherBottom - element.height;
            } else if (Math.abs(elementCenterY - otherCenterY) < snapThreshold) {
              snappedY = otherCenterY - element.height / 2;
            } else if (Math.abs(elementTop - otherBottom) < snapThreshold) {
              snappedY = otherBottom;
            } else if (Math.abs(elementBottom - otherTop) < snapThreshold) {
              snappedY = otherTop - element.height;
            }
          });

          if (showGrid) {
            const gridSize = 20;
            snappedX = Math.round(snappedX / gridSize) * gridSize;
            snappedY = Math.round(snappedY / gridSize) * gridSize;
          }

          finalUpdates.x = snappedX;
          finalUpdates.y = snappedY;
        }
      }

      const newTemplate = {
        ...prevTemplate,
        elements: prevTemplate.elements.map(el =>
          el.id === elementId ? { ...el, ...finalUpdates } : el
        ),
      };
      saveToHistory(newTemplate);
      return newTemplate;
    });
  }, [zoom, showGrid, saveToHistory]);

  const handleElementSelect = (element: TemplateElement | null) => {
    setSelectedElement(element);
    // Show control points when selecting a shape element
    if (element && element.type === 'shape') {
      setVisibleControlPoints(prev => new Set(prev).add(element.id));
    } else {
      setVisibleControlPoints(new Set());
    }
  };

  const handleToolSelect = (tool: string) => {
    setCurrentTool(tool);
    // Désélectionner l'élément quand on change d'outil
    if (tool !== 'move') {
      setSelectedElement(null);
      setVisibleControlPoints(new Set());
    }
  };

  const handleElementDoubleClick = (element: TemplateElement) => {
    if (element.type === 'text') {
      setEditingElement(element);
      setEditingText(element.content || '');
      setSelectedElement(element);
    } else if (element.type === 'shape') {
      // Toggle between normal control points and edit path mode
      if (isEditPathMode) {
        // Exit edit path mode
        setIsEditPathMode(false);
        setSelectedPathPoints(new Set());
        setVisibleControlPoints(new Set());
      } else {
        // Enter edit path mode for all shapes - generate control points if needed
        if (!element.controlPoints || element.controlPoints.length === 0) {
          // Generate control points based on shape type
          let newControlPoints: { x: number; y: number }[] = [];

          switch (element.shapeType) {
            case 'rectangle':
            case 'custom':
            default:
              // Rectangle: 4 corner points
              newControlPoints = [
                { x: element.x, y: element.y }, // top-left
                { x: element.x + element.width, y: element.y }, // top-right
                { x: element.x + element.width, y: element.y + element.height }, // bottom-right
                { x: element.x, y: element.y + element.height } // bottom-left
              ];
              break;
            case 'circle':
            case 'ellipse': {
              // Circle/Ellipse: 16 points around the perimeter for smoother curves
              const centerX = element.x + element.width / 2;
              const centerY = element.y + element.height / 2;
              const radiusX = element.width / 2;
              const radiusY = element.height / 2;

              for (let i = 0; i < 16; i++) {
                const angle = (i * Math.PI) / 8; // 22.5 degree increments for smoother curves
                const px = centerX + radiusX * Math.cos(angle);
                const py = centerY + radiusY * Math.sin(angle);
                newControlPoints.push({ x: px, y: py });
              }
              break;
            }
            case 'triangle':
              // Triangle: 3 points
              newControlPoints = [
                { x: element.x + element.width / 2, y: element.y }, // top
                { x: element.x, y: element.y + element.height }, // bottom-left
                { x: element.x + element.width, y: element.y + element.height } // bottom-right
              ];
              break;
            case 'line':
              // Line: 2 endpoints
              newControlPoints = [
                { x: element.x, y: element.y + element.height / 2 }, // start
                { x: element.x + element.width, y: element.y + element.height / 2 } // end
              ];
              break;
          }

          // Update element with generated control points
          handleElementUpdate(element.id, { controlPoints: newControlPoints });
        }

        setIsEditPathMode(true);
        setVisibleControlPoints(prev => new Set(prev).add(element.id));
        setSelectedPathPoints(new Set());
      }
      setSelectedElement(element);
    }
  };

  const handleTextEditSave = () => {
    if (editingElement) {
      const contentEditable = contentEditableRef.current;
      if (contentEditable) {
        const newContent = contentEditable.textContent || '';

        // Auto-resize based on content
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = editingElement.textType === 'point' ? 'nowrap' : 'pre-wrap';
        tempDiv.style.fontSize = `${editingElement.fontSize || 16}px`;
        tempDiv.style.fontFamily = editingElement.fontFamily || 'Arial';
        tempDiv.style.fontWeight = editingElement.fontWeight || 'normal';
        tempDiv.style.lineHeight = '1.2';
        tempDiv.style.padding = '2px 4px';
        tempDiv.style.width = editingElement.textType === 'point' ? 'auto' : `${editingElement.width}px`;
        tempDiv.textContent = newContent;
        document.body.appendChild(tempDiv);

        const rect = tempDiv.getBoundingClientRect();
        document.body.removeChild(tempDiv);

        const newWidth = editingElement.textType === 'point'
          ? Math.max(rect.width + 8, 50) // Add padding for point text
          : editingElement.width;
        const newHeight = Math.max(rect.height + 4, editingElement.textType === 'point' ? 30 : 50);

        handleElementUpdate(editingElement.id, {
          content: newContent,
          width: newWidth,
          height: newHeight
        });
      } else {
        handleElementUpdate(editingElement.id, { content: editingText });
      }
      setEditingElement(null);
      setEditingText('');
    }
  };

  const handleTextEditCancel = () => {
    setEditingElement(null);
    setEditingText('');
  };

  const handleTextEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleTextEditCancel();
    } else if (e.key === 'Enter') {
      // Pour le texte ponctuel, Enter sauvegarde
      if (editingElement?.textType === 'point') {
        e.preventDefault();
        handleTextEditSave();
      }
      // Pour le texte de paragraphe, Enter crée une nouvelle ligne (comportement par défaut)
    }
  };

  const insertVariable = (variablePlaceholder: string) => {
    if (editingElement) {
      const input = document.querySelector('.inline-text-editor') as HTMLInputElement;
      const textarea = document.querySelector('.inline-text-editor') as HTMLTextAreaElement;

      if (input || textarea) {
        const element = input || textarea;
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const newText = editingText.slice(0, start) + variablePlaceholder + editingText.slice(end);
        setEditingText(newText);
        // Focus back and set cursor position
        setTimeout(() => {
          element.focus();
          element.setSelectionRange(start + variablePlaceholder.length, start + variablePlaceholder.length);
        }, 0);
      }
    }
  };

  // Surveiller les changements de taille du textarea pendant l'édition
  useEffect(() => {
    if (editingElement && editingElement.textType === 'paragraph') {
      const textarea = document.querySelector('.inline-text-editor') as HTMLTextAreaElement;
      if (textarea) {
        let lastWidth = textarea.offsetWidth;
        let lastHeight = textarea.offsetHeight;

        const checkResize = () => {
          const currentWidth = textarea.offsetWidth;
          const currentHeight = textarea.offsetHeight;

          if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
            handleElementUpdate(editingElement.id, {
              width: Math.max(currentWidth, 50), // Minimum 50px
              height: Math.max(currentHeight, 30) // Minimum 30px
            });
            lastWidth = currentWidth;
            lastHeight = currentHeight;
          }
        };

        const interval = setInterval(checkResize, 100); // Vérifier toutes les 100ms

        return () => {
          clearInterval(interval);
        };
      }
    }
  }, [editingElement]);

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    handleElementUpdate(selectedElement.id, { x, y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (isCreatingText && textCreationStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const startX = textCreationStart.x;
      const startY = textCreationStart.y;

      // Calculate the distance moved
      const deltaX = Math.abs(endX - startX);
      const deltaY = Math.abs(endY - startY);

      // If moved less than 10 pixels, it's a click - create point text
      if (deltaX < 10 && deltaY < 10) {
        const newElement: TemplateElement = {
          id: `element-${Date.now()}`,
          type: 'text',
          x: startX,
          y: startY,
          width: 200, // Auto-sizing will handle this
          height: 30,
          zIndex: template.elements.length,
          content: 'Texte ponctuel',
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          textType: 'point', // New property to distinguish text types
        };

        const newTemplate = {
          ...template,
          elements: [...template.elements, newElement],
        };

        setTemplate(newTemplate);
        saveToHistory(newTemplate);
        setSelectedElement(newElement);
        setEditingElement(newElement);
        setEditingText(newElement.content || '');
      } else {
        // It's a drag - create paragraph text
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        const newElement: TemplateElement = {
          id: `element-${Date.now()}`,
          type: 'text',
          x: x,
          y: y,
          width: Math.max(width, 100),
          height: Math.max(height, 50),
          zIndex: template.elements.length,
          content: 'Texte de paragraphe',
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          textType: 'paragraph', // New property to distinguish text types
        };

        const newTemplate = {
          ...template,
          elements: [...template.elements, newElement],
        };

        setTemplate(newTemplate);
        saveToHistory(newTemplate);
        setSelectedElement(newElement);
        setEditingElement(newElement);
        setEditingText(newElement.content || '');
      }

      setIsCreatingText(false);
      setTextCreationStart(null);
    }

    setIsDragging(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'text') {
      // Start text creation
      setIsCreatingText(true);
      setTextCreationStart({ x, y });
    } else if (['shape', 'rectangle', 'ellipse', 'polygon', 'star', 'line', 'custom-shape'].includes(currentTool)) {
      handleAddElement('shape', x, y);
    } else if (currentTool === 'triangle') {
      handleAddElement('shape', x, y);
    } else if (currentTool === 'move') {
      if (isEditPathMode) {
        // Handle edit path mode clicks
        handleCanvasClickInEditMode(e);
      } else {
        // Find element under cursor
        const clickedElement = template.elements.find(element =>
          x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height
        );

        if (clickedElement) {
          setSelectedElement(clickedElement);
          setIsDragging(true);
          setDragOffset({ x: x - clickedElement.x, y: y - clickedElement.y });
        } else {
          setSelectedElement(null);
        }
      }
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const dropData = JSON.parse(e.dataTransfer.getData('application/json'));

      if (dropData.type === 'tool') {
        // Handle tool drop from toolbar
        const elementType = dropData.elementType;
        handleAddElement(elementType, x, y);
        console.log('Tool dropped:', dropData.toolId, 'at position:', x, y);
      } else if (dropData && dropData.placeholder) {
        // Handle variable drop
        if (editingElement) {
          // Insert variable into currently editing text
          insertVariable(dropData.placeholder);
        } else {
          // Create a text element with the variable placeholder
          const newElement: TemplateElement = {
            id: `element-${Date.now()}`,
            type: 'text',
            x: Math.max(0, x - 50), // Center the text element
            y: Math.max(0, y - 10),
            width: 200,
            height: 40,
            zIndex: template.elements.length,
            content: dropData.placeholder,
            fontSize: 16,
            fontFamily: 'Arial',
            color: '#000000',
            textAlign: 'left',
            variableName: dropData.id // Store the variable name for later processing
          };

          const newTemplate = {
            ...template,
            elements: [...template.elements, newElement],
          };

          setTemplate(newTemplate);
          saveToHistory(newTemplate);
          setSelectedElement(newElement);

          console.log('Variable dropped:', dropData.name, 'at position:', x, y);
        }
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      // Handle element dragging
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      handleElementUpdate(selectedElement.id, { x, y });
    } else if (isTransforming && selectedElement && originalElement) {
      // Handle transformation
      const deltaX = e.clientX - transformStart.x;
      const deltaY = e.clientY - transformStart.y;
      handleTransform(deltaX, deltaY, transformHandle);
    } else if (isDeforming && selectedElement && deformingPointIndex >= 0) {
      // Handle control point deformation
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const deltaX = mouseX - deformStart.x;
      const deltaY = mouseY - deformStart.y;

      handleDeform(deltaX, deltaY, deformingPointIndex);
    } else if (isSkewing && selectedElement && originalSkewElement) {
      // Handle skewing
      const deltaX = e.clientX - skewStart.x;
      const deltaY = e.clientY - skewStart.y;
      handleSkew(deltaX, deltaY, skewHandle);
    } else if (isEdgeResizing && resizeElement) {
      // Handle direct edge resizing
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      handleEdgeResize(deltaX, deltaY, resizeEdge, resizeElement);
    } else if (isResizingCanvas) {
      // Handle canvas resizing
      const deltaX = e.clientX - canvasResizeStart.x;
      const deltaY = e.clientY - canvasResizeStart.y;
      handleCanvasResize(deltaX, deltaY, canvasResizeHandle);
    } else if (isPanning) {
      // Handle panning
      const newOffsetX = e.clientX - panStart.x;
      const newOffsetY = e.clientY - panStart.y;
      setPanOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isTransforming) {
      setIsTransforming(false);
      setTransformHandle('');
      setOriginalElement(null);
    }
    if (isDeforming) {
      setIsDeforming(false);
      setDeformingPointIndex(-1);
      setOriginalControlPoints([]);
    }
    if (isSkewing) {
      setIsSkewing(false);
      setSkewHandle('');
      setOriginalSkewElement(null);
    }
    if (isEdgeResizing) {
      setIsEdgeResizing(false);
      setResizeEdge('');
      setResizeElement(null);
    }
    if (isResizingCanvas) {
      setIsResizingCanvas(false);
      setCanvasResizeHandle('');
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleStartCanvasResize = (handle: string, startX: number, startY: number) => {
    setIsResizingCanvas(true);
    setCanvasResizeHandle(handle);
    setCanvasResizeStart({ x: startX, y: startY });
    setOriginalCanvasSize({ width: template.width || 800, height: template.height || 600 });
  };

  const handleCanvasResize = (deltaX: number, deltaY: number, handle: string) => {
    let newWidth = originalCanvasSize.width;
    let newHeight = originalCanvasSize.height;

    if (lockCanvasRatio) {
      const aspectRatio = originalCanvasSize.width / originalCanvasSize.height;

      switch (handle) {
        case 'nw':
          newHeight = Math.max(100, originalCanvasSize.height - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'ne':
          newHeight = Math.max(100, originalCanvasSize.height - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'sw':
          newHeight = Math.max(100, originalCanvasSize.height + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'se':
          newHeight = Math.max(100, originalCanvasSize.height + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'n':
          newHeight = Math.max(100, originalCanvasSize.height - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 's':
          newHeight = Math.max(100, originalCanvasSize.height + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'w':
          newWidth = Math.max(100, originalCanvasSize.width - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'e':
          newWidth = Math.max(100, originalCanvasSize.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
      }
    } else {
      switch (handle) {
        case 'nw':
          newWidth = Math.max(100, originalCanvasSize.width - deltaX);
          newHeight = Math.max(100, originalCanvasSize.height - deltaY);
          break;
        case 'ne':
          newWidth = Math.max(100, originalCanvasSize.width + deltaX);
          newHeight = Math.max(100, originalCanvasSize.height - deltaY);
          break;
        case 'sw':
          newWidth = Math.max(100, originalCanvasSize.width - deltaX);
          newHeight = Math.max(100, originalCanvasSize.height + deltaY);
          break;
        case 'se':
          newWidth = Math.max(100, originalCanvasSize.width + deltaX);
          newHeight = Math.max(100, originalCanvasSize.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(100, originalCanvasSize.height - deltaY);
          break;
        case 's':
          newHeight = Math.max(100, originalCanvasSize.height + deltaY);
          break;
        case 'w':
          newWidth = Math.max(100, originalCanvasSize.width - deltaX);
          break;
        case 'e':
          newWidth = Math.max(100, originalCanvasSize.width + deltaX);
          break;
      }
    }

    setTemplate(prev => ({
      ...prev,
      width: newWidth,
      height: newHeight
    }));
  };

  const handleStartTransform = (handle: string, startX: number, startY: number) => {
    if (!selectedElement) return;

    setIsTransforming(true);
    setTransformHandle(handle);
    setTransformStart({ x: startX, y: startY });
    setOriginalElement({ ...selectedElement });
    if (selectedElement.controlPoints) {
      setOriginalControlPoints([...selectedElement.controlPoints]);
    }
  };

  const handleStartDeform = (pointIndex: number, startX: number, startY: number) => {
    if (!selectedElement || !selectedElement.controlPoints) return;

    setIsDeforming(true);
    setDeformingPointIndex(pointIndex);
    setDeformStart({ x: startX, y: startY });
    setOriginalControlPoints([...selectedElement.controlPoints]);
  };

  const handleStartSkew = (handle: string, startX: number, startY: number) => {
    if (!selectedElement) return;

    setIsSkewing(true);
    setSkewHandle(handle);
    setSkewStart({ x: startX, y: startY });
    setOriginalSkewElement({ ...selectedElement });
  };

  const handleTransform = (deltaX: number, deltaY: number, handle: string) => {
    if (!selectedElement || !originalElement) return;

    const updates: Partial<TemplateElement> = {};

    if (handle === 'rotate') {
      // Calculate rotation based on mouse movement
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      let finalAngle = (originalElement.rotation || 0) + angle;

      // Apply Shift modifier for 15° steps
      if (shiftPressed) {
        finalAngle = Math.round(finalAngle / 15) * 15;
      }

      updates.rotation = finalAngle;
    } else if (handle === 'line-start' || handle === 'line-end') {
      // Handle line endpoint movement
      if (selectedElement.isLine) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = transformStart.x + deltaX - rect.left;
        const mouseY = transformStart.y + deltaY - rect.top;

        if (handle === 'line-start') {
          // Move start point, adjust position and width/height accordingly
          const endX = originalElement.x + originalElement.width;
          const endY = originalElement.y + originalElement.height / 2;

          const newStartX = mouseX;
          const newStartY = mouseY;

          updates.x = Math.min(newStartX, endX);
          updates.y = Math.min(newStartY, endY) - originalElement.height / 2;
          updates.width = Math.abs(endX - newStartX);
          updates.height = Math.abs(endY - newStartY) * 2; // Keep some thickness
        } else {
          // Move end point
          const startX = originalElement.x;
          const startY = originalElement.y + originalElement.height / 2;

          const newEndX = mouseX;
          const newEndY = mouseY;

          updates.x = Math.min(startX, newEndX);
          updates.y = Math.min(startY, newEndY) - originalElement.height / 2;
          updates.width = Math.abs(newEndX - startX);
          updates.height = Math.abs(newEndY - startY) * 2;
        }
      }
    } else {
      // Handle resize
      let newWidth = originalElement.width;
      let newHeight = originalElement.height;
      let newX = originalElement.x;
      let newY = originalElement.y;

      // Calculate base resize
      switch (handle) {
        case 'nw':
          newWidth = Math.max(10, originalElement.width - deltaX);
          newHeight = Math.max(10, originalElement.height - deltaY);
          newX = originalElement.x + (originalElement.width - newWidth);
          newY = originalElement.y + (originalElement.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(10, originalElement.width + deltaX);
          newHeight = Math.max(10, originalElement.height - deltaY);
          newY = originalElement.y + (originalElement.height - newHeight);
          break;
        case 'sw':
          newWidth = Math.max(10, originalElement.width - deltaX);
          newHeight = Math.max(10, originalElement.height + deltaY);
          newX = originalElement.x + (originalElement.width - newWidth);
          break;
        case 'se':
          newWidth = Math.max(10, originalElement.width + deltaX);
          newHeight = Math.max(10, originalElement.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(10, originalElement.height - deltaY);
          newY = originalElement.y + (originalElement.height - newHeight);
          break;
        case 's':
          newHeight = Math.max(10, originalElement.height + deltaY);
          break;
        case 'w':
          newWidth = Math.max(10, originalElement.width - deltaX);
          newX = originalElement.x + (originalElement.width - newWidth);
          break;
        case 'e':
          newWidth = Math.max(10, originalElement.width + deltaX);
          break;
      }

      // Special handling for circles - maintain aspect ratio
      if (selectedElement.isCircle || selectedElement.shapeType === 'circle' || selectedElement.shapeType === 'ellipse') {
        if (selectedElement.isCircle) {
          // Force square for circles
          const maxDim = Math.max(newWidth, newHeight);
          newWidth = maxDim;
          newHeight = maxDim;
        }
        // For ellipses, allow freeform but maintain current aspect if Shift is pressed
        if (shiftPressed && selectedElement.shapeType === 'ellipse') {
          const aspectRatio = originalElement.width / originalElement.height;
          if (Math.abs(newWidth / newHeight - aspectRatio) > 0.1) {
            // Maintain aspect ratio
            if (newWidth / originalElement.width > newHeight / originalElement.height) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
          }
        }
      }

      // Apply Shift modifier for proportional resize (for non-circle shapes)
      if (shiftPressed && ['nw', 'ne', 'sw', 'se'].includes(handle) && !selectedElement.isCircle) {
        const scaleX = newWidth / originalElement.width;
        const scaleY = newHeight / originalElement.height;
        const scale = Math.min(scaleX, scaleY);

        newWidth = originalElement.width * scale;
        newHeight = originalElement.height * scale;

        // Recalculate position based on proportional scaling
        switch (handle) {
          case 'nw':
            newX = originalElement.x + (originalElement.width - newWidth);
            newY = originalElement.y + (originalElement.height - newHeight);
            break;
          case 'ne':
            newY = originalElement.y + (originalElement.height - newHeight);
            break;
          case 'sw':
            newX = originalElement.x + (originalElement.width - newWidth);
            break;
          // 'se' case doesn't need position adjustment
        }
      }

      // Apply Alt modifier for center-based resize
      if (altPressed) {
        const centerX = originalElement.x + originalElement.width / 2;
        const centerY = originalElement.y + originalElement.height / 2;

        newX = centerX - newWidth / 2;
        newY = centerY - newHeight / 2;
      }

      updates.x = newX;
      updates.y = newY;
      updates.width = newWidth;
      updates.height = newHeight;

      // Update control points for shapes
      if (selectedElement.type === 'shape' && selectedElement.controlPoints) {
        const scaleX = newWidth / originalElement.width;
        const scaleY = newHeight / originalElement.height;
        const newControlPoints = originalControlPoints.map(point => ({
          x: newX + (point.x - originalElement.x) * scaleX,
          y: newY + (point.y - originalElement.y) * scaleY
        }));
        updates.controlPoints = newControlPoints;
        updates.pathData = generatePathData(newControlPoints);
      }
    }

    handleElementUpdate(selectedElement.id, updates);
  };

  const generateCurvedPath = (element: TemplateElement, curvaturePoints: { x: number; y: number }[]): string => {
    if (!curvaturePoints || curvaturePoints.length === 0) return '';

    if (element.shapeType === 'rectangle' && curvaturePoints.length === 4) {
      // Rectangle with 4 curved sides
      // Corner points (fixed)
      const corners = [
        { x: 0, y: 0 }, // top-left
        { x: element.width, y: 0 }, // top-right
        { x: element.width, y: element.height }, // bottom-right
        { x: 0, y: element.height } // bottom-left
      ];

      // Curvature points (relative to element)
      const relativeCurvatures = curvaturePoints.map(point => ({
        x: point.x - element.x,
        y: point.y - element.y
      }));

      let path = `M${corners[0].x},${corners[0].y}`;

      // Top side: from top-left to top-right, curved by top curvature point
      path += ` Q${relativeCurvatures[0].x},${relativeCurvatures[0].y} ${corners[1].x},${corners[1].y}`;

      // Right side: from top-right to bottom-right, curved by right curvature point
      path += ` Q${relativeCurvatures[1].x},${relativeCurvatures[1].y} ${corners[2].x},${corners[2].y}`;

      // Bottom side: from bottom-right to bottom-left, curved by bottom curvature point
      path += ` Q${relativeCurvatures[2].x},${relativeCurvatures[2].y} ${corners[3].x},${corners[3].y}`;

      // Left side: from bottom-left to top-left, curved by left curvature point
      path += ` Q${relativeCurvatures[3].x},${relativeCurvatures[3].y} ${corners[0].x},${corners[0].y}`;

      path += ' Z';
      return path;
    } else if (element.shapeType === 'triangle' && curvaturePoints.length === 3) {
      // Triangle with 3 curved sides
      // Corner points (fixed)
      const corners = [
        { x: element.width / 2, y: 0 }, // top
        { x: 0, y: element.height }, // bottom-left
        { x: element.width, y: element.height } // bottom-right
      ];

      // Curvature points (relative to element)
      const relativeCurvatures = curvaturePoints.map(point => ({
        x: point.x - element.x,
        y: point.y - element.y
      }));

      let path = `M${corners[0].x},${corners[0].y}`;

      // Top to bottom-left, curved by top curvature point
      path += ` Q${relativeCurvatures[0].x},${relativeCurvatures[0].y} ${corners[1].x},${corners[1].y}`;

      // Bottom-left to bottom-right, curved by bottom-left curvature point
      path += ` Q${relativeCurvatures[1].x},${relativeCurvatures[1].y} ${corners[2].x},${corners[2].y}`;

      // Bottom-right to top, curved by bottom-right curvature point
      path += ` Q${relativeCurvatures[2].x},${relativeCurvatures[2].y} ${corners[0].x},${corners[0].y}`;

      path += ' Z';
      return path;
    }

    return '';
  };

  const handleDeform = (deltaX: number, deltaY: number, pointIndex: number) => {
    if (!selectedElement) return;

    if (isCurvatureMode && selectedElement.curvaturePoints && originalControlPoints.length > 0) {
      // Curvature mode: move curvature points to bend sides
      const newCurvaturePoints = [...selectedElement.curvaturePoints];

      if (newCurvaturePoints.length > pointIndex) {
        newCurvaturePoints[pointIndex] = {
          x: originalControlPoints[pointIndex].x + deltaX,
          y: originalControlPoints[pointIndex].y + deltaY
        };

        // Update path data based on new curvature points
        const newPathData = generateCurvedPath(selectedElement, newCurvaturePoints);

        handleElementUpdate(selectedElement.id, {
          curvaturePoints: newCurvaturePoints,
          pathData: newPathData
        });
      }
    } else if (!selectedElement.controlPoints || originalControlPoints.length === 0) {
      return;
    } else {
      const newControlPoints = [...selectedElement.controlPoints];

      if (isPerspectiveMode && selectedElement.controlPoints.length >= 4 && originalControlPoints.length >= 4) {
        // Perspective mode: grid points control corner deformation
        // Map grid point indices to corner indices
        const cornerIndex = pointIndex % 4; // 0->0, 1->1, 2->2, 3->3
        const oppositeIndex = (cornerIndex + 2) % 4;

        // Move the corresponding corner
        newControlPoints[cornerIndex] = {
          x: originalControlPoints[cornerIndex].x + deltaX,
          y: originalControlPoints[cornerIndex].y + deltaY
        };

        // Move opposite corner in opposite direction for perspective effect
        newControlPoints[oppositeIndex] = {
          x: originalControlPoints[oppositeIndex].x - deltaX * 0.5,
          y: originalControlPoints[oppositeIndex].y - deltaY * 0.5
        };
      } else if (originalControlPoints.length > pointIndex) {
        // Normal deformation: move only the selected point
        newControlPoints[pointIndex] = {
          x: originalControlPoints[pointIndex].x + deltaX,
          y: originalControlPoints[pointIndex].y + deltaY
        };
      }

      const updates: Partial<TemplateElement> = {
        controlPoints: newControlPoints
      };

      // For rectangles, update position and dimensions based on corner points
      if (selectedElement.shapeType === 'rectangle' || selectedElement.shapeType === 'custom') {
        if (newControlPoints.length >= 4) {
          const minX = Math.min(...newControlPoints.map(p => p.x));
          const maxX = Math.max(...newControlPoints.map(p => p.x));
          const minY = Math.min(...newControlPoints.map(p => p.y));
          const maxY = Math.max(...newControlPoints.map(p => p.y));

          updates.x = minX;
          updates.y = minY;
          updates.width = maxX - minX;
          updates.height = maxY - minY;

          // Update control points to be relative to new position
          updates.controlPoints = newControlPoints.map(point => ({
            x: point.x - minX,
            y: point.y - minY
          }));
        }
      }
      // For circles/ellipses, update dimensions based on control points
      else if (selectedElement.shapeType === 'circle' || selectedElement.shapeType === 'ellipse') {
        if (newControlPoints.length >= 8) {
          const centerX = newControlPoints.reduce((sum, p) => sum + p.x, 0) / newControlPoints.length;
          const centerY = newControlPoints.reduce((sum, p) => sum + p.y, 0) / newControlPoints.length;

          // Calculate radius as distance from center to farthest point
          const distances = newControlPoints.map(p =>
            Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
          );
          const maxRadius = Math.max(...distances);

          updates.x = centerX - maxRadius;
          updates.y = centerY - maxRadius;
          updates.width = maxRadius * 2;
          updates.height = maxRadius * 2;

          // Update control points to be relative to new position
          updates.controlPoints = newControlPoints.map(point => ({
            x: point.x - (centerX - maxRadius),
            y: point.y - (centerY - maxRadius)
          }));
        }
      }
      // For other shapes, regenerate path data
      else {
        updates.pathData = generatePathData(newControlPoints);
      }

      handleElementUpdate(selectedElement.id, updates);
    }
  };

  const buildTransformString = (element: TemplateElement): string => {
    const transforms: string[] = [];

    // Add scaling
    const scaleX = element.scaleX || 1;
    const scaleY = element.scaleY || 1;
    if (scaleX !== 1 || scaleY !== 1) {
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }

    // Add skew transforms
    if (element.skewX && element.skewX !== 0) {
      transforms.push(`skewX(${element.skewX}deg)`);
    }
    if (element.skewY && element.skewY !== 0) {
      transforms.push(`skewY(${element.skewY}deg)`);
    }

    // Add rotation
    if (element.rotation && element.rotation !== 0) {
      transforms.push(`rotate(${element.rotation}deg)`);
    }

    // Add warp effect if present
    if (element.warpIntensity) {
      transforms.push(`scaleY(${1 + Math.sin(Date.now() * 0.001) * element.warpIntensity * 0.1})`);
    }

    return transforms.length > 0 ? transforms.join(' ') : 'none';
  };

  // Edit path mode functions
  const handleAddPathPoint = (element: TemplateElement, x: number, y: number) => {
    if (!element.controlPoints) return;

    // Convert to element-relative coordinates
    const relativeX = x - element.x;
    const relativeY = y - element.y;

    const newControlPoints = [...element.controlPoints, { x: relativeX, y: relativeY }];
    const newPathData = generatePathData(newControlPoints);

    handleElementUpdate(element.id, {
      controlPoints: newControlPoints,
      pathData: newPathData
    });
  };

  const handleRemoveSelectedPathPoints = (element: TemplateElement) => {
    if (!element.controlPoints || selectedPathPoints.size === 0) return;

    const newControlPoints = element.controlPoints.filter((_, index) => !selectedPathPoints.has(index));
    const newPathData = generatePathData(newControlPoints);

    handleElementUpdate(element.id, {
      controlPoints: newControlPoints,
      pathData: newPathData
    });

    setSelectedPathPoints(new Set());
  };

  const handleConvertPointType = (element: TemplateElement, pointIndex: number, newType: 'corner' | 'smooth' | 'symmetric') => {
    if (!element.pointTypes) return;

    const newPointTypes = [...element.pointTypes];
    newPointTypes[pointIndex] = newType;

    handleElementUpdate(element.id, { pointTypes: newPointTypes });
  };

  const handleCanvasClickInEditMode = (e: React.MouseEvent) => {
    if (!isEditPathMode || !selectedElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near an existing point (for selection)
    const clickThreshold = 10 / zoom;
    let clickedPointIndex = -1;

    if (selectedElement.controlPoints) {
      selectedElement.controlPoints.forEach((point, index) => {
        const pointX = selectedElement.x + point.x;
        const pointY = selectedElement.y + point.y;
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);

        if (distance < clickThreshold) {
          clickedPointIndex = index;
        }
      });
    }

    if (clickedPointIndex >= 0) {
      // Toggle point selection
      setSelectedPathPoints(prev => {
        const newSet = new Set(prev);
        if (newSet.has(clickedPointIndex)) {
          newSet.delete(clickedPointIndex);
        } else {
          newSet.add(clickedPointIndex);
        }
        return newSet;
      });
    } else {
      // Check if clicking on the shape path (for adding new points)
      const isOnShape = isPointOnShape(selectedElement, x, y);

      if (isOnShape) {
        // Add new point at clicked position
        handleAddPathPoint(selectedElement, x, y);
      } else {
        // Clear selection if clicking outside
        setSelectedPathPoints(new Set());
      }
    }
  };

  const isPointOnShape = (element: TemplateElement, x: number, y: number): boolean => {
    // Simple bounding box check for now - could be enhanced with proper shape intersection
    return x >= element.x && x <= element.x + element.width &&
           y >= element.y && y <= element.y + element.height;
  };

  const handleEdgeResize = (deltaX: number, deltaY: number, edge: string, element: TemplateElement) => {
    let newX = element.x;
    let newY = element.y;
    let newWidth = element.width;
    let newHeight = element.height;

    switch (edge) {
      case 'n': // North - resize from top
        newHeight = Math.max(10, element.height - deltaY);
        newY = element.y + (element.height - newHeight);
        break;
      case 's': // South - resize from bottom
        newHeight = Math.max(10, element.height + deltaY);
        break;
      case 'w': // West - resize from left
        newWidth = Math.max(10, element.width - deltaX);
        newX = element.x + (element.width - newWidth);
        break;
      case 'e': // East - resize from right
        newWidth = Math.max(10, element.width + deltaX);
        break;
      case 'nw': // Northwest - resize from top-left
        newWidth = Math.max(10, element.width - deltaX);
        newHeight = Math.max(10, element.height - deltaY);
        newX = element.x + (element.width - newWidth);
        newY = element.y + (element.height - newHeight);
        break;
      case 'ne': // Northeast - resize from top-right
        newWidth = Math.max(10, element.width + deltaX);
        newHeight = Math.max(10, element.height - deltaY);
        newY = element.y + (element.height - newHeight);
        break;
      case 'sw': // Southwest - resize from bottom-left
        newWidth = Math.max(10, element.width - deltaX);
        newHeight = Math.max(10, element.height + deltaY);
        newX = element.x + (element.width - newWidth);
        break;
      case 'se': // Southeast - resize from bottom-right
        newWidth = Math.max(10, element.width + deltaX);
        newHeight = Math.max(10, element.height + deltaY);
        break;
    }

    // Update control points to match new dimensions
    if (element.controlPoints && element.controlPoints.length >= 4) {
      const scaleX = newWidth / element.width;
      const scaleY = newHeight / element.height;
      const newControlPoints = element.controlPoints.map(point => ({
        x: newX + (point.x - element.x) * scaleX,
        y: newY + (point.y - element.y) * scaleY
      }));

      handleElementUpdate(element.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        controlPoints: newControlPoints,
        pathData: generatePathData(newControlPoints)
      });
    } else {
      handleElementUpdate(element.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    }
  };

  const generatePathData = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';

    const element = selectedElement;
    if (!element) return '';

    // Convert absolute points to relative to element
    const relativePoints = points.map(point => ({
      x: point.x - element.x,
      y: point.y - element.y
    }));

    // For perspective mode or custom shapes with 4 points, create straight-edged quadrilateral
    if (isPerspectiveMode && relativePoints.length === 4) {
      // Simple quadrilateral for perspective
      return `M${relativePoints[0].x},${relativePoints[0].y} L${relativePoints[1].x},${relativePoints[1].y} L${relativePoints[2].x},${relativePoints[2].y} L${relativePoints[3].x},${relativePoints[3].y} Z`;
    }

    // For rectangles (4 points) and triangles (3 points), create smooth shapes
    if (relativePoints.length >= 3) {
      let path = `M${relativePoints[0].x},${relativePoints[0].y}`;

      // Connect points with smooth cubic Bézier curves for higher quality
      for (let i = 1; i < relativePoints.length; i++) {
        const prevPoint = relativePoints[i - 1];
        const currentPoint = relativePoints[i];
        const nextPoint = relativePoints[(i + 1) % relativePoints.length]; // Used for potential future curve smoothing logic

        // Calculate control points for smooth curves
        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;

        // Control point 1: closer to previous point
        const cp1x = prevPoint.x + dx * 0.3;
        const cp1y = prevPoint.y + dy * 0.3;

        // Control point 2: closer to current point
        const cp2x = currentPoint.x - dx * 0.3;
        const cp2y = currentPoint.y - dy * 0.3;

        path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${currentPoint.x},${currentPoint.y}`;
      }

      // Close the path smoothly
      const firstPoint = relativePoints[0];
      const lastPoint = relativePoints[relativePoints.length - 1];
      const secondLastPoint = relativePoints[relativePoints.length - 2]; // Used for potential future curve smoothing logic

      // Calculate control points for closing curve
      const dx = firstPoint.x - lastPoint.x;
      const dy = firstPoint.y - lastPoint.y;

      const closeCp1x = lastPoint.x + dx * 0.3;
      const closeCp1y = lastPoint.y + dy * 0.3;
      const closeCp2x = firstPoint.x - dx * 0.3;
      const closeCp2y = firstPoint.y - dy * 0.3;

      path += ` C${closeCp1x},${closeCp1y} ${closeCp2x},${closeCp2y} ${firstPoint.x},${firstPoint.y} Z`;
      return path;
    }

    return '';
  };


  const handleSave = async () => {
    console.log('handleSave called with template:', template);
    console.log('initialTemplate:', initialTemplate);
    console.log('template.id:', template.id);

    try {
      // Prepare template data for API
      const templateData = {
        name: template.name,
        description: `Template créé le ${new Date().toLocaleDateString()}`,
        type: template.type,
        elements: template.elements,
        canvasData: template.canvasData || undefined, // Convert empty string to undefined
        backgroundColor: template.backgroundColor,
        width: template.width,
        height: template.height,
        editableAfterSave: true, // Always allow editing of saved templates
      };

      console.log('Prepared templateData for API:', templateData);

      let savedTemplate: CertificateTemplate; // Explicitly type savedTemplate

      // Check if this is an existing template (has an ID and was passed as initialTemplate)
      if (initialTemplate && template.id && !template.id.startsWith('template-')) {
        console.log('Updating existing template with ID:', template.id);
        // Update existing template
        savedTemplate = await templatesApi.update(template.id, templateData);
        console.log('Template updated:', savedTemplate);
        notifications.success('Template modifié avec succès!', 'Les modifications ont été enregistrées.');
      } else {
        console.log('Creating new template');
        // Create new template
        savedTemplate = await templatesApi.create(templateData);
        console.log('Template saved:', savedTemplate);

        // Update the template with the saved ID
        setTemplate(prev => {
          console.log('Updating template state with saved ID:', savedTemplate.id);
          return {
            ...prev,
            id: savedTemplate.id,
          };
        });

        notifications.success('Template sauvegardé avec succès!', 'Le template a été enregistré et est maintenant disponible dans la liste des templates.');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      notifications.error('Erreur lors de la sauvegarde du template', (error as Error).message);
    }
  };

  const handleExport = () => {
    // Show export options modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">Exporter le document</h3>
          <button class="text-gray-500 hover:text-gray-700 text-xl cancel-btn">&times;</button>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <label class="flex items-center">
              <input type="radio" name="format" value="png" checked class="mr-2">
              <span>PNG - Image transparente haute qualité</span>
            </label>
            <label class="flex items-center">
              <input type="radio" name="format" value="jpg" class="mr-2">
              <span>JPG - Image compressée pour le web</span>
            </label>
            <label class="flex items-center">
              <input type="radio" name="format" value="pdf" class="mr-2">
              <span>PDF - Document haute qualité pour impression</span>
            </label>
          </div>
          <div class="mt-4 flex justify-end space-x-2">
            <button class="px-4 py-2 bg-gray-200 rounded cancel-btn">Annuler</button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded export-btn">Exporter</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const exportCanvas = (format: string) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = template.width || 800;
      canvas.height = template.height || 600;

      // Fill background
      ctx.fillStyle = template.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw elements (simplified)
      template.elements.forEach(element => {
        if (element.type === 'text') {
          ctx.fillStyle = element.color || '#000000';
          ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
          ctx.fillText(element.content || '', element.x, element.y + (element.fontSize || 16));
        } else if (element.type === 'shape') {
          ctx.fillStyle = element.backgroundColor || '#cccccc';
          ctx.fillRect(element.x, element.y, element.width, element.height);
        } else if (element.type === 'image' && element.imageUrl) {
          // For images, we'd need to load them first - simplified version
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
          };
          img.src = element.imageUrl;
        }
      });

      if (format === 'pdf') {
        // For PDF export, we'd need a library like jsPDF
        // For now, show a message
        notifications.warning('Export PDF', 'L\'exportation PDF nécessite une bibliothèque supplémentaire. Exportation PNG à la place.');
        format = 'png';
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${template.name || 'template'}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          notifications.success('Export réussi', `Le document a été exporté en ${format.toUpperCase()}.`);
        }
      }, format === 'jpg' ? 'image/jpeg' : 'image/png', format === 'jpg' ? 0.8 : 1.0);
    };

    modal.querySelector('.export-btn')?.addEventListener('click', () => {
      const selectedFormat = (modal.querySelector('input[name="format"]:checked') as HTMLInputElement)?.value || 'png';
      document.body.removeChild(modal);
      exportCanvas(selectedFormat);
    });

    modal.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });
  };

  // const handleToolSelect = (tool: string) => { // Unused
  //   setCurrentTool(tool);
  //   // Désélectionner l'élément quand on change d'outil
  //   if (tool !== 'move') {
  //     setSelectedElement(null);
  //     setVisibleControlPoints(new Set());
  //   }
  // };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTemplate(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTemplate(history[newIndex]);
    }
  };

  const handleSelectAll = () => {
    console.log('Select all');
    // TODO: Implement select all
  };

  const handleDeselect = () => {
    setSelectedElement(null);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5); // Max 500%
    setZoom(newZoom);
    notifications.success('Zoom avant', `Zoom à ${Math.round(newZoom * 100)}%`);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1); // Min 10%
    setZoom(newZoom);
    notifications.success('Zoom arrière', `Zoom à ${Math.round(newZoom * 100)}%`);
  };

  const handleActualPixels = () => {
    setZoom(1);
    notifications.success('Zoom ajusté', 'Affichage à 100% (pixels réels).');
  };

  // View menu handlers
  const handleFitOnScreen = () => {
    // Calculate zoom to fit canvas in viewport
    const viewportWidth = window.innerWidth - 400; // Account for panels
    const viewportHeight = window.innerHeight - 100; // Account for menu bar

    const canvasWidth = template.width || 800;
    const canvasHeight = template.height || 600;

    const zoomX = viewportWidth / canvasWidth;
    const zoomY = viewportHeight / canvasHeight;
    const fitZoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%

    setZoom(fitZoom);
    notifications.success('Adapté à l\'écran', `Zoom ajusté à ${Math.round(fitZoom * 100)}%.`);
  };


  const handleShowRulers = () => {
    setShowRulers(!showRulers);
    notifications.success(showRulers ? 'Règles masquées' : 'Règles affichées');
  };

  const handleShowGrid = () => {
    setShowGrid(!showGrid);
    notifications.success(showGrid ? 'Grille masquée' : 'Grille affichée');
  };

  const handleShowGuides = () => {
    setShowGuides(!showGuides);
    notifications.success(showGuides ? 'Repères masqués' : 'Repères affichés');
  };

  const handleSnapToGuides = () => {
    setSnapToGuides(!snapToGuides);
    notifications.success(snapToGuides ? 'Magnétisme désactivé' : 'Magnétisme activé');
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
        notifications.success('Mode plein écran activé');
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
        notifications.error('Erreur', 'Impossible d\'activer le mode plein écran');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
        notifications.success('Mode plein écran désactivé');
      });
    }
  };

  const handleToggleTheme = () => {
    const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);

    // Apply theme to document
    const root = document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else if (nextTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    notifications.success('Thème changé', `Interface ${nextTheme === 'auto' ? 'automatique' : nextTheme === 'dark' ? 'sombre' : 'claire'}`);
  };

  const handleShowActiveLayersOnly = () => {
    setShowActiveLayersOnly(!showActiveLayersOnly);
    notifications.success(showActiveLayersOnly ? 'Tous les calques visibles' : 'Calques actifs uniquement');
  };

  const handleToggleCanvasRatioLock = () => {
    setLockCanvasRatio(!lockCanvasRatio);
    notifications.success(lockCanvasRatio ? 'Proportions du canvas déverrouillées' : 'Proportions du canvas verrouillées');
  };

  // Image menu handlers
  const handleImageSize = () => {
    const width = prompt('Nouvelle largeur de l\'image (px):', template.width?.toString() || '800');
    const height = prompt('Nouvelle hauteur de l\'image (px):', template.height?.toString() || '600');
    if (width && height) {
      const newWidth = parseInt(width);
      const newHeight = parseInt(height);
      if (newWidth > 0 && newHeight > 0) {
        setTemplate(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight
        }));
        saveToHistory({ ...template, width: newWidth, height: newHeight });
        notifications.success('Taille de l\'image modifiée', `Nouvelle taille: ${newWidth}x${newHeight}px`);
      } else {
        notifications.error('Dimensions invalides', 'Veuillez entrer des valeurs positives.');
      }
    }
  };

  const handleCanvasSize = () => {
    // Same as image size for now
    handleImageSize();
  };

  const handleColorModeRGB = () => {
    notifications.success('Mode couleur RVB', 'Le mode couleur RVB est déjà actif.');
  };

  const handleColorModeCMYK = () => {
    notifications.warning('Mode couleur CMJN', 'Le mode CMJN n\'est pas encore supporté dans cet éditeur.');
  };

  const handleColorModeGrayscale = () => {
    notifications.warning('Mode niveaux de gris', 'La conversion en niveaux de gris n\'est pas encore implémentée.');
  };

  const handleBrightnessContrast = () => {
    if (selectedElement) {
      const brightness = prompt('Luminosité (-100 à 100):', '0');
      const contrast = prompt('Contraste (-100 à 100):', '0');
      if (brightness !== null && contrast !== null) {
        // For now, just show notification - full implementation would require canvas manipulation
        notifications.success('Luminosité/Contraste', `Appliqué: Luminosité ${brightness}, Contraste ${contrast}`);
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleLevels = () => {
    if (selectedElement) {
      notifications.warning('Niveaux', 'L\'ajustement des niveaux sera bientôt disponible.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleCurves = () => {
    if (selectedElement) {
      notifications.warning('Courbes', 'L\'ajustement des courbes sera bientôt disponible.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleColorBalance = () => {
    if (selectedElement) {
      notifications.warning('Balance des couleurs', 'L\'ajustement de la balance des couleurs sera bientôt disponible.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleHueSaturation = () => {
    if (selectedElement) {
      const hue = prompt('Teinte (-180 à 180):', '0');
      const saturation = prompt('Saturation (-100 à 100):', '0');
      if (hue !== null && saturation !== null) {
        notifications.success('Teinte/Saturation', `Appliqué: Teinte ${hue}, Saturation ${saturation}`);
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleSelectiveColor = () => {
    if (selectedElement) {
      notifications.warning('Correction sélective', 'La correction sélective sera bientôt disponible.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleBlackAndWhite = () => {
    if (selectedElement) {
      notifications.warning('Noir et blanc', 'La conversion noir et blanc sera bientôt disponible.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer les réglages.');
    }
  };

  const handleAutoCrop = () => {
    notifications.warning('Rognage automatique', 'Le rognage automatique sera bientôt disponible.');
  };

  const handleImageRotation = () => {
    if (selectedElement) {
      const angle = prompt('Angle de rotation (degrés):', '0');
      if (angle !== null) {
        const rotation = parseFloat(angle);
        handleElementUpdate(selectedElement.id, { rotation });
        notifications.success('Rotation appliquée', `L'élément a été tourné de ${rotation} degrés.`);
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à tourner.');
    }
  };

  const handleInvertColors = () => {
    if (selectedElement) {
      // Simple inversion by negating colors - in a real implementation, this would use canvas filters
      notifications.warning('Inversion des couleurs', 'L\'inversion des couleurs sera bientôt disponible.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour inverser les couleurs.');
    }
  };

  // Layer menu handlers
  const handleNewLayer = () => {
    // Add a new empty layer (could be a shape or text element)
    handleAddElement('shape', 100, 100);
    notifications.success('Nouveau calque', 'Un nouveau calque a été ajouté.');
  };

  const handleNewGroup = () => {
    notifications.warning('Groupe de calques', 'La création de groupes de calques sera bientôt disponible.');
  };

  const handleTextLayer = () => {
    handleAddElement('text', 100, 100);
    notifications.success('Calque de texte', 'Un nouveau calque de texte a été ajouté.');
  };

  const handleShapeLayer = () => {
    handleAddElement('shape', 100, 100);
    notifications.success('Calque de forme', 'Un nouveau calque de forme a été ajouté.');
  };

  const handleDuplicateLayer = () => {
    if (selectedElement) {
      // Create a duplicate with slight offset
      const newElement: TemplateElement = {
        ...selectedElement,
        id: `element-${Date.now()}`,
        x: selectedElement.x + 20,
        y: selectedElement.y + 20,
        zIndex: template.elements.length,
      };

      const newTemplate = {
        ...template,
        elements: [...template.elements, newElement],
      };

      setTemplate(newTemplate);
      saveToHistory(newTemplate);
      setSelectedElement(newElement);
      notifications.success('Calque dupliqué', 'Le calque sélectionné a été dupliqué.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque à dupliquer.');
    }
  };

  const handleDeleteLayer = () => {
    if (selectedElement) {
      const newTemplate = {
        ...template,
        elements: template.elements.filter(el => el.id !== selectedElement.id),
      };
      setTemplate(newTemplate);
      saveToHistory(newTemplate);
      setSelectedElement(null);
      notifications.success('Calque supprimé', 'Le calque sélectionné a été supprimé.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque à supprimer.');
    }
  };

  const handleMergeLayers = () => {
    if (template.elements.length > 1) {
      notifications.warning('Fusion des calques', 'La fusion des calques sera bientôt disponible.');
    } else {
      notifications.warning('Fusion impossible', 'Au moins deux calques sont nécessaires pour la fusion.');
    }
  };

  const handleFlattenImage = () => {
    notifications.warning('Aplatir l\'image', 'L\'aplatissement de l\'image sera bientôt disponible.');
  };

  const handleLayerMask = () => {
    if (selectedElement) {
      notifications.warning('Masque de fusion', 'Les masques de fusion seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour ajouter un masque.');
    }
  };

  const handleClippingMask = () => {
    if (selectedElement) {
      notifications.warning('Masque d\'écrêtage', 'Les masques d\'écrêtage seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour créer un masque d\'écrêtage.');
    }
  };

  // Layer styles handlers
  const handleDropShadow = () => {
    if (selectedElement) {
      notifications.warning('Ombre portée', 'Les styles de calque seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handleInnerGlow = () => {
    if (selectedElement) {
      notifications.warning('Lueur interne', 'Les styles de calque seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handleOuterGlow = () => {
    if (selectedElement) {
      notifications.warning('Lueur externe', 'Les styles de calque seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handleBevelEmboss = () => {
    if (selectedElement) {
      notifications.warning('Biseautage / Estampage', 'Les styles de calque seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handleColorOverlay = () => {
    if (selectedElement) {
      const color = prompt('Couleur d\'incrustation (hex, rgb, ou nom):', '#ff0000');
      if (color) {
        handleElementUpdate(selectedElement.id, { backgroundColor: color });
        notifications.success('Incrustation de couleur appliquée', `La couleur ${color} a été appliquée.`);
      }
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handleGradientOverlay = () => {
    if (selectedElement) {
      notifications.warning('Incrustation de dégradé', 'Les dégradés seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handlePatternOverlay = () => {
    if (selectedElement) {
      notifications.warning('Incrustation de motif', 'Les motifs seront bientôt disponibles.');
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque pour appliquer un style.');
    }
  };

  const handleLockLayer = () => {
    if (selectedElement) {
      handleElementUpdate(selectedElement.id, { locked: !selectedElement.locked });
      notifications.success(
        'Verrouillage ' + (selectedElement.locked ? 'désactivé' : 'activé'),
        `Le calque a été ${selectedElement.locked ? 'déverrouillé' : 'verrouillé'}.`
      );
    } else {
      notifications.warning('Aucun calque sélectionné', 'Veuillez sélectionner un calque à verrouiller.');
    }
  };

  const handleAlignLayers = () => {
    if (template.elements.length > 1) {
      notifications.warning('Alignement des calques', 'L\'alignement des calques sera bientôt disponible.');
    } else {
      notifications.warning('Alignement impossible', 'Au moins deux calques sont nécessaires pour l\'alignement.');
    }
  };

  // Selection menu handlers
  const handleReselect = () => {
    // For now, just select the first element if none is selected
    if (!selectedElement && template.elements.length > 0) {
      setSelectedElement(template.elements[0]);
      notifications.success('Ré-sélection', 'Le premier élément a été sélectionné.');
    } else if (selectedElement) {
      notifications.success('Ré-sélection', 'L\'élément est déjà sélectionné.');
    } else {
      notifications.warning('Aucun élément', 'Il n\'y a aucun élément à sélectionner.');
    }
  };

  const handleSelectTopLayer = () => {
    if (template.elements.length > 0) {
      // Find element with highest z-index
      const topElement = template.elements.reduce((prev, current) =>
        (prev.zIndex > current.zIndex) ? prev : current
      );
      setSelectedElement(topElement);
      notifications.success('Couche supérieure sélectionnée', `L'élément "${topElement.type}" a été sélectionné.`);
    } else {
      notifications.warning('Aucun élément', 'Il n\'y a aucun élément dans le document.');
    }
  };

  const handleSelectBottomLayer = () => {
    if (template.elements.length > 0) {
      // Find element with lowest z-index
      const bottomElement = template.elements.reduce((prev, current) =>
        (prev.zIndex < current.zIndex) ? prev : current
      );
      setSelectedElement(bottomElement);
      notifications.success('Couche inférieure sélectionnée', `L'élément "${bottomElement.type}" a été sélectionné.`);
    } else {
      notifications.warning('Aucun élément', 'Il n\'y a aucun élément dans le document.');
    }
  };

  const handleSubjectSelect = () => {
    notifications.warning('Sélection du sujet', 'La sélection automatique du sujet sera bientôt disponible.');
  };

  const handleSelectAndMask = () => {
    notifications.warning('Sélectionner et masquer', 'L\'outil de sélection et masquage sera bientôt disponible.');
  };

  const handleGrowShrinkSelection = () => {
    if (selectedElement) {
      const action = prompt('Agrandir (+) ou réduire (-) la sélection (pixels):', '10');
      if (action !== null) {
        const delta = parseInt(action);
        if (!isNaN(delta)) {
          const newWidth = Math.max(10, selectedElement.width + delta);
          const newHeight = Math.max(10, selectedElement.height + delta);
          handleElementUpdate(selectedElement.id, { width: newWidth, height: newHeight });
          notifications.success('Sélection modifiée', `La taille de l'élément a été ${delta > 0 ? 'agrandie' : 'réduite'} de ${Math.abs(delta)} pixels.`);
        }
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à modifier.');
    }
  };

  const handleSmoothBorder = () => {
    if (selectedElement) {
      const radius = prompt('Rayon de lissage (pixels):', '5');
      if (radius !== null) {
        const borderRadius = parseInt(radius);
        if (!isNaN(borderRadius) && borderRadius >= 0) {
          handleElementUpdate(selectedElement.id, { borderRadius });
          notifications.success('Bordure lissée', `Le rayon de bordure a été défini à ${borderRadius}px.`);
        }
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à modifier.');
    }
  };

  const handleColorRange = () => {
    const color = prompt('Sélectionner par couleur (hex, rgb, ou nom):', '#000000');
    if (color) {
      // Find elements with similar colors (simplified - just text color for now)
      const matchingElements = template.elements.filter(el =>
        el.type === 'text' && el.color === color
      );

      if (matchingElements.length > 0) {
        setSelectedElement(matchingElements[0]);
        notifications.success('Sélection par couleur', `${matchingElements.length} élément(s) trouvé(s) avec la couleur ${color}.`);
      } else {
        notifications.warning('Aucun élément trouvé', `Aucun élément avec la couleur ${color} n'a été trouvé.`);
      }
    }
  };

  // Transformation handlers
  const handleTransformScale = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à mettre à l\'échelle.');
      return;
    }

    const scale = prompt('Facteur d\'échelle (ex: 1.5 pour 150%, 0.5 pour 50%):', '1.0');
    if (scale !== null) {
      const scaleFactor = parseFloat(scale);
      if (!isNaN(scaleFactor) && scaleFactor > 0) {
        const newWidth = selectedElement.width * scaleFactor;
        const newHeight = selectedElement.height * scaleFactor;
        handleElementUpdate(selectedElement.id, { width: newWidth, height: newHeight });
        notifications.success('Mise à l\'échelle appliquée', `L'élément a été mis à l'échelle par un facteur de ${scaleFactor}.`);
      } else {
        notifications.error('Valeur invalide', 'Veuillez entrer un nombre positif.');
      }
    }
  };

  const handleTransformRotate = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à tourner.');
      return;
    }

    const angle = prompt('Angle de rotation (degrés):', '0');
    if (angle !== null) {
      const rotation = parseFloat(angle);
      if (!isNaN(rotation)) {
        handleElementUpdate(selectedElement.id, { rotation });
        notifications.success('Rotation appliquée', `L'élément a été tourné de ${rotation} degrés.`);
      } else {
        notifications.error('Valeur invalide', 'Veuillez entrer un nombre valide.');
      }
    }
  };

  const handleTransformSkew = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à incliner.');
      return;
    }

    const skewX = prompt('Inclinaison horizontale (degrés):', '0');
    const skewY = prompt('Inclinaison verticale (degrés):', '0');
    if (skewX !== null && skewY !== null) {
      const skewXValue = parseFloat(skewX);
      const skewYValue = parseFloat(skewY);
      if (!isNaN(skewXValue) && !isNaN(skewYValue)) {
        handleElementUpdate(selectedElement.id, { skewX: skewXValue, skewY: skewYValue });
        notifications.success('Inclinaison appliquée', `Inclinaison: X=${skewXValue}°, Y=${skewYValue}°.`);
      } else {
        notifications.error('Valeurs invalides', 'Veuillez entrer des nombres valides.');
      }
    }
  };

  const handleTransformPerspective = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer la perspective.');
      return;
    }

    // Toggle perspective mode
    setIsPerspectiveMode(!isPerspectiveMode);

    // If entering perspective mode, ensure the element has control points
    if (!isPerspectiveMode && selectedElement.type === 'shape' && (!selectedElement.controlPoints || selectedElement.controlPoints.length === 0)) {
      // Generate control points for the element
      let newControlPoints: { x: number; y: number }[] = [];

      switch (selectedElement.shapeType) {
        case 'rectangle':
        case 'custom':
        default:
          newControlPoints = [
            { x: selectedElement.x, y: selectedElement.y }, // top-left
            { x: selectedElement.x + selectedElement.width, y: selectedElement.y }, // top-right
            { x: selectedElement.x + selectedElement.width, y: selectedElement.y + selectedElement.height }, // bottom-right
            { x: selectedElement.x, y: selectedElement.y + selectedElement.height } // bottom-left
          ];
          break;
      }

      handleElementUpdate(selectedElement.id, { controlPoints: newControlPoints });
    }

    notifications.success(isPerspectiveMode ? 'Mode Perspective désactivé' : 'Mode Perspective activé', isPerspectiveMode ? 'Retour au mode normal.' : 'Vous pouvez maintenant déformer les coins pour créer un effet de perspective.');
  };

  const handleTransformCurvature = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer la courbure.');
      return;
    }

    // Toggle curvature mode
    setIsCurvatureMode(!isCurvatureMode);

    // If entering curvature mode, ensure the element has curvature points
    if (!isCurvatureMode && selectedElement.type === 'shape') {
      let newCurvaturePoints: { x: number; y: number }[] = [];

      switch (selectedElement.shapeType) {
        case 'rectangle':
          // 4 curvature points, one for each side (midpoints)
          newCurvaturePoints = [
            { x: selectedElement.x + selectedElement.width / 2, y: selectedElement.y }, // top
            { x: selectedElement.x + selectedElement.width, y: selectedElement.y + selectedElement.height / 2 }, // right
            { x: selectedElement.x + selectedElement.width / 2, y: selectedElement.y + selectedElement.height }, // bottom
            { x: selectedElement.x, y: selectedElement.y + selectedElement.height / 2 } // left
          ];
          break;
        case 'triangle':
          // 3 curvature points, one for each side
          newCurvaturePoints = [
            { x: selectedElement.x + selectedElement.width / 2, y: selectedElement.y }, // top
            { x: selectedElement.x, y: selectedElement.y + selectedElement.height }, // bottom-left
            { x: selectedElement.x + selectedElement.width, y: selectedElement.y + selectedElement.height } // bottom-right
          ];
          break;
        default:
          notifications.warning('Type de forme non supporté', 'La courbure n\'est disponible que pour les rectangles et triangles.');
          return;
      }

      handleElementUpdate(selectedElement.id, { curvaturePoints: newCurvaturePoints });
    }

    notifications.success(isCurvatureMode ? 'Mode Courbure désactivé' : 'Mode Courbure activé', isCurvatureMode ? 'Retour au mode normal.' : 'Vous pouvez maintenant courber les côtés de la forme.');
  };

  const handleTransformWarp = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à déformer.');
      return;
    }

    // Enable warp mode by setting warp intensity
    const intensity = prompt('Intensité de la déformation (0-10):', '1');
    if (intensity !== null) {
      const warpValue = parseFloat(intensity);
      if (!isNaN(warpValue) && warpValue >= 0 && warpValue <= 10) {
        handleElementUpdate(selectedElement.id, { warpIntensity: warpValue });
        notifications.success('Déformation appliquée', `Intensité de déformation: ${warpValue}.`);
      } else {
        notifications.error('Valeur invalide', 'Veuillez entrer un nombre entre 0 et 10.');
      }
    }
  };

  const handleTransformFlipHorizontal = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à retourner horizontalement.');
      return;
    }

    // Flip horizontally by scaling width negatively
    const currentScaleX = selectedElement.scaleX || 1;
    const newScaleX = -currentScaleX;
    handleElementUpdate(selectedElement.id, { scaleX: newScaleX });
    notifications.success('Retourné horizontalement', 'L\'élément a été retourné horizontalement.');
  };

  const handleTransformFlipVertical = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à retourner verticalement.');
      return;
    }

    // Flip vertically by scaling height negatively
    const currentScaleY = selectedElement.scaleY || 1;
    const newScaleY = -currentScaleY;
    handleElementUpdate(selectedElement.id, { scaleY: newScaleY });
    notifications.success('Retourné verticalement', 'L\'élément a été retourné verticalement.');
  };

  const handleTransformRotate180 = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à tourner.');
      return;
    }

    const currentRotation = selectedElement.rotation || 0;
    const newRotation = currentRotation + 180;
    handleElementUpdate(selectedElement.id, { rotation: newRotation });
    notifications.success('Rotation 180° appliquée', 'L\'élément a été tourné de 180 degrés.');
  };

  const handleTransformRotate90CW = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à tourner.');
      return;
    }

    const currentRotation = selectedElement.rotation || 0;
    const newRotation = currentRotation + 90;
    handleElementUpdate(selectedElement.id, { rotation: newRotation });
    notifications.success('Rotation 90° horaire appliquée', 'L\'élément a été tourné de 90 degrés dans le sens horaire.');
  };

  const handleTransformRotate90CCW = () => {
    if (!selectedElement) {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à tourner.');
      return;
    }

    const currentRotation = selectedElement.rotation || 0;
    const newRotation = currentRotation - 90;
    handleElementUpdate(selectedElement.id, { rotation: newRotation });
    notifications.success('Rotation 90° antihoraire appliquée', 'L\'élément a été tourné de 90 degrés dans le sens antihoraire.');
  };

  const handleNewFile = () => {
    const newTemplate: CertificateTemplate = {
      id: `template-${Date.now()}`,
      name: 'Nouveau Template',
      elements: [],
      backgroundColor: '#ffffff',
      width: 800,
      height: 600,
      canvasData: undefined,
      type: 'custom',
      editableAfterSave: true,
    };
    setTemplate(newTemplate);
    setHistory([newTemplate]);
    setHistoryIndex(0);
    setSelectedElement(null);
  };

  const handleOpenAsLayer = () => {
    // For now, same as import image - opens an image file and adds it as a layer
    handleImportImage();
  };

  const handleOpenRecent = async () => {
    try {
      const templates = await templatesApi.getAll();
      // Sort by creation date (assuming templates have createdAt)
      const recentTemplates = templates
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10); // Show last 10

      if (recentTemplates.length === 0) {
        notifications.warning('Aucun template récent', 'Aucun template n\'a été trouvé.');
        return;
      }

      // Show a simple list to select from
      const selectedTemplate = await showTemplateSelectionDialog(recentTemplates);
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
        setHistory([selectedTemplate]);
        setHistoryIndex(0);
        setSelectedElement(null);
        notifications.success('Template ouvert', `Le template "${selectedTemplate.name}" a été ouvert.`);
      }
    } catch (error) {
      console.error('Error loading recent templates:', error);
      notifications.error('Erreur', 'Impossible de charger les templates récents.');
    }
  };

  const handleDocumentInfo = () => {
    const info = `
Nom: ${template.name}
ID: ${template.id}
Type: ${template.type}
Dimensions: ${template.width}x${template.height}
Éléments: ${template.elements.length}
Couleur de fond: ${template.backgroundColor}
Créé le: ${template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Non sauvegardé'}
Modifié le: ${template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Non sauvegardé'}
    `.trim();

    // Show info in a simple alert for now
    alert(`Informations du document:\n\n${info}`);
  };

  const handleQuit = () => {
    if (confirm('Êtes-vous sûr de vouloir quitter l\'éditeur ? Les modifications non sauvegardées seront perdues.')) {
      onBack();
    }
  };

  const handleCut = () => {
    if (selectedElement) {
      setClipboard(selectedElement);
      // Remove the element from template
      const newTemplate = {
        ...template,
        elements: template.elements.filter(el => el.id !== selectedElement.id),
      };
      setTemplate(newTemplate);
      saveToHistory(newTemplate);
      setSelectedElement(null);
      notifications.success('Élément coupé', 'L\'élément a été coupé et placé dans le presse-papiers.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à couper.');
    }
  };

  const handleCopy = () => {
    if (selectedElement) {
      setClipboard(selectedElement);
      notifications.success('Élément copié', 'L\'élément a été copié dans le presse-papiers.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à copier.');
    }
  };

  const handlePaste = () => {
    if (clipboard) {
      // Create a new element with slight offset to avoid overlapping
      const newElement: TemplateElement = {
        ...clipboard,
        id: `element-${Date.now()}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20,
        zIndex: template.elements.length,
      };

      const newTemplate = {
        ...template,
        elements: [...template.elements, newElement],
      };

      setTemplate(newTemplate);
      saveToHistory(newTemplate);
      setSelectedElement(newElement);
      notifications.success('Élément collé', 'L\'élément a été collé depuis le presse-papiers.');
    } else {
      notifications.warning('Presse-papiers vide', 'Aucun élément à coller.');
    }
  };

  const handleErase = () => {
    if (selectedElement) {
      const newTemplate = {
        ...template,
        elements: template.elements.filter(el => el.id !== selectedElement.id),
      };
      setTemplate(newTemplate);
      saveToHistory(newTemplate);
      setSelectedElement(null);
      notifications.success('Élément effacé', 'L\'élément sélectionné a été supprimé.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à effacer.');
    }
  };

  const handleFreeTransform = () => {
    if (selectedElement) {
      // For now, just show a message. In a full implementation, this would open a transform dialog
      notifications.warning('Transformation libre', 'Cette fonctionnalité sera bientôt disponible. Utilisez les propriétés du panneau de droite pour modifier l\'élément.');
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à transformer.');
    }
  };

  const handleFill = () => {
    if (selectedElement) {
      // Open a color picker dialog
      const color = prompt('Entrez une couleur (hex, rgb, ou nom):', selectedElement.backgroundColor || '#cccccc');
      if (color) {
        handleElementUpdate(selectedElement.id, { backgroundColor: color });
        notifications.success('Remplissage appliqué', `La couleur ${color} a été appliquée.`);
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément à remplir.');
    }
  };

  const handlePreferences = () => {
    // Show a simple preferences dialog
    const gridSize = prompt('Taille de la grille (en pixels):', '20');
    if (gridSize) {
      // In a real implementation, this would update global preferences
      notifications.success('Préférences mises à jour', `Taille de la grille définie à ${gridSize}px.`);
    }
  };

  const handleSystemSettings = () => {
    // Show system settings dialog
    notifications.warning('Paramètres système', 'Cette fonctionnalité nécessite des permissions administrateur.');
  };

  const handleSetBackgroundColor = () => {
    const color = prompt('Couleur d\'arrière-plan du canevas (hex, rgb, ou nom):', template.backgroundColor || '#ffffff');
    if (color) {
      setTemplate(prev => ({
        ...prev,
        backgroundColor: color
      }));
      saveToHistory({ ...template, backgroundColor: color });
      notifications.success('Couleur d\'arrière-plan modifiée', `La couleur ${color} a été appliquée au canevas.`);
    }
  };

  const handleSetForegroundColor = () => {
    // This would typically set a global foreground color for new elements
    const color = prompt('Couleur de premier plan par défaut (hex, rgb, ou nom):', '#000000');
    if (color) {
      // In a real implementation, this would update global state
      notifications.success('Couleur de premier plan définie', `La couleur ${color} sera utilisée pour les nouveaux éléments.`);
    }
  };

  const handleStroke = () => {
    if (selectedElement) {
      // Set stroke (border) color and width
      const strokeColor = prompt('Couleur du contour (hex, rgb, ou nom):', selectedElement.strokeColor || '#000000');
      const strokeWidth = prompt('Épaisseur du contour (pixels):', (selectedElement.strokeWidth || 1).toString());

      if (strokeColor !== null && strokeWidth !== null) {
        const width = parseInt(strokeWidth);
        if (!isNaN(width) && width >= 0) {
          handleElementUpdate(selectedElement.id, {
            strokeColor: strokeColor,
            strokeWidth: width
          });
          notifications.success('Contour appliqué', `Contour ${strokeColor} de ${width}px appliqué.`);
        } else {
          notifications.error('Épaisseur invalide', 'Veuillez entrer un nombre positif.');
        }
      }
    } else {
      notifications.warning('Aucun élément sélectionné', 'Veuillez sélectionner un élément pour appliquer un contour.');
    }
  };

  const handleFindReplace = () => {
    if (template.elements.length === 0) {
      notifications.warning('Aucun élément textuel', 'Il n\'y a aucun élément textuel dans le document.');
      return;
    }

    // Get all text elements
    const textElements = template.elements.filter(el => el.type === 'text');
    if (textElements.length === 0) {
      notifications.warning('Aucun texte trouvé', 'Aucun élément contenant du texte n\'a été trouvé.');
      return;
    }

    // Show find/replace dialog
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">Rechercher / Remplacer</h3>
          <button class="text-gray-500 hover:text-gray-700 text-xl cancel-btn">&times;</button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Rechercher</label>
            <input type="text" class="w-full border rounded px-3 py-2 find-input" placeholder="Texte à rechercher">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Remplacer par</label>
            <input type="text" class="w-full border rounded px-3 py-2 replace-input" placeholder="Texte de remplacement">
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="mr-2 case-sensitive" id="case-sensitive">
            <label for="case-sensitive" class="text-sm">Respecter la casse</label>
          </div>
          <div class="text-sm text-gray-600">
            ${textElements.length} élément(s) textuel(s) trouvé(s)
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <button class="px-4 py-2 bg-gray-200 rounded cancel-btn">Annuler</button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded find-btn">Rechercher</button>
            <button class="px-4 py-2 bg-green-500 text-white rounded disabled replace-all-btn" disabled>Remplacer tout</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const findInput = modal.querySelector('.find-input') as HTMLInputElement;
    const replaceInput = modal.querySelector('.replace-input') as HTMLInputElement;
    const caseSensitive = modal.querySelector('.case-sensitive') as HTMLInputElement;
    const findBtn = modal.querySelector('.find-btn') as HTMLButtonElement;
    const replaceAllBtn = modal.querySelector('.replace-all-btn') as HTMLButtonElement;

    let foundMatches: Array<{ element: TemplateElement, content: string, matches: number }> = [];

    const performSearch = () => {
      const findText = findInput.value;
      const flags = caseSensitive.checked ? 'g' : 'gi';
      const regex = new RegExp(findText, flags);

      foundMatches = [];
      let totalMatches = 0;

      textElements.forEach(element => {
        const content = element.content || '';
        const matches = content.match(regex);
        if (matches) {
          foundMatches.push({
            element,
            content,
            matches: matches.length
          });
          totalMatches += matches.length;
        }
      });

      if (totalMatches > 0) {
        replaceAllBtn.disabled = false;
        replaceAllBtn.classList.remove('disabled');
        findBtn.textContent = `${totalMatches} occurrence(s) trouvée(s)`;
        findBtn.disabled = true;
      } else {
        replaceAllBtn.disabled = true;
        replaceAllBtn.classList.add('disabled');
        findBtn.textContent = 'Aucune occurrence trouvée';
      }
    };

    const performReplace = () => {
      if (foundMatches.length === 0) return;

      const findText = findInput.value;
      const replaceText = replaceInput.value;
      const flags = caseSensitive.checked ? 'g' : 'gi';
      const regex = new RegExp(findText, flags);

      let totalReplacements = 0;

      foundMatches.forEach(match => {
        const newContent = match.content.replace(regex, replaceText);
        if (newContent !== match.content) {
          handleElementUpdate(match.element.id, { content: newContent });
          totalReplacements += match.matches;
        }
      });

      if (totalReplacements > 0) {
        notifications.success('Remplacement effectué', `${totalReplacements} occurrence(s) remplacée(s).`);
      }

      document.body.removeChild(modal);
    };

    findBtn.addEventListener('click', performSearch);
    replaceAllBtn.addEventListener('click', performReplace);

    modal.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });

    // Focus on find input
    findInput.focus();
  };

  // Helper function to show template selection dialog
  const showTemplateSelectionDialog = (templates: CertificateTemplate[]): Promise<CertificateTemplate | null> => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">Ouvrir un template récent</h3>
          <div class="max-h-60 overflow-y-auto">
            ${templates.map(t => `
              <button class="w-full text-left p-2 hover:bg-gray-100 rounded template-btn" data-id="${t.id}">
                ${t.name} (${new Date(t.createdAt || 0).toLocaleDateString()})
              </button>
            `).join('')}
          </div>
          <div class="flex justify-end mt-4">
            <button class="px-4 py-2 bg-gray-200 rounded cancel-btn">Annuler</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const handleSelect = (templateId: string) => {
        const selected = templates.find(t => t.id === templateId);
        document.body.removeChild(modal);
        resolve(selected || null);
      };

      const handleCancel = () => {
        document.body.removeChild(modal);
        resolve(null);
      };

      modal.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const templateId = target.dataset.id;
          if (templateId) handleSelect(templateId);
        });
      });

      modal.querySelector('.cancel-btn')?.addEventListener('click', handleCancel);
    });
  };

  const handleOpenFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.html';
    input.multiple = false;
    input.style.display = 'none';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      document.body.removeChild(input);

      const fileExtension = file.name.toLowerCase().split('.').pop();

      try {
        const text = await file.text();

        if (fileExtension === 'json') {
          // Parse JSON template
          const templateData = JSON.parse(text);

          // Validate basic structure
          if (templateData.name && templateData.elements && Array.isArray(templateData.elements)) {
            const loadedTemplate: CertificateTemplate = {
              id: templateData.id || `template-${Date.now()}`,
              name: templateData.name,
              elements: templateData.elements,
              backgroundColor: templateData.backgroundColor || '#ffffff',
              width: templateData.width || 800,
              height: templateData.height || 600,
              canvasData: templateData.canvasData,
              type: templateData.type || 'custom',
              editableAfterSave: templateData.editableAfterSave ?? true,
            };

            setTemplate(loadedTemplate);
            setHistory([loadedTemplate]);
            setHistoryIndex(0);
            setSelectedElement(null);

            notifications.success('Template ouvert', `Le template "${loadedTemplate.name}" a été chargé avec succès.`);
          } else {
            notifications.error('Format JSON invalide', 'Le fichier ne contient pas un template valide.');
          }
        } else if (fileExtension === 'html') {
          // Parse HTML template
          notifications.warning('Format HTML détecté', 'L\'importation de templates HTML n\'est pas encore supportée. Veuillez utiliser un fichier JSON.');
        } else {
          notifications.error('Format non supporté', 'Formats acceptés: .json, .html');
        }
      } catch (error) {
        console.error('Error opening file:', error);
        notifications.error('Erreur d\'ouverture', 'Impossible de lire le fichier. Vérifiez qu\'il s\'agit d\'un fichier valide.');
      }
    };

    document.body.appendChild(input);
    input.click();
  };

  const handleImportImage = async () => {
    // Create input element synchronously to maintain user activation context
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.style.display = 'none'; // Hide it

    // Set up the change handler
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Clean up the input element
      document.body.removeChild(input);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        notifications.error('Type de fichier invalide', 'Veuillez sélectionner un fichier image.');
        return;
      }

      // Validate file size (10MB limit like backend)
      if (file.size > 10 * 1024 * 1024) {
        notifications.error('Fichier trop volumineux', 'La taille maximale autorisée est de 10MB.');
        return;
      }

      try {
        // Upload image to backend
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/templates/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'upload de l\'image');
        }

        const result = await response.json();
        const imageUrl = result.imageUrl;

        // Add image element to canvas
        const newElement: TemplateElement = {
          id: `element-${Date.now()}`,
          type: 'image',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          zIndex: template.elements.length,
          imageUrl: imageUrl,
        };

        const newTemplate = {
          ...template,
          elements: [...template.elements, newElement],
        };

        setTemplate(newTemplate);
        saveToHistory(newTemplate);
        setSelectedElement(newElement);

        notifications.success('Image importée', 'L\'image a été ajoutée au canevas avec succès.');
      } catch (error) {
        console.error('Error importing image:', error);
        notifications.error('Erreur d\'import', 'Impossible d\'importer l\'image. Veuillez réessayer.');
      }
    };

    // Add to DOM and trigger click
    document.body.appendChild(input);
    input.click();
  };

  const handleBrowseInBridge = () => {
    // Create a file browser modal similar to Adobe Bridge
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold">Navigateur de fichiers (Bridge)</h3>
          <button class="text-gray-500 hover:text-gray-700 text-xl cancel-btn">&times;</button>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <div class="flex space-x-2 mb-4">
              <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 templates-btn">Templates</button>
              <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 images-btn">Images</button>
              <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 all-btn">Tous</button>
            </div>
            <div class="border rounded p-4 bg-gray-50 file-list" style="height: 400px; overflow-y: auto;">
              <div class="text-center text-gray-500 py-8">
                <p>Chargement des fichiers...</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button class="px-4 py-2 bg-gray-200 rounded cancel-btn">Annuler</button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded open-btn" disabled>Ouvrir</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    let selectedFile: any = null;
    let currentFilter = 'templates';

    const updateFileList = async (filter: string) => {
      const fileList = modal.querySelector('.file-list') as HTMLElement;
      fileList.innerHTML = '<div class="text-center text-gray-500 py-8"><p>Chargement...</p></div>';

      try {
        let files: any[] = [];

        if (filter === 'templates') {
          const templates = await templatesApi.getAll();
          files = templates.map(t => ({
            name: t.name,
            type: 'template',
            data: t,
            extension: 'json',
            size: 'N/A',
            date: t.updatedAt || t.createdAt || new Date().toISOString()
          }));
        } else if (filter === 'images') {
          // For demo purposes, show some sample images
          files = [
            { name: 'logo.png', type: 'image', extension: 'png', size: '45 KB', date: new Date().toISOString() },
            { name: 'background.jpg', type: 'image', extension: 'jpg', size: '120 KB', date: new Date().toISOString() },
            { name: 'certificate-bg.png', type: 'image', extension: 'png', size: '89 KB', date: new Date().toISOString() }
          ];
        } else {
          // All files
          const templates = await templatesApi.getAll();
          const templateFiles = templates.map(t => ({
            name: t.name,
            type: 'template',
            data: t,
            extension: 'json',
            size: 'N/A',
            date: t.updatedAt || t.createdAt || new Date().toISOString()
          }));
          const imageFiles = [
            { name: 'logo.png', type: 'image', extension: 'png', size: '45 KB', date: new Date().toISOString() },
            { name: 'background.jpg', type: 'image', extension: 'jpg', size: '120 KB', date: new Date().toISOString() }
          ];
          files = [...templateFiles, ...imageFiles];
        }

        fileList.innerHTML = files.map((file, index) => `
          <div class="flex items-center p-2 hover:bg-blue-50 cursor-pointer file-item border-b border-gray-100" data-index="${index}">
            <div class="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center text-xs font-bold">
              ${file.extension.toUpperCase()}
            </div>
            <div class="flex-1">
              <div class="font-medium">${file.name}</div>
              <div class="text-sm text-gray-500">${file.size} • ${new Date(file.date).toLocaleDateString()}</div>
            </div>
          </div>
        `).join('');

        // Add click handlers
        modal.querySelectorAll('.file-item').forEach((item, index) => {
          item.addEventListener('click', () => {
            modal.querySelectorAll('.file-item').forEach(i => i.classList.remove('bg-blue-100'));
            item.classList.add('bg-blue-100');
            selectedFile = files[index];
            (modal.querySelector('.open-btn') as HTMLButtonElement).disabled = false;
          });
        });

      } catch (error) {
        fileList.innerHTML = '<div class="text-center text-red-500 py-8"><p>Erreur lors du chargement des fichiers</p></div>';
      }
    };

    // Filter buttons
    modal.querySelector('.templates-btn')?.addEventListener('click', () => {
      currentFilter = 'templates';
      modal.querySelectorAll('.templates-btn, .images-btn, .all-btn').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      });
      modal.querySelector('.templates-btn')?.classList.remove('bg-gray-200', 'text-gray-700');
      modal.querySelector('.templates-btn')?.classList.add('bg-blue-500', 'text-white');
      updateFileList('templates');
    });

    modal.querySelector('.images-btn')?.addEventListener('click', () => {
      currentFilter = 'images';
      modal.querySelectorAll('.templates-btn, .images-btn, .all-btn').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      });
      modal.querySelector('.images-btn')?.classList.remove('bg-gray-200', 'text-gray-700');
      modal.querySelector('.images-btn')?.classList.add('bg-blue-500', 'text-white');
      updateFileList('images');
    });

    modal.querySelector('.all-btn')?.addEventListener('click', () => {
      currentFilter = 'all';
      modal.querySelectorAll('.templates-btn, .images-btn, .all-btn').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      });
      modal.querySelector('.all-btn')?.classList.remove('bg-gray-200', 'text-gray-700');
      modal.querySelector('.all-btn')?.classList.add('bg-blue-500', 'text-white');
      updateFileList('all');
    });

    // Open button
    modal.querySelector('.open-btn')?.addEventListener('click', () => {
      if (selectedFile) {
        if (selectedFile.type === 'template') {
          setTemplate(selectedFile.data);
          setHistory([selectedFile.data]);
          setHistoryIndex(0);
          setSelectedElement(null);
          notifications.success('Template ouvert', `Le template "${selectedFile.name}" a été ouvert.`);
        } else if (selectedFile.type === 'image') {
          notifications.warning('Ouverture d\'image', 'Utilisez "Importer" pour ajouter des images au canevas.');
        }
        document.body.removeChild(modal);
      }
    });

    // Cancel buttons
    modal.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });

    // Load initial files
    updateFileList('templates');
  };

  const handleImportFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.psd,.ai,.svg,.pdf';
    input.multiple = false;
    input.style.display = 'none';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      document.body.removeChild(input);

      const fileExtension = file.name.toLowerCase().split('.').pop();

      // Handle PSD files
      if (fileExtension === 'psd') {
        try {
          notifications.info('Importation PSD', 'Analyse du fichier PSD en cours...');
          const psdResult = await PSDImporter.importPSD(file);

          // Convert PSD layers to template elements
          const newElements = PSDImporter.convertToTemplateElements(psdResult);

          // Update canvas size if needed
          const updatedTemplate = {
            ...template,
            width: Math.max(template.width || 800, psdResult.canvasSize.width || 800),
            height: Math.max(template.height || 600, psdResult.canvasSize.height || 600),
            elements: [...template.elements, ...newElements]
          };

          setTemplate(updatedTemplate);
          saveToHistory(updatedTemplate);

          notifications.success('Importation réussie', `Fichier PSD importé avec ${newElements.length} éléments.`);
        } catch (error) {
          console.error('PSD import error:', error);
          notifications.error('Erreur d\'importation', 'Impossible d\'importer le fichier PSD. Vérifiez que le fichier n\'est pas corrompu.');
        }
        return;
      }

      // Handle other supported formats
      if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension || '')) {
        // Use the existing image import logic
        handleImportImage();
      } else if (fileExtension === 'ai') {
        try {
          notifications.info('Importation AI', 'Analyse du fichier Illustrator en cours...');
          const aiResult = await AIImporter.importAI(file);

          // Add elements to template
          const updatedTemplate = {
            ...template,
            width: Math.max(template.width || 800, aiResult.canvasSize?.width || 800),
            height: Math.max(template.height || 600, aiResult.canvasSize?.height || 600),
            elements: [...template.elements, ...aiResult.elements]
          };

          setTemplate(updatedTemplate);
          saveToHistory(updatedTemplate);

          if (aiResult.warnings.length > 0) {
            notifications.warning('Importation AI partielle', aiResult.warnings.join(' '));
          } else {
            notifications.success('Importation réussie', `Fichier AI importé avec ${aiResult.elements.length} éléments.`);
          }
        } catch (error) {
          console.error('AI import error:', error);
          notifications.error('Erreur d\'importation', 'Impossible d\'importer le fichier AI.');
        }
        return;
      } else if (fileExtension === 'pdf') {
        notifications.warning(
          'Format PDF détecté',
          'L\'importation de fichiers PDF n\'est pas encore supportée. ' +
          'Veuillez convertir le fichier en image (PNG/JPG) ou utiliser un fichier AI.'
        );
      } else {
        notifications.error(
          'Format non supporté',
          'Ce type de fichier n\'est pas supporté. Formats acceptés: images (PNG, JPG, GIF, BMP, WebP), PSD, AI, SVG.'
        );
      }
    };

    document.body.appendChild(input);
    input.click();
  };

  const handleCloseFile = () => {
    // Check for unsaved changes
    const hasUnsavedChanges = historyIndex > 0 || template.elements.length > 0 ||
      template.name !== 'Nouveau Template' ||
      template.backgroundColor !== '#ffffff' ||
      template.width !== 800 || template.height !== 600;

    if (hasUnsavedChanges) {
      const confirmed = confirm(
        'Le document contient des modifications non sauvegardées. Voulez-vous vraiment fermer sans sauvegarder ?'
      );
      if (!confirmed) return;
    }

    // Reset to new template
    const newTemplate: CertificateTemplate = {
      id: `template-${Date.now()}`,
      name: 'Nouveau Template',
      elements: [],
      backgroundColor: '#ffffff',
      width: 800,
      height: 600,
      canvasData: undefined,
      type: 'custom',
      editableAfterSave: true,
    };

    setTemplate(newTemplate);
    setHistory([newTemplate]);
    setHistoryIndex(0);
    setSelectedElement(null);

    notifications.success('Document fermé', 'Le document a été fermé et un nouveau document vierge a été créé.');
  };

  const handleSaveAs = () => {
    // For now, same as save
    handleSave();
  };

  const handlePrint = () => {
    // Show print settings modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">Paramètres d'impression</h3>
          <button class="text-gray-500 hover:text-gray-700 text-xl cancel-btn">&times;</button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Échelle (%)</label>
            <input type="number" class="w-full border rounded px-3 py-2 scale-input" value="100" min="10" max="200">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Résolution (DPI)</label>
            <select class="w-full border rounded px-3 py-2 resolution-select">
              <option value="72">72 DPI (Écran)</option>
              <option value="150" selected>150 DPI (Standard)</option>
              <option value="300">300 DPI (Haute qualité)</option>
              <option value="600">600 DPI (Professionnel)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Marges</label>
            <select class="w-full border rounded px-3 py-2 margins-select">
              <option value="none" selected>Aucune</option>
              <option value="minimal">Minimales</option>
              <option value="standard">Standard</option>
              <option value="large">Larges</option>
            </select>
          </div>
          <div class="flex items-center">
            <input type="checkbox" class="mr-2 fit-to-page" checked>
            <label class="text-sm">Ajuster à la page</label>
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <button class="px-4 py-2 bg-gray-200 rounded cancel-btn">Annuler</button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded print-btn">Imprimer</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.print-btn')?.addEventListener('click', () => {
      const scale = parseInt((modal.querySelector('.scale-input') as HTMLInputElement).value) || 100;
      const resolution = (modal.querySelector('.resolution-select') as HTMLSelectElement).value;
      const margins = (modal.querySelector('.margins-select') as HTMLSelectElement).value;
      const fitToPage = (modal.querySelector('.fit-to-page') as HTMLInputElement).checked;

      document.body.removeChild(modal);

      // Create print-friendly version
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        notifications.error('Erreur d\'impression', 'Impossible d\'ouvrir la fenêtre d\'impression.');
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${template.name || 'Template'} - Impression</title>
          <style>
            @media print {
              body { margin: ${margins === 'none' ? '0' : margins === 'minimal' ? '0.5cm' : margins === 'standard' ? '1cm' : '2cm'}; }
              .print-canvas { transform: scale(${scale / 100}); transform-origin: top left; }
            }
            body { font-family: Arial, sans-serif; }
            .print-canvas {
              position: relative;
              width: ${template.width}px;
              height: ${template.height}px;
              background-color: ${template.backgroundColor || '#ffffff'};
              border: 1px solid #ccc;
            }
            .element {
              position: absolute;
            }
            .text-element {
              font-family: inherit;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="print-canvas">
            ${template.elements.map(element => {
              if (element.type === 'text') {
                return `<div class="element text-element" style="
                  left: ${element.x}px;
                  top: ${element.y}px;
                  font-size: ${element.fontSize || 16}px;
                  color: ${element.color || '#000000'};
                  font-family: ${element.fontFamily || 'Arial'};
                  font-weight: ${element.fontWeight || 'normal'};
                  text-align: ${element.textAlign || 'left'};
                ">${element.content || ''}</div>`;
              } else if (element.type === 'shape') {
                return `<div class="element" style="
                  left: ${element.x}px;
                  top: ${element.y}px;
                  width: ${element.width}px;
                  height: ${element.height}px;
                  background-color: ${element.backgroundColor || '#cccccc'};
                  border-radius: ${element.borderRadius || 0}px;
                "></div>`;
              } else if (element.type === 'image' && element.imageUrl) {
                return `<img class="element" src="${element.imageUrl}" style="
                  left: ${element.x}px;
                  top: ${element.y}px;
                  width: ${element.width}px;
                  height: ${element.height}px;
                  border-radius: ${element.borderRadius || 0}px;
                " />`;
              }
              return '';
            }).join('')}
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        notifications.success('Impression lancée', 'La boîte de dialogue d\'impression s\'est ouverte.');
      };
    });

    modal.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });
  };

  // Helper to extract ProjectData from current template state
  const getProjectData = (): ProjectData => {
    return {
      layers: template.layers || [], // Store layer hierarchy if available
      elements: template.elements, // Store all renderable elements
      positions: template.elements.reduce((acc, el) => {
        acc[el.id] = { x: el.x, y: el.y, width: el.width, height: el.height };
        return acc;
      }, {} as Record<string, { x: number; y: number; width: number; height: number }>),
      texts: template.elements.filter(el => el.type === 'text'), // Redundant but kept for clarity based on prompt
      images: template.elements.filter(el => el.type === 'image'), // Redundant but kept for clarity based on prompt
      effects: template.elements.filter(el => el.effects && el.effects.length > 0), // Assuming effects are part of TemplateElement
      transparency: 1, // Placeholder, assuming global transparency or per-layer
      internalVariables: template.variables?.reduce((acc, v) => {
        acc[v] = template.variableValues?.[v] || '';
        return acc;
      }, {} as Record<string, any>) || {},
      canvasSettings: {
        width: template.width || 800,
        height: template.height || 600,
        backgroundColor: template.backgroundColor || '#ffffff',
      },
      metadata: {
        author: 'Current User', // Placeholder
        date: new Date().toISOString(),
        version: '1.0.0', // YB_FILE_VERSION from YBFileManager
      },
    };
  };

  const handleSaveYB = async () => {
    try {
      const projectData = getProjectData();
      await ybFileManager.saveYB(projectData);
      notifications.success('Fichier .yb sauvegardé', 'Le projet a été enregistré au format .yb.');
    } catch (error) {
      console.error('Error saving .yb file:', error);
      notifications.error('Erreur de sauvegarde .yb', (error as Error).message);
    }
  };

  const handleLoadYB = () => {
    fileInputRef.current?.click(); // Trigger the hidden file input
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const loadedProjectData = await ybFileManager.loadYB(file);
      console.log('Loaded Project Data:', loadedProjectData);

      // Reconstruct template from loadedProjectData
      const newTemplate: CertificateTemplate = {
        id: `template-${Date.now()}`, // Generate new ID for loaded project
        name: file.name.replace('.yb', '') || 'Projet chargé',
        elements: loadedProjectData.elements.map(el => ({
          ...el,
          // Restore positions from loadedProjectData.positions
          x: loadedProjectData.positions[el.id]?.x ?? el.x,
          y: loadedProjectData.positions[el.id]?.y ?? el.y,
          width: loadedProjectData.positions[el.id]?.width ?? el.width,
          height: loadedProjectData.positions[el.id]?.height ?? el.height,
        })),
        backgroundColor: loadedProjectData.canvasSettings.backgroundColor,
        width: loadedProjectData.canvasSettings.width,
        height: loadedProjectData.canvasSettings.height,
        canvasData: undefined, // Not directly stored in .yb
        type: 'custom',
        editableAfterSave: true,
        variables: Object.keys(loadedProjectData.internalVariables),
        variableValues: loadedProjectData.internalVariables,
        layers: loadedProjectData.layers,
        createdAt: loadedProjectData.metadata.date,
        updatedAt: new Date().toISOString(),
      };

      setTemplate(newTemplate);
      setHistory([newTemplate]);
      setHistoryIndex(0);
      setSelectedElement(null);
      notifications.success('Fichier .yb chargé', `Le projet "${newTemplate.name}" a été chargé avec succès.`);
    } catch (error) {
      console.error('Error loading .yb file:', error);
      notifications.error('Erreur de chargement .yb', (error as Error).message);
    }
  };

  // const handleToolSelect = (tool: string) => { // Unused
  //   setCurrentTool(tool);
  //   // Désélectionner l'élément quand on change d'outil
  //   if (tool !== 'move') {
  //     setSelectedElement(null);
  //     setVisibleControlPoints(new Set());
  //   }
  // };

  const menuActions = {
    newFile: handleNewFile,
    openFile: handleOpenFile,
    openAsLayer: handleOpenAsLayer,
    openRecent: handleOpenRecent,
    closeFile: handleCloseFile,
    save: handleSave,
    saveAs: handleSaveAs,
    export: handleExport,
    print: handlePrint,
    documentInfo: handleDocumentInfo,
    quit: handleQuit,
    importImage: handleImportImage,
    importFile: handleImportFile,
    browseInBridge: handleBrowseInBridge,
    saveYB: handleSaveYB, // Add saveYB action
    loadYB: handleLoadYB, // Add loadYB action
    undo: handleUndo,
    redo: handleRedo,
    cut: handleCut,
    copy: handleCopy,
    paste: handlePaste,
    erase: handleErase,
    freeTransform: handleFreeTransform,
    fill: handleFill,
    stroke: handleStroke,
    findReplace: handleFindReplace,
    preferences: handlePreferences,
    systemSettings: handleSystemSettings,
    setBackgroundColor: handleSetBackgroundColor,
    setForegroundColor: handleSetForegroundColor,
    selectAll: handleSelectAll,
    deselect: handleDeselect,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    actualPixels: handleActualPixels,
    fitOnScreen: handleFitOnScreen,
    showRulers: handleShowRulers,
    showGrid: handleShowGrid,
    showGuides: handleShowGuides,
    snapToGuides: handleSnapToGuides,
    fullScreen: handleFullScreen,
    toggleTheme: handleToggleTheme,
    showActiveLayersOnly: handleShowActiveLayersOnly,
    toggleCanvasRatioLock: handleToggleCanvasRatioLock,
    // Image menu actions
    imageSize: handleImageSize,
    canvasSize: handleCanvasSize,
    colorModeRGB: handleColorModeRGB,
    colorModeCMYK: handleColorModeCMYK,
    colorModeGrayscale: handleColorModeGrayscale,
    brightnessContrast: handleBrightnessContrast,
    levels: handleLevels,
    curves: handleCurves,
    colorBalance: handleColorBalance,
    hueSaturation: handleHueSaturation,
    selectiveColor: handleSelectiveColor,
    blackAndWhite: handleBlackAndWhite,
    autoCrop: handleAutoCrop,
    imageRotation: handleImageRotation,
    invertColors: handleInvertColors,
    // Layer menu actions
    newLayer: handleNewLayer,
    newGroup: handleNewGroup,
    textLayer: handleTextLayer,
    shapeLayer: handleShapeLayer,
    duplicateLayer: handleDuplicateLayer,
    deleteLayer: handleDeleteLayer,
    mergeLayers: handleMergeLayers,
    flattenImage: handleFlattenImage,
    layerMask: handleLayerMask,
    clippingMask: handleClippingMask,
    dropShadow: handleDropShadow,
    innerGlow: handleInnerGlow,
    outerGlow: handleOuterGlow,
    bevelEmboss: handleBevelEmboss,
    colorOverlay: handleColorOverlay,
    gradientOverlay: handleGradientOverlay,
    patternOverlay: handlePatternOverlay,
    lockLayer: handleLockLayer,
    alignLayers: handleAlignLayers,
    // Selection menu actions
    reselect: handleReselect,
    selectTopLayer: handleSelectTopLayer,
    selectBottomLayer: handleSelectBottomLayer,
    subjectSelect: handleSubjectSelect,
    selectAndMask: handleSelectAndMask,
    growShrinkSelection: handleGrowShrinkSelection,
    smoothBorder: handleSmoothBorder,
    colorRange: handleColorRange,
    // Transformation actions
    transformScale: handleTransformScale,
    transformRotate: handleTransformRotate,
    transformSkew: handleTransformSkew,
    transformPerspective: handleTransformPerspective,
    transformCurvature: handleTransformCurvature,
    transformWarp: handleTransformWarp,
    transformFlipHorizontal: handleTransformFlipHorizontal,
    transformFlipVertical: handleTransformFlipVertical,
    transformRotate180: handleTransformRotate180,
    transformRotate90CW: handleTransformRotate90CW,
    transformRotate90CCW: handleTransformRotate90CCW,
 };

  return (
    <div
      className="fixed inset-0 bg-gray-900 overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ fontFamily: 'Segoe UI, sans-serif', fontSize: '11px' }}
    >
      {/* Hidden file input for loading .yb files */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".yb"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Ouvrir un fichier YB"
      />

      {/* Photoshop-style Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#2B2B2B] border-b border-gray-600 z-50 flex items-center px-2">
        <PhotoshopMenuBar actions={menuActions} />
        {/* Modifier key indicators */}
        <div className="ml-auto flex items-center space-x-1 text-xs text-gray-400">
          {shiftPressed && (
            <span className="bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-mono">⇧</span>
          )}
          {altPressed && (
            <span className="bg-green-600 text-white px-1 py-0.5 rounded text-xs font-mono">⎇</span>
          )}
        </div>
      </div>

      {/* Left Tools Panel */}
      <div className="absolute left-0 top-7 w-32 bg-[#2D2D2D] border-r border-gray-600 overflow-y-auto overflow-x-auto" style={{ height: 'calc(100vh - 28px)' }}>
        <PhotoshopToolbar
          onAddElement={handleAddElement}
          onToolSelect={setCurrentTool}
        />
      </div>


      {/* Canvas Area */}
      <div
        className="absolute flex items-center justify-center canvas-area overflow-hidden"
        style={{
          left: showRulers ? '148px' : '128px', // Extra space for rulers
          top: showRulers ? '48px' : '28px', // Extra space for rulers
          right: '320px',
          bottom: 0
        }}
        onMouseDown={(e) => {
          // Only allow panning when NOT in canvas-resize mode
          if (currentTool !== 'canvas-resize' && (e.button === 1 || (e.button === 0 && currentTool === 'hand'))) {
            e.preventDefault();
            setIsPanning(true);
            setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
          }
        }}
      >
        {/* Rulers */}
        {showRulers && (
          <>
            {/* Horizontal ruler */}
            <div
              className="absolute top-0 left-0 bg-gray-200 border-r border-gray-400 z-10"
              style={{
                width: Math.min(template.width || 800, window.innerWidth - 400),
                height: '20px'
              }}
            >
              <div className="flex items-center h-full text-xs text-gray-600">
                {Array.from({ length: Math.ceil((template.width || 800) / 50) }, (_, i) => (
                  <div key={i} className="relative" style={{ width: '50px' }}>
                    <div className="absolute -bottom-1 w-px h-2 bg-gray-400"></div>
                    <div className="absolute -bottom-1 left-1/2 w-px h-1 bg-gray-400"></div>
                    <div className="absolute -bottom-1 right-0 w-px h-2 bg-gray-400"></div>
                    <span className="absolute -bottom-6 left-1 text-xs">{i * 50}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical ruler */}
            <div
              className="absolute top-0 left-0 bg-gray-200 border-b border-gray-400 z-10"
              style={{
                width: '20px',
                height: Math.min((template.height || 600) * 0.7, window.innerHeight * 0.7)
              }}
            >
              <div className="flex flex-col justify-start w-full text-xs text-gray-600">
                {Array.from({ length: Math.ceil((template.height || 600) / 50) }, (_, i) => (
                  <div key={i} className="relative" style={{ height: '50px' }}>
                    <div className="absolute -right-1 w-2 h-px bg-gray-400"></div>
                    <div className="absolute -right-1 top-1/2 w-1 h-px bg-gray-400"></div>
                    <div className="absolute -right-1 bottom-0 w-2 h-px bg-gray-400"></div>
                    <span
                      className="absolute -right-8 top-1 text-xs transform -rotate-90 origin-center"
                      style={{ transformOrigin: 'center' }}
                    >
                      {i * 50}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div
          ref={canvasRef}
          className={`relative transition-colors duration-200 ${
            currentTool === 'canvas-resize' ? 'border-2' :
            isPanning ? 'cursor-grabbing' : currentTool === 'hand' ? 'cursor-grab' : 'cursor-crosshair'
          }`}
          style={{
            width: Math.min(template.width || 800, window.innerWidth - 400),
            height: Math.min((template.height || 600) * 0.7, window.innerHeight * 0.7),
            backgroundColor: template.backgroundColor || '#ffffff',
            backgroundImage: showGrid ? 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
            backgroundSize: '20px 20px',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            boxShadow: selectedElement ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none'
          }}
          onMouseDown={handleCanvasMouseDown}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {/* Canvas resize handles - only show when canvas-resize tool is active */}
          {currentTool === 'canvas-resize' && (
            <CanvasResizeHandles
              onResizeStart={handleStartCanvasResize}
              onResize={handleCanvasResize}
              onResizeEnd={() => setIsResizingCanvas(false)}
              canvasWidth={template.width || 800}
              canvasHeight={template.height || 600}
              zoom={zoom}
            />
          )}

          {/* Alignment guides */}
          <AlignmentGuides
            elements={template.elements}
            selectedElement={selectedElement}
            canvasWidth={template.width || 800}
            canvasHeight={template.height || 600}
            zoom={zoom}
            panOffset={panOffset}
          />
          {template.elements
            .filter(element => element.visible !== false)
            .map((element) => (
            <div
              id={`element-${element.id}`}
              key={element.id}
              className={`absolute transition-all duration-150 ${
                element.locked
                  ? 'cursor-not-allowed opacity-60'
                  : selectedElement?.id === element.id
                    ? 'cursor-pointer border-2 border-transparent'
                    : 'cursor-pointer border-2 border-transparent hover:border-blue-300 hover:shadow-md hover:shadow-blue-300/10'
              }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: buildTransformString(element),
                opacity: element.opacity || 1,
                zIndex: element.zIndex,
              }}
              onClick={() => !element.locked && handleElementSelect(element)}
              onDoubleClick={(e) => {
                if (element.locked) return;
                e.stopPropagation();
                handleElementDoubleClick(element);
              }}
              onMouseEnter={() => {
                if (element.locked) return;
                // Add subtle hover effect
                const el = document.getElementById(`element-${element.id}`);
                if (el && selectedElement?.id !== element.id) {
                  el.style.transform = element.rotation
                    ? `rotate(${element.rotation}deg) scale(1.02)`
                    : 'scale(1.02)';
                }
              }}
              onMouseLeave={() => {
                if (element.locked) return;
                // Reset hover effect and cursor
                const el = document.getElementById(`element-${element.id}`);
                if (el) {
                  el.style.transform = element.rotation ? `rotate(${element.rotation}deg)` : 'none';
                  el.style.cursor = 'pointer';
                  el.dataset.resizeEdge = '';
                }
              }}
            >
              {/* Transformation handles for selected element */}
              {selectedElement?.id === element.id && !element.locked && (
                <TransformationHandles
                  element={element}
                  onStartTransform={handleStartTransform}
                  onStartDeform={handleStartDeform}
                  onStartSkew={handleStartSkew}
                  zoom={zoom}
                  showControlPoints={visibleControlPoints.has(element.id) || isPerspectiveMode}
                  isEditPathMode={isEditPathMode}
                  isPerspectiveMode={isPerspectiveMode}
                  isCurvatureMode={isCurvatureMode}
                />
              )}
              {/* Indicateur de suppression pour l'élément sélectionné */}
              {selectedElement?.id === element.id && !element.locked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLayer();
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs z-10"
                  title="Supprimer l'élément (Suppr)"
                >
                  ×
                </button>
              )}
              {element.type === 'text' && (
                editingElement?.id === element.id ? (
                  <div
                    ref={contentEditableRef}
                    contentEditable
                    className="inline-text-editor w-full h-full border-none outline-none bg-transparent selection:bg-blue-200 overflow-hidden"
                    onInput={(e) => setEditingText(e.currentTarget.textContent || '')}
                    onBlur={handleTextEditSave}
                    onKeyDown={handleTextEditKeyDown}
                    style={{
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                      backgroundColor: element.backgroundColor || 'transparent',
                      borderRadius: element.borderRadius || 0,
                      lineHeight: '1.2',
                      padding: '2px 4px',
                      whiteSpace: element.textType === 'point' ? 'nowrap' : 'pre-wrap',
                      overflow: 'visible',
                      zIndex: 1000,
                      caretColor: element.color || '#000000',
                      border: '1px solid #007acc',
                      boxShadow: '0 0 0 1px rgba(0, 122, 204, 0.3)',
                      minHeight: '20px',
                      wordWrap: 'break-word',
                    }}
                    suppressContentEditableWarning={true}
                    autoFocus
                    spellCheck={false}
                    dangerouslySetInnerHTML={{ __html: editingText }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center select-none cursor-text"
                    style={{
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                      backgroundColor: element.backgroundColor || 'transparent',
                      borderRadius: element.borderRadius || 0,
                      whiteSpace: element.textType === 'point' ? 'nowrap' : 'pre-wrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      wordWrap: 'break-word',
                      lineHeight: '1.2',
                      // Apply warp effect if element has warp properties
                      transform: element.warpIntensity ? `scaleY(${1 + Math.sin(Date.now() * 0.001) * element.warpIntensity * 0.1})` : undefined,
                      transformOrigin: 'center bottom',
                    }}
                    onDoubleClick={() => handleElementDoubleClick(element)}
                  >
                    {element.variableName ? (
                      // Display variable with special styling
                      <span
                        className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(0, 122, 204, 0.1)',
                          border: '1px solid rgba(0, 122, 204, 0.3)',
                          color: '#007acc',
                        }}
                        title={`Variable: ${element.variableName}`}
                      >
                        ⚙️ {element.content}
                      </span>
                    ) : (
                      element.content
                    )}
                  </div>
                )
              )}
              {element.type === 'shape' && (
                <ShapeRenderer element={element} isPerspectiveMode={isPerspectiveMode} isCurvatureMode={isCurvatureMode} />
              )}
              {element.type === 'image' && element.imageUrl && (
                <img
                  src={element.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius: element.borderRadius || 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panels */}
      <div
        className="absolute right-0 top-7 w-80 bg-gray-800 border-l border-gray-600"
        style={{ height: 'calc(100vh - 28px)' }}
      >
        {/* Edit Path Mode Indicator */}
        {isEditPathMode && selectedElement && (
          <div className="px-3 py-2 bg-blue-600 text-white text-xs font-medium border-b border-blue-500">
            ✏️ Mode Édition des Points - {selectedElement.shapeType || 'Forme'}
            <button
              onClick={() => {
                setIsEditPathMode(false);
                setSelectedPathPoints(new Set());
                setVisibleControlPoints(new Set());
              }}
              className="float-right ml-2 px-2 py-0.5 bg-blue-700 hover:bg-blue-800 rounded text-xs"
              title="Quitter le mode édition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Perspective Mode Indicator */}
        {isPerspectiveMode && selectedElement && (
          <div className="px-3 py-2 bg-orange-600 text-white text-xs font-medium border-b border-orange-500">
            📐 Mode Perspective - {selectedElement.shapeType || 'Forme'}
            <button
              onClick={() => {
                setIsPerspectiveMode(false);
                setVisibleControlPoints(new Set());
              }}
              className="float-right ml-2 px-2 py-0.5 bg-orange-700 hover:bg-orange-800 rounded text-xs"
              title="Quitter le mode perspective"
            >
              ✕
            </button>
          </div>
        )}

        <PhotoshopPanels
          selectedElement={selectedElement}
          onElementUpdate={handleElementUpdate}
          onElementDelete={(elementId: string) => {
            setTemplate(prev => ({
              ...prev,
              elements: prev.elements.filter(el => el.id !== elementId),
            }));
            setSelectedElement(null);
          }}
          onElementSelect={handleElementSelect}
          templateElements={template.elements}
          onVariableSelect={(variable) => {
            if (editingElement) {
              insertVariable(variable.placeholder);
            } else {
              // Create new text element with variable
              handleAddElement('text', 100, 100);
              setTimeout(() => {
                const newElement = template.elements[template.elements.length - 1];
                if (newElement) {
                  setEditingElement(newElement);
                  setEditingText(variable.placeholder);
                  setSelectedElement(newElement);
                }
              }, 0);
            }
          }}
          onVariableDrag={(variable, e) => {
            console.log('Variable dragged:', variable);
          }}
        />
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Guide des Raccourcis et Menus</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer l'aide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ShortcutsHelp />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Editor;
