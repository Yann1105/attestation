import { query } from '../../../database';
import { Layer, FilterState } from '../core/types';

export class LayerService {

    async getLayers(projectId: string): Promise<Layer[]> {
        const result = await query(
            `SELECT * FROM ps_layers WHERE project_id = $1 ORDER BY z_index ASC`,
            [projectId]
        );

        return result.rows.map(row => this.mapRowToLayer(row));
    }

    async createLayer(projectId: string, layerData: Partial<Layer>): Promise<Layer> {
        const result = await query(
            `INSERT INTO ps_layers (
        project_id, type, name, visible, opacity, blend_mode, x, y, width, height, z_index, image_data, properties
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
            [
                projectId,
                layerData.type,
                layerData.name,
                layerData.visible ?? true,
                layerData.opacity ?? 100,
                layerData.blendMode ?? 'normal',
                layerData.x ?? 0,
                layerData.y ?? 0,
                layerData.width,
                layerData.height,
                layerData.zIndex ?? 0,
                layerData.buffer, // Buffer mapped to BYTEA
                JSON.stringify({
                    text: layerData.text,
                    fontFamily: layerData.fontFamily,
                    fontSize: layerData.fontSize,
                    color: layerData.color,
                    fillColor: layerData.fillColor,
                    strokeColor: layerData.strokeColor,
                    strokeWidth: layerData.strokeWidth,
                    filters: layerData.filters || {}
                })
            ]
        );

        return this.mapRowToLayer(result.rows[0]);
    }

    async updateLayer(layerId: string, updates: Partial<Layer>): Promise<Layer> {
        // Dynamic query builder would be better, but simple static for now
        // We only update common fields + properties

        // Fetch existing first to merge properties if needed, or just overwrite
        const current = await query(`SELECT * FROM ps_layers WHERE id = $1`, [layerId]);
        if (current.rows.length === 0) throw new Error('Layer not found');

        const existingProps = current.rows[0].properties || {};
        const newProps = {
            ...existingProps,
            text: updates.text ?? existingProps.text,
            fontFamily: updates.fontFamily ?? existingProps.fontFamily,
            fontSize: updates.fontSize ?? existingProps.fontSize,
            color: updates.color ?? existingProps.color,
            fillColor: updates.fillColor ?? existingProps.fillColor,
            strokeColor: updates.strokeColor ?? existingProps.strokeColor,
            strokeWidth: updates.strokeWidth ?? existingProps.strokeWidth,
            filters: updates.filters ? { ...existingProps.filters, ...updates.filters } : existingProps.filters
        };

        const result = await query(
            `UPDATE ps_layers SET
        name = COALESCE($2, name),
        visible = COALESCE($3, visible),
        opacity = COALESCE($4, opacity),
        blend_mode = COALESCE($5, blend_mode),
        x = COALESCE($6, x),
        y = COALESCE($7, y),
        width = COALESCE($8, width),
        height = COALESCE($9, height),
        z_index = COALESCE($10, z_index),
        properties = $11,
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
            [
                layerId,
                updates.name,
                updates.visible,
                updates.opacity,
                updates.blendMode,
                updates.x,
                updates.y,
                updates.width,
                updates.height,
                updates.zIndex,
                JSON.stringify(newProps)
            ]
        );

        return this.mapRowToLayer(result.rows[0]);
    }

    async updateLayerImage(layerId: string, buffer: Buffer): Promise<void> {
        await query(
            `UPDATE ps_layers SET image_data = $2, updated_at = NOW() WHERE id = $1`,
            [layerId, buffer]
        );
    }

    async deleteLayer(layerId: string): Promise<void> {
        await query(`DELETE FROM ps_layers WHERE id = $1`, [layerId]);
    }

    private mapRowToLayer(row: any): Layer {
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            visible: row.visible,
            opacity: row.opacity,
            blendMode: row.blend_mode,
            x: row.x,
            y: row.y,
            width: row.width,
            height: row.height,
            zIndex: row.z_index,
            parentId: row.parent_id,
            buffer: row.image_data, // BYTEA returned as Buffer
            // properties
            text: row.properties?.text,
            fontFamily: row.properties?.fontFamily,
            fontSize: row.properties?.fontSize,
            color: row.properties?.color,
            fillColor: row.properties?.fillColor,
            strokeColor: row.properties?.strokeColor,
            strokeWidth: row.properties?.strokeWidth,
            filters: row.properties?.filters || {}
        };
    }
}

export const layerService = new LayerService();
