import Ajv from 'ajv';
import { CanvasTemplate, KonvaJSON } from '../types';

export class TemplateValidatorService {
    private ajv: Ajv;
    private schema: any;

    constructor() {
        this.ajv = new Ajv({ allErrors: true });
        this.schema = this.buildKonvaSchema();
    }

    /**
     * Validate a canvas template
     */
    /**
     * Validate a canvas template
     */
    validate(template: CanvasTemplate): { valid: boolean; errors?: string[] } {
        // Validate basic template structure
        if (!template.name || !template.canvasData || !template.width || !template.height) {
            return {
                valid: false,
                errors: ['Template must have name, canvasData, width, and height']
            };
        }

        // Check if it is an HTML or content-based template
        if (template.canvasData && (
            typeof template.canvasData === 'string' ||
            template.canvasData.html ||
            template.canvasData.content
        )) {
            // HTML/Content templates are valid by default regarding structure
            return { valid: true };
        }

        // Validate canvas data structure
        const validate = this.ajv.compile(this.schema);
        const valid = validate(template.canvasData);

        if (!valid) {
            return {
                valid: false,
                errors: validate.errors?.map(err => `${err.instancePath} ${err.message}`) || ['Invalid canvas data']
            };
        }

        // Validate dimensions
        if (template.width < 100 || template.width > 10000) {
            return { valid: false, errors: ['Width must be between 100 and 10000 pixels'] };
        }

        if (template.height < 100 || template.height > 10000) {
            return { valid: false, errors: ['Height must be between 100 and 10000 pixels'] };
        }

        // Validate category
        const validCategories = ['certificate', 'attestation', 'poster', 'other'];
        if (template.category && !validCategories.includes(template.category)) {
            return { valid: false, errors: [`Category must be one of: ${validCategories.join(', ')}`] };
        }

        return { valid: true };
    }

    /**
     * Build JSON schema for Konva.js structure
     */
    private buildKonvaSchema(): any {
        return {
            type: 'object',
            required: ['className'],
            properties: {
                className: { type: 'string' },
                attrs: {
                    type: 'object',
                    properties: {
                        width: { type: 'number' },
                        height: { type: 'number' }
                    }
                },
                children: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['className'],
                        properties: {
                            className: { type: 'string' },
                            attrs: { type: 'object' },
                            children: {
                                type: 'array',
                                items: { type: 'object' }
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Sanitize canvas data to prevent XSS
     */
    sanitize(canvasData: KonvaJSON | any): KonvaJSON | any {
        // Pass through HTML data
        if (typeof canvasData === 'string') return canvasData;
        if (canvasData && canvasData.html) {
            // Preserve messages and other metadata for HTML templates
            return {
                ...canvasData,
                html: canvasData.html,
                messages: canvasData.messages || []
            };
        }

        const sanitizeNode = (node: any): any => {
            const sanitized: any = {
                className: node.className,
                attrs: {}
            };

            // Only allow safe attributes
            const safeAttrs = [
                'x', 'y', 'width', 'height', 'fill', 'stroke', 'strokeWidth',
                'text', 'fontSize', 'fontFamily', 'fontStyle', 'align',
                'opacity', 'rotation', 'scaleX', 'scaleY', 'name',
                'src', 'image', 'radius', 'points', 'closed'
            ];

            for (const attr of safeAttrs) {
                if (node.attrs && node.attrs[attr] !== undefined) {
                    sanitized.attrs[attr] = node.attrs[attr];
                }
            }

            // Recursively sanitize children
            if (node.children && Array.isArray(node.children)) {
                sanitized.children = node.children.map(sanitizeNode);
            }

            return sanitized;
        };

        if (!canvasData || !canvasData.className) {
            return canvasData;
        }

        return {
            ...canvasData,
            className: canvasData.className,
            attrs: canvasData.attrs,
            children: canvasData.children?.map(sanitizeNode) || []
        };
    }
}

export const templateValidatorService = new TemplateValidatorService();
