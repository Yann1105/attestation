import { query } from '../../../database';

export class HistoryService {
    async logAction(projectId: string, actionType: string, layerId: string | null, parameters: any, undoData: any): Promise<void> {
        await query(
            `INSERT INTO ps_history (project_id, action_type, layer_id, parameters, undo_data)
       VALUES ($1, $2, $3, $4, $5)`,
            [projectId, actionType, layerId, JSON.stringify(parameters), JSON.stringify(undoData)]
        );
    }

    async undo(projectId: string): Promise<void> {
        // 1. Get latest action
        const result = await query(
            `SELECT * FROM ps_history WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [projectId]
        );

        if (result.rows.length === 0) return; // Nothing to undo

        const action = result.rows[0];

        // 2. Revert logic based on action type
        // This requires specific logic for each action type.
        // For simplicity in this "vertical slice", we might assume undo_data contains the full previous state of the layer
        // or the inverse operation parameters.

        // Example: If action was "layer_update", undo_data has the old layer properties.
        if (action.action_type === 'layer_update' && action.layer_id) {
            const oldProps = action.undo_data;
            // Call layer service to update back (avoid circular dependency if possible, or use query directly)
            await query(
                `UPDATE ps_layers SET properties = $2 WHERE id = $1`,
                [action.layer_id, JSON.stringify(oldProps)]
            );
        }
        // ... handle other types

        // 3. Remove history item (or move to redo stack)
        await query(`DELETE FROM ps_history WHERE id = $1`, [action.id]);
    }
}

export const historyService = new HistoryService();
