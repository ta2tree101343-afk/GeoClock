import { defineAuth } from "@aws-amplify/backend";

/**
 * 労働者向け Cognito ユーザープール
 * - メール + パスワード認証
 * - 管理者がユーザーを作成する運用のため、セルフサインアップは無効
 * - 初回ログイン時に NEW_PASSWORD_REQUIRED でパスワード変更を強制
 * - 名前属性（givenName）を必須にする（Worker.name として使用）
 */
export const auth = defineAuth({
	loginWith: {
		email: true,
	},
	userAttributes: {
		givenName: {
			required: true,
			mutable: true,
		},
	},
});
