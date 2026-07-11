import { AppError } from "../../shared/lib/errors";

export type WorkerProfile = {
	id: string;
	email: string;
	name: string;
};

export class WorkerError extends AppError {
	readonly code = "WORKER_ERROR";
}
