/**
 * The FetchError class which is thrown in Utils.fetch
 */
export class FetchError extends Error {
	/** The requested url. */
	public readonly url: string;
	/** The HTTP status code. */
	public readonly code: number;
	/** The response returned as a string. */
	public readonly response: string;
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#json: unknown;

	public constructor(url: string | URL, code: number, response: string) {
		super(`Failed to request '${url}' with code ${code}.`);
		this.url = typeof url === 'string' ? url : url.href;
		this.code = code;
		this.response = response;
		this.#json = null;
	}

	public toJSON() {
		return this.#json ?? (this.#json = JSON.parse(this.response));
	}
}
