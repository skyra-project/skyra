import { Result } from '@sapphire/framework';
import { RateLimitManager } from '@sapphire/ratelimits';
import { Time } from '@sapphire/time-utilities';

const manager = new RateLimitManager(Time.Minute * 3000, 1);

export function streamNotificationDrip(id: string) {
	return Result.from(() => manager.acquire(id).consume()).isOk();
}
