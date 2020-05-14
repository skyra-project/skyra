import { Events } from '@lib/types/Enums';
import { TwitchHooksAction } from '@utils/Notifications/Twitch';
import { Colors, Task } from 'klasa';
import { Response } from 'node-fetch';

const b = new Colors({ text: 'lightblue' });
const header = b.format('[TWITCH SUB-UPDATE]');

export default class extends Task {

	public async run() {
		// If we're running in developer mode then just exit early
		if (this.client.options.dev) return;

		// Retrieve all the Twitch subscriptions
		const allSubscriptions = await this.client.queries.fetchAllTwitchStreams();

		// If there are no subscriptions then don't start the process of resubbing
		if (allSubscriptions.length) {
			// Set a constant of the current time
			const currentDate = Date.now();

			// Initialize a set of promises that should be resolved;
			const promises: Promise<Response | boolean>[] = [];

			// A simple ticker to track how many subs were updated for logging
			let updatedSubsTicker = 0;

			// Loop over all subscriptions
			for (const subscription of allSubscriptions) {

				// If the subscription has an expiry date that's before the current date then queue that subscription for refreshing
				if (subscription.expires_at < currentDate) {

					// Increase the updated subcriptions ticker by 1
					updatedSubsTicker++;

					// Queue the updating by pushing the promise into the promises array
					promises.push(
						this.client.twitch.subscriptionsStreamHandle(subscription.id, TwitchHooksAction.Subscribe).catch(error => this.client.emit(Events.Wtf, error)),
						this.client.queries.upsertTwitchStreamSubscription(subscription.id).catch(error => this.client.emit(Events.Wtf, error))
					);
				}
			}

			// Await all the promises
			await Promise.all(promises);

			// ST = Subscriptions Total; SU = Subscriptions Updated
			this.client.emit(Events.Verbose, `${header} [ ${allSubscriptions.length} [ST] ] [ ${updatedSubsTicker} [SU] ]`);
		}
	}

}
