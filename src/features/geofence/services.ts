import { ResultAsync } from "neverthrow";
import { client } from "../../shared/lib/amplify";
import { type Geofence, GeofenceFetchError } from "./types";

export function fetchGeofences(
	workerId: string,
): ResultAsync<Geofence[], GeofenceFetchError> {
	return ResultAsync.fromPromise(
		fetchGeofencesRaw(workerId),
		(e) => new GeofenceFetchError("勤務地の取得に失敗しました", { cause: e }),
	);
}

async function fetchGeofencesRaw(workerId: string): Promise<Geofence[]> {
	const { data: links, errors } =
		await client.models.WorkerGeofence.listWorkerGeofenceByWorkerId({
			workerId,
		});
	if (errors && errors.length > 0) {
		throw new Error(errors.map((e) => e.message).join(", "));
	}

	const geofenceResults = await Promise.all(
		links.map((link) => client.models.Geofence.get({ id: link.geofenceId })),
	);

	const geofences: Geofence[] = [];
	for (const result of geofenceResults) {
		if (result.errors && result.errors.length > 0) continue;
		const g = result.data;
		if (g == null) continue;
		geofences.push({
			id: g.id,
			name: g.name,
			latitude: g.latitude,
			longitude: g.longitude,
			radius: g.radius,
			address: g.address ?? null,
		});
	}
	return geofences;
}
