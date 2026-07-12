import { HistoryScreen } from "@/features/attendance-log/ui/HistoryScreen";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { ErrorView } from "@/shared/ui/ErrorView";
import { LoadingView } from "@/shared/ui/LoadingView";

export default function HistoryTab() {
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
			<HistoryScreen />
		</AsyncBoundary>
	);
}
