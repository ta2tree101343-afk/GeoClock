import { describe, expect, it } from "vitest";
import { computeTotalWorkedSeconds, formatWorkedDuration } from "./summary";
import type { AttendanceEntry } from "./types";

type EntryInput = {
	type: "in" | "out";
	timestamp: string;
	geofenceId?: string;
};

function entry(input: EntryInput): AttendanceEntry {
	return {
		id: `${input.type}-${input.timestamp}-${input.geofenceId ?? "geo-a"}`,
		geofenceId: input.geofenceId ?? "geo-a",
		geofenceName: "現場",
		type: input.type,
		timestamp: new Date(input.timestamp),
		latitude: 35,
		longitude: 139,
	};
}

describe("computeTotalWorkedSeconds", () => {
	it("空配列は 0", () => {
		expect(computeTotalWorkedSeconds([])).toBe(0);
	});

	it("IN のみは 0 (退勤未確定)", () => {
		const es = [entry({ type: "in", timestamp: "2026-07-14T09:00:00Z" })];
		expect(computeTotalWorkedSeconds(es)).toBe(0);
	});

	it("IN → OUT の 1 セッションは差分秒を返す", () => {
		const es = [
			entry({ type: "in", timestamp: "2026-07-14T09:00:00Z" }),
			entry({ type: "out", timestamp: "2026-07-14T18:00:00Z" }),
		];
		expect(computeTotalWorkedSeconds(es)).toBe(9 * 3600);
	});

	it("複数セッションは合算される", () => {
		const es = [
			entry({ type: "in", timestamp: "2026-07-14T09:00:00Z" }),
			entry({ type: "out", timestamp: "2026-07-14T12:00:00Z" }),
			entry({ type: "in", timestamp: "2026-07-14T13:00:00Z" }),
			entry({ type: "out", timestamp: "2026-07-14T18:00:00Z" }),
		];
		expect(computeTotalWorkedSeconds(es)).toBe(8 * 3600);
	});

	it("DESC (新しい順) で渡しても正しく計算する", () => {
		const es = [
			entry({ type: "out", timestamp: "2026-07-14T18:00:00Z" }),
			entry({ type: "in", timestamp: "2026-07-14T09:00:00Z" }),
		];
		expect(computeTotalWorkedSeconds(es)).toBe(9 * 3600);
	});

	it("複数勤務地は独立に集計される", () => {
		const es = [
			entry({ type: "in", timestamp: "2026-07-14T09:00:00Z", geofenceId: "geo-a" }),
			entry({ type: "in", timestamp: "2026-07-14T10:00:00Z", geofenceId: "geo-b" }),
			entry({ type: "out", timestamp: "2026-07-14T12:00:00Z", geofenceId: "geo-a" }),
			entry({ type: "out", timestamp: "2026-07-14T15:00:00Z", geofenceId: "geo-b" }),
		];
		// geo-a: 3h, geo-b: 5h = 8h
		expect(computeTotalWorkedSeconds(es)).toBe(8 * 3600);
	});

	it("IN なしの OUT は無視", () => {
		const es = [
			entry({ type: "out", timestamp: "2026-07-14T09:00:00Z" }),
			entry({ type: "in", timestamp: "2026-07-14T10:00:00Z" }),
			entry({ type: "out", timestamp: "2026-07-14T18:00:00Z" }),
		];
		expect(computeTotalWorkedSeconds(es)).toBe(8 * 3600);
	});

	it("IN 連続は最新の IN で置き換わる (異常データへの防御)", () => {
		const es = [
			entry({ type: "in", timestamp: "2026-07-14T09:00:00Z" }),
			entry({ type: "in", timestamp: "2026-07-14T10:00:00Z" }),
			entry({ type: "out", timestamp: "2026-07-14T18:00:00Z" }),
		];
		// 10:00 IN → 18:00 OUT = 8h（最初の 9:00 IN は上書き）
		expect(computeTotalWorkedSeconds(es)).toBe(8 * 3600);
	});

	it("最後の IN が未 OUT でも既存の完了セッションは集計", () => {
		const es = [
			entry({ type: "in", timestamp: "2026-07-14T09:00:00Z" }),
			entry({ type: "out", timestamp: "2026-07-14T12:00:00Z" }),
			entry({ type: "in", timestamp: "2026-07-14T13:00:00Z" }),
			// OUT なしで終了 (まだ出勤中)
		];
		expect(computeTotalWorkedSeconds(es)).toBe(3 * 3600);
	});
});

describe("formatWorkedDuration", () => {
	it("0秒は '0時間0分'", () => {
		expect(formatWorkedDuration(0)).toBe("0時間0分");
	});

	it("負値は '0時間0分'", () => {
		expect(formatWorkedDuration(-100)).toBe("0時間0分");
	});

	it("60秒未満は '0時間0分'", () => {
		expect(formatWorkedDuration(45)).toBe("0時間0分");
	});

	it("1時間ちょうど", () => {
		expect(formatWorkedDuration(3600)).toBe("1時間0分");
	});

	it("1時間1分", () => {
		expect(formatWorkedDuration(3665)).toBe("1時間1分");
	});

	it("大きな時間", () => {
		expect(formatWorkedDuration(100 * 3600 + 30 * 60)).toBe("100時間30分");
	});
});
