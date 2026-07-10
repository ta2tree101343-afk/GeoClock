import { okAsync, type ResultAsync } from "neverthrow";
import type { GeofenceFetchError, WorkplaceStatus } from "./types";

/**
 * スタブ実装。将来 Amplify Data に差し替える。
 * 新宿現場A（出勤中）/ 渋谷現場B（退勤済み）/ 池袋現場C（未出勤）を返す。
 */
export function fetchWorkplaceStatuses(
	_workerId: string,
): ResultAsync<WorkplaceStatus[], GeofenceFetchError> {
	const now = new Date();
	const today8am = new Date(now);
	today8am.setHours(8, 32, 0, 0);
	const yesterday545pm = new Date(now);
	yesterday545pm.setDate(yesterday545pm.getDate() - 1);
	yesterday545pm.setHours(17, 45, 0, 0);

	return okAsync([
		{
			kind: "checkedIn",
			geofence: {
				id: "geo-shinjuku-a",
				name: "新宿現場A",
				latitude: 35.6895,
				longitude: 139.6917,
				radius: 100,
				address: "東京都新宿区西新宿",
			},
			checkedInAt: today8am,
		},
		{
			kind: "checkedOut",
			geofence: {
				id: "geo-shibuya-b",
				name: "渋谷現場B",
				latitude: 35.6595,
				longitude: 139.7005,
				radius: 100,
				address: "東京都渋谷区道玄坂",
			},
			checkedOutAt: yesterday545pm,
		},
		{
			kind: "notCheckedIn",
			geofence: {
				id: "geo-ikebukuro-c",
				name: "池袋現場C",
				latitude: 35.7295,
				longitude: 139.7109,
				radius: 100,
				address: "東京都豊島区南池袋",
			},
		},
	]);
}
