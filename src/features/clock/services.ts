import { recordEvent } from "../location-event/services";
import type { LocationEventType } from "../location-event/types";
import { enqueue } from "../geofence/pendingQueue";

type ManualPunchInput = {
	workerId: string;
	geofenceId: string;
	type: LocationEventType;
	latitude: number;
	longitude: number;
};

/**
 * 手動打刻: recordEvent を呼び、DB 書き込みが失敗したら pendingQueue に積む。
 * バックグラウンドタスクと同じ耐障害構造を採用。
 */
export async function manualPunch(input: ManualPunchInput): Promise<{
	timestamp: string;
	dbSynced: boolean;
}> {
	const result = await recordEvent(input);
	if (!result.dbSynced) {
		await enqueue({
			id: generateEventId(),
			workerId: input.workerId,
			geofenceId: input.geofenceId,
			type: input.type,
			timestamp: result.timestamp,
			latitude: input.latitude,
			longitude: input.longitude,
		});
	}
	return result;
}

function generateEventId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
