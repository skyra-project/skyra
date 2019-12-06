import { createMethodDecorator } from 'klasa-decorators';
import { Collection, Constructor } from 'discord.js';
import { RateLimit } from 'klasa';
import { createClassDecorator } from './util';
import assert from 'assert';

export const enum LimitErrors {
	Ratelimited = 'RATELIMIT'
}

export interface LimitedClass {
	ratelimits: Collection<string, RateLimit>;
	limiter: boolean;
}

export interface MethodRatelimitedError {
	error: LimitErrors.Ratelimited;
	remainingTime: number;
}

export function classLimitInitialization() {
	return createClassDecorator((Target: Constructor<LimitedClass>) => class extends Target {

		public ratelimits = new Collection<string, RateLimit>();
		public limiter = true;

	});
}

/**
 * @param group The group for which the ratelimits are set
 * @param bucket The amount of allowed actions in the designated time
 * @param cooldown Should be passed in miliseconds
 */
export function limitMethod(group = 'global', bucket: number, cooldown: number) {
	return createMethodDecorator((_target, _propertyKey, descriptor) => {
		const method = descriptor.value;

		if (!method) throw new Error('Function limiter actions require a [[value]].');
		if (typeof method !== 'function') throw new Error('Function limiter actions can only be applied to functions.');

		descriptor.value = (function descriptorValue(this: LimitedClass, ...args: readonly unknown[]) {
			assert(typeof this.limiter === 'boolean');
			if (!this.ratelimits.has(group)) this.ratelimits.set(group, new RateLimit(bucket, cooldown))

			const limit = this.ratelimits.get(group)!;

			if (limit.limited) {
				return {
					error: LimitErrors.Ratelimited,
					remainingTime: limit.remainingTime.toString()
				};
			}

			try {
				limit.drip();
			} catch { }

			return method.call(this, ...args);
		}) as unknown as undefined;
	});
}
