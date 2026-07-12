import { useSetAtom } from "jotai";
import { signOutAction } from "./stores";

export function useSignOut(): () => void {
	const signOut = useSetAtom(signOutAction);
	return () => {
		signOut();
	};
}
