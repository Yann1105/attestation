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

        <WorkspaceLayout
            topBar={
                <div className="relative w-full z-50">
                    <PhotoshopMenuBar actions={menuActions} />
                    {/* Modifier key indicators */}
                    <div className="absolute top-1 right-2 flex items-center space-x-1 text-xs text-gray-400 pointer-events-none">
                        {shiftPressed && (
                            <span className="bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-mono">⇧</span>
                        )}
                        {altPressed && (
                            <span className="bg-green-600 text-white px-1 py-0.5 rounded text-xs font-mono">⎇</span>
                        )}
                    </div>
                </div>
            }
            toolBar={
                <PhotoshopToolbar
                    onAddElement={handleAddElement}
                    onToolSelect={setCurrentTool}
                />
            }
            canvasArea={
                <div
                    className="relative w-full h-full bg-[#1e1e1e] flex items-center justify-center overflow-hidden"
                    onMouseDown={(e) => {
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
                        className={`relative transition-colors duration-200 ${currentTool === 'canvas-resize' ? 'border-2' :
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
                                    className={`absolute transition-all duration-150 ${element.locked
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
                                        const el = document.getElementById(`element-${element.id}`);
                                        if (el && selectedElement?.id !== element.id) {
                                            el.style.transform = element.rotation
                                                ? `rotate(${element.rotation}deg) scale(1.02)`
                                                : 'scale(1.02)';
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (element.locked) return;
                                        const el = document.getElementById(`element-${element.id}`);
                                        if (el) {
                                            el.style.transform = element.rotation ? `rotate(${element.rotation}deg)` : 'none';
                                            el.style.cursor = 'pointer';
                                            el.dataset.resizeEdge = '';
                                        }
                                    }}
                                >
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
                                                    transform: element.warpIntensity ? `scaleY(${1 + Math.sin(Date.now() * 0.001) * element.warpIntensity * 0.1})` : undefined,
                                                    transformOrigin: 'center bottom',
                                                }}
                                                onDoubleClick={() => handleElementDoubleClick(element)}
                                            >
                                                {element.variableName ? (
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
            }
            panels={
                <>
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
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    {isPerspectiveMode && selectedElement && (
                        <div className="px-3 py-2 bg-orange-600 text-white text-xs font-medium border-b border-orange-500">
                            📐 Mode Perspective - {selectedElement.shapeType || 'Forme'}
                            <button
                                onClick={() => {
                                    setIsPerspectiveMode(false);
                                    setVisibleControlPoints(new Set());
                                }}
                                className="float-right ml-2 px-2 py-0.5 bg-orange-700 hover:bg-orange-800 rounded text-xs"
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
                </>
            }
            statusBar={
                <div className="bg-[#1e1e1e] text-[#888888] text-[10px] px-2 py-0.5 border-t border-[#333333] flex justify-between select-none">
                    <span>{Math.round(zoom * 100)}%</span>
                    <span>{Math.round(template.width)}px x {Math.round(template.height)}px (300 ppi)</span>
                </div>
            }
        />

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
