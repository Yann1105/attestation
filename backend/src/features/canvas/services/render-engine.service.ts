import puppeteer, { Browser, Page } from 'puppeteer';
import { KonvaJSON, RenderRequest } from '../types';
import { variableEngineService } from './variable-engine.service';
import * as fs from 'fs/promises';
import * as path from 'path';

export class RenderEngineService {
    private browser: Browser | null = null;
    private readonly uploadDir: string;

    constructor() {
        this.uploadDir = process.env.CANVAS_UPLOAD_DIR || './uploads/canvas';
        this.ensureUploadDir();
    }

    /**
     * Initialize Puppeteer browser
     */
    private async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
        }
        return this.browser;
    }

    /**
     * Render canvas to PDF
     */
    /**
     * Render canvas to PDF
     */
    async renderToPDF(request: RenderRequest): Promise<Buffer> {
        const { canvasData, variables = {} } = request;
        if (!canvasData) throw new Error('Canvas data is required');

        // Determine HTML content
        let html: string;

        if (typeof canvasData === 'string') {
            // Direct HTML string
            html = canvasData;
        } else if (typeof canvasData === 'object' && 'html' in canvasData && typeof (canvasData as any).html === 'string') {
            // HTML wrapped in object (e.g. { html: "..." })
            html = (canvasData as any).html;
            // Inject variables if needed
            if (variables) {
                Object.entries(variables).forEach(([key, value]) => {
                    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
                });
            }
        } else {
            // Legacy Konva JSON
            const filledData = variableEngineService.fillVariables(canvasData as KonvaJSON, variables);
            html = this.konvaToHTML(filledData as KonvaJSON);
        }

        // Render with Puppeteer
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });

            // Extract dimensions from HTML if possible or use defaults
            // For now, default to A4 landscape-ish or generic
            const width = 1200;
            const height = 800;

            await page.setViewport({
                width,
                height,
                deviceScaleFactor: 2 // High DPI
            });

            const pdfBuffer = await page.pdf({
                width: `${width}px`,
                height: `${height}px`,
                printBackground: true,
                preferCSSPageSize: true
            });

            return Buffer.from(pdfBuffer);
        } finally {
            await page.close();
        }
    }

    /**
     * Render canvas to PNG
     */
    async renderToPNG(request: RenderRequest): Promise<Buffer> {
        const { canvasData, variables = {}, dpi = 300 } = request;
        if (!canvasData) throw new Error('Canvas data is required');

        // Determine HTML content
        let html: string;

        if (typeof canvasData === 'string') {
            html = canvasData;
        } else if (typeof canvasData === 'object' && 'html' in canvasData && typeof (canvasData as any).html === 'string') {
            html = (canvasData as any).html;
            if (variables) {
                Object.entries(variables).forEach(([key, value]) => {
                    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
                });
            }
        } else {
            const filledData = variableEngineService.fillVariables(canvasData as KonvaJSON, variables);
            html = this.konvaToHTML(filledData as KonvaJSON);
        }

        // Render with Puppeteer
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const width = 1200;
            const height = 800;

            // Calculate scale for DPI
            const scale = dpi / 96; // 96 is default screen DPI

            await page.setViewport({
                width: Math.round(width * scale),
                height: Math.round(height * scale),
                deviceScaleFactor: scale
            });

            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: false,
                omitBackground: false
            });

            return Buffer.from(screenshot);
        } finally {
            await page.close();
        }
    }

    /**
     * Convert Konva JSON to HTML/CSS
     */
    private konvaToHTML(konvaData: KonvaJSON): string {
        const width = konvaData.attrs?.width || 1200;
        const height = konvaData.attrs?.height || 800;

        let elementsHTML = '';

        // Process each layer
        konvaData.children?.forEach(layer => {
            if (layer.children) {
                layer.children.forEach(node => {
                    elementsHTML += this.nodeToHTML(node);
                });
            }
        });

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
    }
    .canvas-container {
      position: relative;
      width: ${width}px;
      height: ${height}px;
      background: white;
    }
    .konva-element {
      position: absolute;
    }
    @media print {
      body {
        width: ${width}px;
        height: ${height}px;
      }
    }
  </style>
</head>
<body>
  <div class="canvas-container">
    ${elementsHTML}
  </div>
