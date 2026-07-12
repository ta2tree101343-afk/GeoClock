import { HomeScreen } from "@/features/home/ui/HomeScreen";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { ErrorView } from "@/shared/ui/ErrorView";
import { LoadingView } from "@/shared/ui/LoadingView";

export default function HomeTab() {
	return (
		<AsyncBoundary
			fallback={<LoadingView />}
			errorFallback={({ error, resetErrorBoundary }) => (
				<ErrorView
					error={error instanceof Error ? error : new Error(String(error))}
					onRetry={resetErrorBoundary}
				/>
			)}
		>
			<HomeScreen />
		</AsyncBoundary>
	);
}
