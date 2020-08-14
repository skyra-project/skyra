/**
 * The PreciseTimeout class in charge to perform high-precision promisified and cancellable timeouts
 * @version 1.0.0
 */
export class PreciseTimeout {
	private readonly kEndsAt: number;
	private stopped = false;
	private resolve: (() => void) | null = null;
	private timeout: NodeJS.Timeout | null = null;

	/**
	 * Create a new PreciseTimeout
	 * @param time The time in milliseconds to run
	 */
	public constructor(time: number) {
		this.kEndsAt = Date.now() + time;
	}

	/**
	 * Run the timeout
	 */
	public async run(): Promise<boolean> {
		if (this.stopped) return false;

		const cb = () => {
			if (Date.now() + 10 >= this.kEndsAt) this.stopped = true;
			this.resolve!();
			this.resolve = null;
		};

		while (!this.stopped) {
			await new Promise<void>((resolve) => {
				this.resolve = resolve;
				this.timeout = setTimeout(cb, Date.now() - this.kEndsAt + 10);
			});
		}

		return true;
	}

	/**
	 * Stop the timeout
	 */
	public stop(): boolean {
		if (this.stopped) return false;

		this.stopped = true;
		if (this.timeout) clearTimeout(this.timeout);
		if (this.resolve) this.resolve();
		return true;
	}
}
