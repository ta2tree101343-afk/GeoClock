import { afterEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "./logger";

describe("createLogger", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("info はカテゴリ prefix + メッセージを出力する", () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => {});
		const logger = createLogger("test");
		logger.info("hello");
		expect(spy).toHaveBeenCalledWith("[test] hello");
	});

	it("追加の引数はそのまま渡される", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		const logger = createLogger("worker");
		const err = new Error("boom");
		logger.error("Failed", err, { workerId: "abc" });
		expect(spy).toHaveBeenCalledWith(
			"[worker] Failed",
			err,
			{ workerId: "abc" },
		);
	});

	it("各レベルが対応する console メソッドを呼ぶ", () => {
		const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
		const info = vi.spyOn(console, "info").mockImplementation(() => {});
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const logger = createLogger("cat");
		logger.debug("d");
		logger.info("i");
		logger.warn("w");
		logger.error("e");
		expect(debug).toHaveBeenCalledWith("[cat] d");
		expect(info).toHaveBeenCalledWith("[cat] i");
		expect(warn).toHaveBeenCalledWith("[cat] w");
		expect(error).toHaveBeenCalledWith("[cat] e");
	});

	it("複数のカテゴリを独立に生成できる", () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => {});
		const a = createLogger("a");
		const b = createLogger("b");
		a.info("hello");
		b.info("world");
		expect(spy).toHaveBeenNthCalledWith(1, "[a] hello");
		expect(spy).toHaveBeenNthCalledWith(2, "[b] world");
	});
});
