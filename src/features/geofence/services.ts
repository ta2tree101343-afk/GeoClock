import { okAsync, type ResultAsync } from "neverthrow";
import type { Geofence, GeofenceFetchError } from "./types";

/**
 * スタブ実装。将来 Amplify Data に差し替える。
 * 3 勤務地（新宿現場A / 渋谷現場B / 池袋現場C）を返す。
 */
export function fetchGeofences(
	_workerId: string,
): ResultAsync<Geofence[], GeofenceFetchError> {
	return okAsync([
		{
			id: "geo-shinjuku-a",
			name: "新宿現場A",
			latitude: 35.6895,
			longitude: 139.6917,
			radius: 100,
			address: "東京都新宿区西新宿",
		},
		{
			id: "geo-shibuya-b",
			name: "渋谷現場B",
			latitude: 35.6595,
			longitude: 139.7005,
			radius: 100,
			address: "東京都渋谷区道玄坂",
		},
		{
			id: "geo-ikebukuro-c",
			name: "池袋現場C",
			latitude: 35.7295,
			longitude: 139.7109,
			radius: 100,
			address: "東京都豊島区南池袋",
		},
	]);
}
