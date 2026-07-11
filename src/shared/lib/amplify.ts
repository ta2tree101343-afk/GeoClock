import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import outputs from "../../../amplify_outputs.json";

let configured = false;

export function configureAmplify(): void {
	if (configured) return;
	Amplify.configure(outputs);
	configured = true;
}

/**
 * Amplify Data クライアントの singleton
 * 各 feature の services.ts / tasks.ts からこれを import する
 */
export const client = generateClient<Schema>({
	authMode: "userPool",
});