</body>
</html>
    `.trim();
    }

    /**
     * Convert Konva node to HTML element
     */
    private nodeToHTML(node: any): string {
        const { className, attrs } = node;

        switch (className) {
            case 'Rect':
                return this.rectToHTML(attrs);
            case 'Text':
                return this.textToHTML(attrs);
            case 'Image':
                return this.imageToHTML(attrs);
            case 'Line':
                return this.lineToHTML(attrs);
            case 'Circle':
                return this.circleToHTML(attrs);
            default:
                return '';
        }
    }

    /**
     * Convert Rect to HTML
     */
    private rectToHTML(attrs: any): string {
        const {
            x = 0,
            y = 0,
            width = 100,
            height = 100,
            fill = 'transparent',
            stroke = 'transparent',
            strokeWidth = 0,
            opacity = 1,
            rotation = 0
        } = attrs;

        const style = `
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      background-color: ${fill};
      border: ${strokeWidth}px solid ${stroke};
      opacity: ${opacity};
      transform: rotate(${rotation}deg);
    `.trim();

        return `<div class="konva-element" style="${style}"></div>`;
    }

    /**
     * Convert Text to HTML
     */
    private textToHTML(attrs: any): string {
        const {
            x = 0,
            y = 0,
            text = '',
            fontSize = 16,
            fontFamily = 'Arial',
            fontStyle = 'normal',
            fill = '#000000',
            align = 'left',
            opacity = 1,
            rotation = 0,
            width
        } = attrs;

        const isBold = fontStyle.includes('bold');
        const isItalic = fontStyle.includes('italic');

        const style = `
      left: ${x}px;
      top: ${y}px;
      font-size: ${fontSize}px;
      font-family: ${fontFamily};
      font-weight: ${isBold ? 'bold' : 'normal'};
      font-style: ${isItalic ? 'italic' : 'normal'};
      color: ${fill};
      text-align: ${align};
      opacity: ${opacity};
      transform: rotate(${rotation}deg);
      ${width ? `width: ${width}px;` : ''}
      white-space: pre-wrap;
    `.trim();

        return `<div class="konva-element" style="${style}">${this.escapeHTML(text)}</div>`;
    }

    /**
     * Convert Image to HTML
     */
    private imageToHTML(attrs: any): string {
        const {
            x = 0,
            y = 0,
            width = 100,
            height = 100,
            src = '',
            opacity = 1,
            rotation = 0
        } = attrs;

        const style = `
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      opacity: ${opacity};
      transform: rotate(${rotation}deg);
    `.trim();

        return `<img class="konva-element" src="${src}" style="${style}" />`;
    }

    /**
     * Convert Line to HTML
     */
    private lineToHTML(attrs: any): string {
        const {
            points = [0, 0, 100, 100],
            stroke = '#000000',
            strokeWidth = 1,
            opacity = 1
        } = attrs;

        // Simple line implementation using div with border
        const x1 = points[0] || 0;
        const y1 = points[1] || 0;
        const x2 = points[2] || 100;
        const y2 = points[3] || 100;

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        const style = `
      left: ${x1}px;
      top: ${y1}px;
      width: ${length}px;
      height: ${strokeWidth}px;
      background-color: ${stroke};
      opacity: ${opacity};
      transform: rotate(${angle}deg);
      transform-origin: 0 0;
    `.trim();

        return `<div class="konva-element" style="${style}"></div>`;
    }

    /**
     * Convert Circle to HTML
     */
    private circleToHTML(attrs: any): string {
        const {
            x = 0,
            y = 0,
            radius = 50,
            fill = 'transparent',
            stroke = 'transparent',
            strokeWidth = 0,
            opacity = 1
        } = attrs;

        const style = `
      left: ${x - radius}px;
      top: ${y - radius}px;
      width: ${radius * 2}px;
      height: ${radius * 2}px;
      border-radius: 50%;
      background-color: ${fill};
      border: ${strokeWidth}px solid ${stroke};
      opacity: ${opacity};
    `.trim();

        return `<div class="konva-element" style="${style}"></div>`;
    }

    /**
     * Escape HTML special characters
     */
    private escapeHTML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Ensure upload directory exists
     */
    private async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create upload directory:', error);
        }
    }

    /**
     * Save render to file
     */
    async saveRender(buffer: Buffer, filename: string): Promise<string> {
        const filePath = path.join(this.uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        return filePath;
    }

    /**
     * Close browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export const renderEngineService = new RenderEngineService();
