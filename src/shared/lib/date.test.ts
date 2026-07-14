import { describe, expect, it } from "vitest";
import {
	addMonths,
	currentMonthKey,
	formatMonthLabel,
	isSameMonth,
	monthRangeIso,
} from "./date";

describe("monthRangeIso", () => {
	it("start と end はローカル月境界に対応する", () => {
		const range = monthRangeIso({ year: 2026, month: 7 });
		const start = new Date(range.startIso);
		const end = new Date(range.endIso);
		expect(start.getFullYear()).toBe(2026);
		expect(start.getMonth()).toBe(6); // 0-indexed = July
		expect(start.getDate()).toBe(1);
		expect(start.getHours()).toBe(0);
		expect(end.getFullYear()).toBe(2026);
		expect(end.getMonth()).toBe(7); // 0-indexed = August
		expect(end.getDate()).toBe(1);
	});

	it("12月の次月境界は翌年1月", () => {
		const range = monthRangeIso({ year: 2026, month: 12 });
		const end = new Date(range.endIso);
		expect(end.getFullYear()).toBe(2027);
		expect(end.getMonth()).toBe(0); // January
		expect(end.getDate()).toBe(1);
	});

	it("start は end より前", () => {
		const range = monthRangeIso({ year: 2026, month: 7 });
		expect(new Date(range.startIso).getTime()).toBeLessThan(
			new Date(range.endIso).getTime(),
		);
	});
});

describe("addMonths", () => {
	it("正の加算", () => {
		expect(addMonths({ year: 2026, month: 7 }, 1)).toEqual({
			year: 2026,
			month: 8,
		});
		expect(addMonths({ year: 2026, month: 11 }, 3)).toEqual({
			year: 2027,
			month: 2,
		});
	});

	it("負の減算", () => {
		expect(addMonths({ year: 2026, month: 7 }, -1)).toEqual({
			year: 2026,
			month: 6,
		});
		expect(addMonths({ year: 2026, month: 2 }, -3)).toEqual({
			year: 2025,
			month: 11,
		});
	});

	it("0 加算は同月", () => {
		expect(addMonths({ year: 2026, month: 7 }, 0)).toEqual({
			year: 2026,
			month: 7,
		});
	});
});

describe("formatMonthLabel", () => {
	it("年月ラベル", () => {
		expect(formatMonthLabel({ year: 2026, month: 7 })).toBe("2026年7月");
		expect(formatMonthLabel({ year: 2025, month: 12 })).toBe("2025年12月");
	});
});

describe("isSameMonth", () => {
	it("同月なら true", () => {
		expect(
			isSameMonth({ year: 2026, month: 7 }, { year: 2026, month: 7 }),
		).toBe(true);
	});

	it("違う月なら false", () => {
		expect(
			isSameMonth({ year: 2026, month: 7 }, { year: 2026, month: 8 }),
		).toBe(false);
		expect(
			isSameMonth({ year: 2025, month: 7 }, { year: 2026, month: 7 }),
		).toBe(false);
	});
});

describe("currentMonthKey", () => {
	it("与えられた Date から month/year を抽出", () => {
		const now = new Date(2026, 6, 15); // 2026年7月15日 (0-indexed month)
		expect(currentMonthKey(now)).toEqual({ year: 2026, month: 7 });
	});
});
