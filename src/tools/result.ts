export interface Success<T> {
	status: "success";
	data: T;
}

export interface Error {
	status: "error";
	message?: string;
}

export type Result<T> = Success<T> | Error;

export function success<T>(data: T): Success<T> {
	return { status: "success", data: data };
}

export function error(message?: string): Error {
	return { status: "error", message: message };
}
