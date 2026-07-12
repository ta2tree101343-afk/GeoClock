import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * GeoClock データスキーマ
 *
 * 認可設計:
 * - **Worker**: 自分のレコードのみ read/create/update (id フィールドが Cognito sub) + Admin は全操作
 * - **Geofence**: 認証済みユーザーは read のみ + Admin は全操作
 * - **WorkerGeofence**: 自分の割り当てを read (workerId が Cognito sub) + Admin は全操作
 * - **AttendanceLog**: 自分の記録を read/create (workerId が Cognito sub) + Admin は read (レポート用)
 *
 * ownerDefinedIn("field") は、レコードの該当フィールドに保存されている値と
 * リクエストしているユーザーの Cognito sub を照合して認可判定する。
 * allow.group("Admin") は Cognito の Admin グループに属するユーザーに指定操作を許可する。
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
				allow.group("Admin"),
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
			.authorization((allow) => [
				allow.authenticated().to(["read"]),
				allow.group("Admin"),
			]),

		WorkerGeofence: a
			.model({
				workerId: a.string().required(),
				geofenceId: a.string().required(),
				assignedAt: a.datetime().required(),
			})
			.authorization((allow) => [
				allow.ownerDefinedIn("workerId").to(["read"]),
				allow.group("Admin"),
			])
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
				allow.group("Admin").to(["read"]),
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
