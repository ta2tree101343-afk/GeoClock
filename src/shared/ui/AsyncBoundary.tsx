import { Suspense, type ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
	errorFallback?: (props: FallbackProps) => ReactNode;
};

export function AsyncBoundary({ children, fallback, errorFallback }: Props) {
	return (
		<ErrorBoundary
			fallbackRender={
				errorFallback ??
				(({ error, resetErrorBoundary }) => (
					<ErrorView error={error} onRetry={resetErrorBoundary} />
				))
			}
		>
			<Suspense fallback={fallback ?? <LoadingView />}>{children}</Suspense>
		</ErrorBoundary>
	);
}
