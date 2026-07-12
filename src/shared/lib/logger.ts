/**
 * カテゴリ別ロガー
 *
 * 使い方:
 *   const logger = createLogger("worker");
 *   logger.info("Worker fetched", { id });
 *   logger.error("Worker fetch failed", e);
 *
 * 出力: `[worker] Worker fetched` のように category prefix が付く。
 *
 * 開発中: debug も含めて全レベルを console 経由で出力。
 * 本番: 将来 log level 制御や外部サービス送信を追加する余地を残す。
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = {
	debug: (message: string, ...args: unknown[]) => void;
	info: (message: string, ...args: unknown[]) => void;
	warn: (message: string, ...args: unknown[]) => void;
	error: (message: string, ...args: unknown[]) => void;
};

function format(category: string, message: string): string {
	return `[${category}] ${message}`;
}

export function createLogger(category: string): Logger {
	return {
		debug: (message, ...args) => {
			console.debug(format(category, message), ...args);
		},
		info: (message, ...args) => {
			console.info(format(category, message), ...args);
		},
		warn: (message, ...args) => {
			console.warn(format(category, message), ...args);
		},
		error: (message, ...args) => {
			console.error(format(category, message), ...args);
		},
	};
}

// 主要カテゴリを事前定義しておくと import が簡潔になる
export const workerLogger = createLogger("worker");
export const geofenceTaskLogger = createLogger("geofence-task");
export const locationEventLogger = createLogger("location-event");
export const layoutLogger = createLogger("layout");
export const authLogger = createLogger("auth");
export const notificationLogger = createLogger("notification");
