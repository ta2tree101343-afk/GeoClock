type LatLng = {
	latitude: number;
	longitude: number;
};

const EARTH_RADIUS_METERS = 6_371_008.8;

/**
 * Haversine 公式で 2 点間の球面距離をメートル単位で返す
 */
export function haversineMeters(a: LatLng, b: LatLng): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(b.latitude - a.latitude);
	const dLng = toRad(b.longitude - a.longitude);
	const lat1 = toRad(a.latitude);
	const lat2 = toRad(b.latitude);

	const sinDLat = Math.sin(dLat / 2);
	const sinDLng = Math.sin(dLng / 2);
	const h =
		sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
	return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * 現在地を fit bounds に含めるべきかを判定する。
 * 少なくとも 1 つのアンカー座標から `maxDistanceMeters` 以内にあれば true。
 * アンカーが空なら常に true（fit する対象がないので現在地を中心にする）。
 */
export function shouldIncludeCurrentLocation(
	currentLocation: LatLng,
	anchors: LatLng[],
	maxDistanceMeters: number,
): boolean {
	if (anchors.length === 0) return true;
	return anchors.some(
		(a) => haversineMeters(currentLocation, a) <= maxDistanceMeters,
	);
}

/**
 * 与えられた座標群がすべて画面に収まるようなカメラ位置とズームを算出。
 *
 * 空配列 → null
 * 1 点 → その点と defaultZoom
 * 複数点 → 中心 (bounding box の中央) と、余白を含んだズーム
 *
 * ズームは Apple Maps / Google Maps 共通の Web Mercator ベース
 * (zoom 0 = 世界全体、zoom 20 = 街区レベル)。
 */
export function fitBounds(
	coordinates: LatLng[],
	options: { defaultZoom?: number; padding?: number } = {},
): { coordinates: LatLng; zoom: number } | null {
	if (coordinates.length === 0) return null;

	const defaultZoom = options.defaultZoom ?? 14;
	const padding = options.padding ?? 1;

	if (coordinates.length === 1) {
		return { coordinates: coordinates[0], zoom: defaultZoom };
	}

	let minLat = coordinates[0].latitude;
	let maxLat = coordinates[0].latitude;
	let minLng = coordinates[0].longitude;
	let maxLng = coordinates[0].longitude;

	for (const c of coordinates) {
		if (c.latitude < minLat) minLat = c.latitude;
		if (c.latitude > maxLat) maxLat = c.latitude;
		if (c.longitude < minLng) minLng = c.longitude;
		if (c.longitude > maxLng) maxLng = c.longitude;
	}

	const center: LatLng = {
		latitude: (minLat + maxLat) / 2,
		longitude: (minLng + maxLng) / 2,
	};

	const latSpan = Math.max(maxLat - minLat, 1e-9);
	const lngSpan = Math.max(maxLng - minLng, 1e-9);

	// Web Mercator の近似: 世界地図の全幅 360 度が zoom 0 で 256 px。
	// 各ズームで倍精細になる。
	const latZoom = Math.log2(180 / latSpan);
	const lngZoom = Math.log2(360 / lngSpan);
	const rawZoom = Math.min(latZoom, lngZoom);
	const zoom = Math.max(0, Math.min(20, rawZoom - padding));

	return { coordinates: center, zoom };
}
