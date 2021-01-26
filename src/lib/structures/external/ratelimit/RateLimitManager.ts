import Collection from '@discordjs/collection';
import { TimerManager } from '@sapphire/time-utilities';
import { RateLimit } from './RateLimit';

export class RateLimitManager<K = string> extends Collection<K, RateLimit<K>> {
	/**
	 * The amount of milliseconds for the ratelimits from this manager to expire.
	 */
	public time: number;

	/**
	 * The amount of times a RateLimit can drip before it's limited.
	 */
	public limit: number;

	/**
	 * The interval to sweep expired ratelimits.
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#sweepInterval!: NodeJS.Timer | null;

	/**
	 * @param limit The amount of times a RateLimit can drip before it's limited.
	 * @param time The amount of milliseconds for the ratelimits from this manager to expire.
	 */
	public constructor(time: number, limit = 1) {
		super();

		this.time = time;
		this.limit = limit;
	}

	/**
	 * Gets a RateLimit from this manager or creates it if it does not exist.
	 * @param id The id for the RateLimit
	 */
	public acquire(id: K): RateLimit<K> {
		return this.get(id) || this.create(id);
	}

	/**
	 * Creates a RateLimit for this manager.
	 * @param id The id the RateLimit belongs to
	 */
	public create(id: K): RateLimit<K> {
		const ratelimit = new RateLimit(this);
		this.set(id, ratelimit);
		return ratelimit;
	}

	/**
	 * Wraps Collection's set method to set interval to sweep inactive RateLimits.
	 * @param id The id the RateLimit belongs to
	 * @param ratelimit The RateLimit to set
	 */
	public set(id: K, ratelimit: RateLimit<K>): this {
		if (!(ratelimit instanceof RateLimit)) throw new Error('Invalid RateLimit');
		if (!this.#sweepInterval) this.#sweepInterval = TimerManager.setInterval(this.sweep.bind(this), 30000);
		return super.set(id, ratelimit);
	}

	/**
	 * Wraps Collection's sweep method to clear the interval when this manager is empty.
	 * @param fn The filter function
	 * @param thisArg The this for the sweep
	 */
	public sweep(fn: (value: RateLimit<K>, key: K, collection: this) => boolean = (rl): boolean => rl.expired, thisArg?: any): number {
		const amount = super.sweep(fn, thisArg);

		if (this.size === 0) {
			TimerManager.clearInterval(this.#sweepInterval as NodeJS.Timer);
			this.#sweepInterval = null;
		}

		return amount;
	}
}
