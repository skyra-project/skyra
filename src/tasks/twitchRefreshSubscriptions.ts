import { PartialResponseValue, ResponseType, Task, TwitchSubscriptionEntity } from '#lib/database';
import { blueBright } from 'colorette';
import type { Repository } from 'typeorm';

const header = blueBright('[TWITCH SUB-UPDATE]');

export class UserTask extends Task {
	public async run(): Promise<PartialResponseValue | null> {
		const { client, logger, db } = this.container;
		// If we're running in developer mode then just exit early
		if (client.dev) return { type: ResponseType.Finished };

		// Retrieve all the Twitch subscriptions
		const { twitchSubscriptions } = db;
		const allSubscriptions = await twitchSubscriptions.find();

		// If there are no subscriptions then just exit early
		if (allSubscriptions.length === 0) return null;

		// Set a constant of the current time
		const currentDate = Date.now();

		// Initialize a set of promises that should be resolved;
		const promises: Promise<unknown>[] = [];

		// An array to keep track of the IDs of the subscriptions that were updated
		// Used for logging and knowing which entries to update in the database
		const updatedSubscriptionIds: number[] = [];

		// Loop over all subscriptions
		for (const subscription of allSubscriptions) {
			// If the subscription has an expiry date that's before the current date then queue that subscription for refreshing
			if (subscription.expiresAt.getTime() < currentDate) {
				// Add the ID to the updatedSubscriptionIds array
				updatedSubscriptionIds.push(subscription.id);

				// Queue the updating by pushing the promise into the promises array
				promises.push(
					client.twitch.subscriptionsStreamHandle(subscription.streamerId, subscription.subscriptionType).catch(logger.fatal.bind(logger))
				);
			}
		}

		promises.unshift(this.updateEntries(updatedSubscriptionIds, twitchSubscriptions));

		// Await all the promises
		await Promise.all(promises);

		// ST = Subscriptions Total; SU = Subscriptions Updated
		logger.trace(`${header} [ ${allSubscriptions.length} [ST] ] [ ${updatedSubscriptionIds.length} [SU] ]`);

		return null;
	}

	private updateEntries(ids: number[], repository: Repository<TwitchSubscriptionEntity>) {
		const newExpireAt = new Date();
		newExpireAt.setDate(newExpireAt.getDate() + 8);

		return repository.createQueryBuilder().update().set({ expiresAt: newExpireAt }).where('id IN (:...ids)', { ids }).execute();
	}
}
