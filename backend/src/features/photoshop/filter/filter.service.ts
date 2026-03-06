import { imageProcessor } from '../core/image-processor';
import { FilterState } from '../core/types';

export class FilterService {
    /**
     * Applies a set of filters to an image buffer.
     * This is the entry point for filter operations.
     */
    async processLayerBuffer(buffer: Buffer, filters: FilterState): Promise<Buffer> {
        console.log('Applying filters:', filters);
        // Apply brightness, contrast, grayscale, etc.
        // Note: Blur is computationally expensive and might need a separate pass/method if implemented manually.
        return await imageProcessor.applyFilters(buffer, filters);
    }

    /**
     * Applies a blur effect. 
     * (Placeholder for more complex convolution if needed, currently ImageProcessor handles pixel ops)
     * If we add Gaussian Blur, it would go here invoking a specific ImageProcessor method.
     */
    async applyBlur(buffer: Buffer, radius: number): Promise<Buffer> {
        // TODO: Implement Gaussian blur kernel in ImageProcessor
        return buffer;
    }
}

export const filterService = new FilterService();
