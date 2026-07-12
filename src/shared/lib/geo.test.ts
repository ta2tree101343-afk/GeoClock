import { describe, expect, it } from "vitest";
import { haversineMeters } from "./geo";

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
