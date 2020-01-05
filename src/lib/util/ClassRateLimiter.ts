import Collection from '@discordjs/collection';
import { Time } from '@utils/constants';
import { createClassDecorator } from '@utils/util';
import { Constructor } from 'discord.js';
import { RateLimitManager } from 'klasa';
import { createMethodDecorator } from 'klasa-decorators';

export function classInitialization() {
	return createClassDecorator((target: Constructor<LimitedClass>) => class extends target {

		public ratelimits: Collection<string, RateLimitManager> = new Collection();
		public limiter = true;

	});
}

export function limitMethod(group: string, bucket: number, cooldown: number) {
	return createMethodDecorator((_target, _propertyKey, descriptor) => {
		const method = descriptor.value;

		if (!method) throw new Error('Function limiter actions require a [[value]].');
		if (typeof method !== 'function') throw new Error('Function limiter actions can only be applied to functions.');

		descriptor.value = (function descriptorValue(this: LimitedClass, ...args: any[]) {
			if (!this.limiter as boolean) throw new Error('Class does not posses a limiter');
			if (!this.ratelimits.has(group)) this.ratelimits.set(group, new RateLimitManager(bucket > 2 ? bucket - 1 : bucket, cooldown + (Time.Second as number)));

			const manager = this.ratelimits.get(group);
			const id = Date.now().toString(8);
			const bucketInstance = manager!.acquire(id);

			if (bucketInstance.limited) {
				return {
					error: 'RATELIMIT',
					remainingTime: bucketInstance.remainingTime.toString()
				};
			}

			try {
				bucketInstance.drip();
			} catch { }

			return method.call(this, ...args);
		}) as unknown as undefined;
	});
}

export interface LimitedClass {
	ratelimits: Collection<string, RateLimitManager>;
	limiter: boolean;
}

export interface MethodLimitError {
	error: 'RATELIMIT';
	remainingTime: number;
}
