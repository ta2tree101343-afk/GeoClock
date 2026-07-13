import { describe, expect, it } from "vitest";
import {
	fitBounds,
	haversineMeters,
	shouldIncludeCurrentLocation,
} from "./geo";

describe("haversineMeters", () => {
	it("同一点の距離は 0", () => {
		const p = { latitude: 35.6895, longitude: 139.6917 };
		expect(haversineMeters(p, p)).toBe(0);
	});

	it("新宿駅 - 渋谷駅 の距離が実測値に近い（約 3.4km）", () => {
		const shinjuku = { latitude: 35.6895, longitude: 139.6917 };
		const shibuya = { latitude: 35.6595, longitude: 139.7005 };
		const d = haversineMeters(shinjuku, shibuya);
		expect(d).toBeGreaterThan(3000);
		expect(d).toBeLessThan(4000);
	});

	it("赤道 1 度の緯度差はおよそ 111km", () => {
		const a = { latitude: 0, longitude: 0 };
		const b = { latitude: 1, longitude: 0 };
		const d = haversineMeters(a, b);
		expect(d).toBeGreaterThan(110_000);
		expect(d).toBeLessThan(112_000);
	});

	it("経度の順序が入れ替わっても対称", () => {
		const a = { latitude: 35.6895, longitude: 139.6917 };
		const b = { latitude: 35.6595, longitude: 139.7005 };
		expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 5);
	});
});

describe("fitBounds", () => {
	it("空配列は null を返す", () => {
		expect(fitBounds([])).toBeNull();
	});

	it("1 点だけならその点と defaultZoom を返す", () => {
		const p = { latitude: 35.6895, longitude: 139.6917 };
		const result = fitBounds([p]);
		expect(result?.coordinates).toEqual(p);
		expect(result?.zoom).toBe(14);
	});

	it("defaultZoom を上書きできる", () => {
		const p = { latitude: 35.6895, longitude: 139.6917 };
		const result = fitBounds([p], { defaultZoom: 16 });
		expect(result?.zoom).toBe(16);
	});

	it("複数点の中心は bounding box の中央になる", () => {
		const shinjuku = { latitude: 35.6895, longitude: 139.6917 };
		const shibuya = { latitude: 35.6595, longitude: 139.7005 };
		const result = fitBounds([shinjuku, shibuya]);
		expect(result?.coordinates.latitude).toBeCloseTo(
			(shinjuku.latitude + shibuya.latitude) / 2,
			5,
		);
		expect(result?.coordinates.longitude).toBeCloseTo(
			(shinjuku.longitude + shibuya.longitude) / 2,
			5,
		);
	});

	it("複数点のズームは 0-20 の範囲に収まる", () => {
		const points = [
			{ latitude: 35.6895, longitude: 139.6917 },
			{ latitude: 35.6595, longitude: 139.7005 },
			{ latitude: 35.7295, longitude: 139.7109 },
		];
		const result = fitBounds(points);
		expect(result?.zoom).toBeGreaterThanOrEqual(0);
		expect(result?.zoom).toBeLessThanOrEqual(20);
	});

	it("狭い範囲ほど大きなズームを返す", () => {
		const near = fitBounds([
			{ latitude: 35.6895, longitude: 139.6917 },
			{ latitude: 35.69, longitude: 139.692 },
		]);
		const far = fitBounds([
			{ latitude: 35.6895, longitude: 139.6917 },
			{ latitude: 40.0, longitude: 145.0 },
		]);
		expect(near?.zoom).toBeGreaterThan(far?.zoom ?? 0);
	});

	it("padding を大きくするとズームが引き算されて広く写る", () => {
		const points = [
			{ latitude: 35.6895, longitude: 139.6917 },
			{ latitude: 35.6595, longitude: 139.7005 },
		];
		const noPad = fitBounds(points, { padding: 0 });
		const withPad = fitBounds(points, { padding: 2 });
		expect(withPad?.zoom).toBeLessThan(noPad?.zoom ?? 0);
	});
});

describe("shouldIncludeCurrentLocation", () => {
	const shinjuku = { latitude: 35.6895, longitude: 139.6917 };
	const shibuya = { latitude: 35.6595, longitude: 139.7005 };
	const sanFrancisco = { latitude: 37.7749, longitude: -122.4194 };

	it("アンカーが空なら常に true", () => {
		expect(shouldIncludeCurrentLocation(sanFrancisco, [], 50_000)).toBe(true);
	});

	it("少なくとも 1 つのアンカーが閾値以内なら true", () => {
		expect(
			shouldIncludeCurrentLocation(shinjuku, [shibuya, sanFrancisco], 50_000),
		).toBe(true);
	});

	it("全アンカーが閾値外なら false", () => {
		expect(
			shouldIncludeCurrentLocation(sanFrancisco, [shinjuku, shibuya], 50_000),
		).toBe(false);
	});

	it("閾値を広げると遠くのアンカーも含まれる", () => {
		// SF - 東京は約 8000km。閾値を 1e7 (1万km) にすれば true
		expect(
			shouldIncludeCurrentLocation(sanFrancisco, [shinjuku], 10_000_000),
		).toBe(true);
	});
});
