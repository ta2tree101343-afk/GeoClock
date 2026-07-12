import { describe, expect, it } from "vitest";
import { shouldProcessEvent } from "./shouldProcessEvent";

const BASE = new Date("2026-01-01T09:00:00.000Z");

function ms(diffSeconds: number): Date {
	return new Date(BASE.getTime() + diffSeconds * 1000);
}

describe("shouldProcessEvent", () => {
	it("直前イベントがない場合は常に処理する", () => {
		expect(
			shouldProcessEvent(null, { type: "in", timestamp: BASE }),
		).toBe(true);
	});

	it("同じ type が最小間隔未満なら無視する", () => {
		const last = { type: "in" as const, timestamp: BASE.toISOString() };
		expect(
			shouldProcessEvent(
				last,
				{ type: "in", timestamp: ms(60) },
				{ minSameEventIntervalMs: 5 * 60 * 1000 },
			),
		).toBe(false);
	});

	it("同じ type が最小間隔以上経過していれば処理する", () => {
		const last = { type: "in" as const, timestamp: BASE.toISOString() };
		expect(
			shouldProcessEvent(
				last,
				{ type: "in", timestamp: ms(5 * 60) },
				{ minSameEventIntervalMs: 5 * 60 * 1000 },
			),
		).toBe(true);
	});

	it("in から out への切り替えが最小間隔未満なら無視する", () => {
		const last = { type: "in" as const, timestamp: BASE.toISOString() };
		expect(
			shouldProcessEvent(
				last,
				{ type: "out", timestamp: ms(10) },
				{ minToggleIntervalMs: 30 * 1000 },
			),
		).toBe(false);
	});

	it("in から out への切り替えが最小間隔以上ならば処理する", () => {
		const last = { type: "in" as const, timestamp: BASE.toISOString() };
		expect(
			shouldProcessEvent(
				last,
				{ type: "out", timestamp: ms(31) },
				{ minToggleIntervalMs: 30 * 1000 },
			),
		).toBe(true);
	});

	it("out から in への切り替えも同じ最小間隔ルールが適用される", () => {
		const last = { type: "out" as const, timestamp: BASE.toISOString() };
		expect(
			shouldProcessEvent(
				last,
				{ type: "in", timestamp: ms(29) },
				{ minToggleIntervalMs: 30 * 1000 },
			),
		).toBe(false);
	});

	it("時間が逆行するイベントは無視する", () => {
		const last = { type: "in" as const, timestamp: BASE.toISOString() };
		expect(
			shouldProcessEvent(last, { type: "in", timestamp: ms(-60) }),
		).toBe(false);
	});

	it("デフォルト値が想定通り機能する", () => {
		const last = { type: "in" as const, timestamp: BASE.toISOString() };
		// 同 type デフォルト 5 分
		expect(
			shouldProcessEvent(last, { type: "in", timestamp: ms(4 * 60) }),
		).toBe(false);
		expect(
			shouldProcessEvent(last, { type: "in", timestamp: ms(5 * 60) }),
		).toBe(true);
		// 切替デフォルト 30 秒
		expect(
			shouldProcessEvent(last, { type: "out", timestamp: ms(29) }),
		).toBe(false);
		expect(
			shouldProcessEvent(last, { type: "out", timestamp: ms(30) }),
		).toBe(true);
	});
});
