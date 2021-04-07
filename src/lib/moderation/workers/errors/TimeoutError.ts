export class TimeoutError extends Error {
	public constructor() {
		super('Reached Timeout');
	}
}
