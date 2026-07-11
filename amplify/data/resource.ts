import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * GeoClock データスキーマ
 *
 * - Worker: 労働者。Cognito sub と id を一致させる
 * - Geofence: 勤務地
 * - WorkerGeofence: 労働者と勤務地の紐付け（中間テーブル）
 * - AttendanceLog: 勤怠打刻ログ
 *
 * 認可は MVP として `allow.authenticated()`（サインイン済み全員）を使用。
 * 本番前に owner-based / group-based に絞り込む予定。
 */
const schema = a
	.schema({
		Worker: a
			.model({
				email: a.string().required(),
				name: a.string().required(),
			})
			.authorization((allow) => [allow.authenticated()])
			.secondaryIndexes((index) => [index("email")]),

		Geofence: a
			.model({
				name: a.string().required(),
				latitude: a.float().required(),
				longitude: a.float().required(),
				radius: a.float().required(),
				address: a.string(),
				createdBy: a.string().required(),
			})
			.authorization((allow) => [allow.authenticated()]),

		WorkerGeofence: a
			.model({
				workerId: a.string().required(),
				geofenceId: a.string().required(),
				assignedAt: a.datetime().required(),
			})
			.authorization((allow) => [allow.authenticated()])
			.secondaryIndexes((index) => [
				index("workerId"),
				index("geofenceId"),
			]),

		AttendanceLog: a
			.model({
				workerId: a.string().required(),
				geofenceId: a.string().required(),
				type: a.enum(["in", "out"]),
				timestamp: a.datetime().required(),
				latitude: a.float().required(),
				longitude: a.float().required(),
			})
			.authorization((allow) => [allow.authenticated()])
			.secondaryIndexes((index) => [
				index("workerId").sortKeys(["timestamp"]),
				index("geofenceId").sortKeys(["timestamp"]),
			]),
	})
	.authorization((allow) => [allow.authenticated()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: "userPool",
	},
});
