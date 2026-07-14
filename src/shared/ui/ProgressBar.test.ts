import { describe, expect, it } from "vitest";
import { computeRatio } from "./progressBar.utils";

describe("computeRatio", () => {
	it("total が 0 なら 0 を返す", () => {
		expect(computeRatio(0, 0)).toBe(0);
		expect(computeRatio(5, 0)).toBe(0);
	});

	it("current が負値なら 0 に丸める", () => {
		expect(computeRatio(-3, 10)).toBe(0);
	});

	it("current === total で 1", () => {
		expect(computeRatio(10, 10)).toBe(1);
	});

	it("current > total で 1 に丸める", () => {
		expect(computeRatio(15, 10)).toBe(1);
	});

	it("中間値", () => {
		expect(computeRatio(3, 10)).toBe(0.3);
		expect(computeRatio(1, 4)).toBe(0.25);
	});
});
