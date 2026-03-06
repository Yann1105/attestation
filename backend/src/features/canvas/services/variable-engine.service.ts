import { KonvaJSON } from '../types';

export class VariableEngineService {
    private variableRegex = /\{\{(\w+)\}\}/g;

    /**
     * Replace variables in canvas data with actual values
     */
    fillVariables(canvasData: KonvaJSON, variables: Record<string, any>): KonvaJSON {
        const filled = JSON.parse(JSON.stringify(canvasData)); // Deep clone

        const fillNode = (node: any) => {
            if (node.attrs?.text && typeof node.attrs.text === 'string') {
                node.attrs.text = this.replaceVariables(node.attrs.text, variables);
            }

            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(fillNode);
            }
        };

        filled.children?.forEach(fillNode);
        return filled;
    }

    /**
     * Replace variable placeholders in text
     */
    private replaceVariables(text: string, variables: Record<string, any>): string {
        return text.replace(this.variableRegex, (match, varName) => {
            const value = variables[varName];

            if (value === undefined || value === null) {
                console.warn(`Variable ${varName} not found, keeping placeholder`);
                return match;
            }

            // Format based on type
            if (value instanceof Date) {
                return this.formatDate(value);
            }

            return String(value);
        });
    }

    /**
     * Extract all variables from canvas data
     */
    extractVariables(canvasData: KonvaJSON): string[] {
        const variables = new Set<string>();

        const extractFromNode = (node: any) => {
            if (node.attrs?.text && typeof node.attrs.text === 'string') {
                const matches = node.attrs.text.matchAll(this.variableRegex);
                for (const match of matches) {
                    variables.add(match[1]);
                }
            }

            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(extractFromNode);
            }
        };

        canvasData.children?.forEach(extractFromNode);
        return Array.from(variables);
    }

    /**
     * Validate that all required variables are provided
     */
    validateVariables(
        canvasData: KonvaJSON,
        providedVariables: Record<string, any>,
        requiredVariables?: string[]
    ): { valid: boolean; missing?: string[] } {
        const extracted = requiredVariables || this.extractVariables(canvasData);
        const missing = extracted.filter(varName => !(varName in providedVariables));

        if (missing.length > 0) {
            return { valid: false, missing };
        }

        return { valid: true };
    }

    /**
     * Format date to French format
     */
    private formatDate(date: Date, format: string = 'DD/MM/YYYY'): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD MMMM YYYY':
                const months = [
                    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                ];
                return `${day} ${months[date.getMonth()]} ${year}`;
            default:
                return `${day}/${month}/${year}`;
        }
    }

    /**
     * Get default values for common variables
     */
    getDefaultVariables(): Record<string, any> {
        return {
            date: new Date(),
            organization: 'BIMADES Consulting',
            instructor: 'Aimé SAWADO',
            trainingDuration: '1 jour',
            trainingLocation: 'BIMADES Consulting'
        };
    }
}

export const variableEngineService = new VariableEngineService();
