import { ClockScreen } from "@/features/clock/ui/ClockScreen";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { ErrorView } from "@/shared/ui/ErrorView";
import { LoadingView } from "@/shared/ui/LoadingView";

export default function ClockTab() {
	return (
		<AsyncBoundary
			fallback={<LoadingView />}
			errorFallback={({ error, resetErrorBoundary }) => (
				<ErrorView error={error} onRetry={resetErrorBoundary} />
			)}
		>
			<ClockScreen />
		</AsyncBoundary>
	);
}
