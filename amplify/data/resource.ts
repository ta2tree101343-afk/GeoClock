import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * GeoClock データスキーマ
 *
 * 認可設計:
 * - **Worker**: 自分のレコードのみ read/write (id フィールドが Cognito sub)
 * - **Geofence**: 認証済みユーザーは全員 read/write（TODO: 管理者グループ制限）
 * - **WorkerGeofence**: 自分の割り当てのみ read/write (workerId が Cognito sub)
 * - **AttendanceLog**: 自分の記録のみ read/write (workerId が Cognito sub)
 *
 * ownerDefinedIn("field") は、レコードの該当フィールドに保存されている値と
 * リクエストしているユーザーの Cognito sub を照合して認可判定する。
 */
const schema = a
	.schema({
		Worker: a
			.model({
				email: a.string().required(),
				name: a.string().required(),
			})
			.authorization((allow) => [
				allow.ownerDefinedIn("id").to(["read", "create", "update"]),
			])
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
			.authorization((allow) => [allow.ownerDefinedIn("workerId")])
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
			.authorization((allow) => [
				allow.ownerDefinedIn("workerId").to(["read", "create"]),
			])
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
