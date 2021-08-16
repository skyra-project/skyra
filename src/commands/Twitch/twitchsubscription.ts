import { GuildSubscriptionEntity, TwitchSubscriptionEntity } from '#lib/database';
import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { TwitchEventSubTypes, TwitchHelixUsersSearchResult } from '#lib/types/definitions/Twitch';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, container } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('TWITCH_CALLBACK', 'TWITCH_CLIENT_ID', 'TWITCH_TOKEN', 'TWITCH_EVENTSUB_SECRET'),
	aliases: ['twitch-subscription', 't-subscription', 't-sub'],
	description: LanguageKeys.Commands.Twitch.TwitchSubscriptionDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.TwitchSubscriptionExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: ['EMBED_LINKS'],
	runIn: ['GUILD_ANY'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const subscriptionType = await args.pick(UserCommand.status);
		const customMessage = await args.rest('string', { maximum: 50 }).catch(() => null);

		const { twitchSubscriptions, guildSubscriptions } = this.container.db;

		// Get a potential pre-existing subscription for this streamer and subscriptionType
		const streamerForType = await twitchSubscriptions.findOne({
			where: { streamerId: streamer.id, subscriptionType }
		});
		const guildSubscriptionsForGuild = await guildSubscriptions.find({ where: { guildId: message.guild.id, channel: channel.id } });

		// Check if there is already a subscription for the given streamer, subscription type, and channel:
		const alreadyHasEntry = guildSubscriptionsForGuild.some(
			(guildSubscription) =>
				guildSubscription.subscription.streamerId === streamer.id && guildSubscription.subscription.subscriptionType === subscriptionType
		);

		// If that is the case then throw an error
		if (alreadyHasEntry) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionAddDuplicated);
		}

		// Add a new entry to the "guildSubscriptionsForGuild" for streamer, subscription type, channel and message
		const guildSubscription = new GuildSubscriptionEntity();
		guildSubscription.guildId = message.guild.id;
		guildSubscription.channel = channel.id;
		guildSubscription.message = customMessage ?? undefined;

		if (streamerForType) {
			guildSubscription.subscription = streamerForType;
		} else {
			// Subscribe to the streamer on the Twitch API, returning the ID of the subscription
			const subscriptionId = await this.container.client.twitch.subscriptionsStreamHandle(streamer.id, subscriptionType);
			const twitchSubscriptionEntity = new TwitchSubscriptionEntity();
			twitchSubscriptionEntity.streamerId = streamer.id;
			twitchSubscriptionEntity.subscriptionType = subscriptionType;
			twitchSubscriptionEntity.subscriptionId = subscriptionId;

			guildSubscription.subscription = twitchSubscriptionEntity;
		}

		await guildSubscription.save();

		const content = args.t(
			subscriptionType === TwitchEventSubTypes.StreamOnline
				? LanguageKeys.Commands.Twitch.TwitchSubscriptionAddSuccessLive
				: LanguageKeys.Commands.Twitch.TwitchSubscriptionAddSuccessOffline,
			{ name: streamer.display_name, channel: channel.toString() }
		);

		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const subscriptionType = await args.pick(UserCommand.status);

		const { guildSubscriptions } = this.container.db;

		// Get all subscriptions for the current server and channel combination
		const guildSubscriptionForGuild = await guildSubscriptions.find({ where: { guildId: message.guild.id } });

		if (guildSubscriptionForGuild.length === 0) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveOrResetEmpty);
		}

		const streamers = guildSubscriptionForGuild.filter((guildSubscription) => guildSubscription.subscription.streamerId === streamer.id);

		if (!streamers.length) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerNotSubscribed, { streamer: streamer.display_name });
		}

		const statuses = streamers.filter((guildSubscription) => guildSubscription.subscription.subscriptionType === subscriptionType);

		if (!statuses.length) {
			const subscriptionTypeStatuses = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
			const subscriptionTypeStatus =
				subscriptionType === TwitchEventSubTypes.StreamOnline ? subscriptionTypeStatuses.live : subscriptionTypeStatuses.offline;

			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerStatusNotMatch, {
				streamer: streamer.display_name,
				status: subscriptionTypeStatus
			});
		}

		const streamerWithStatusHasChannel = statuses.some((guildSubscription) => guildSubscription.channel === channel.id);

		if (!streamerWithStatusHasChannel) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveNotToProvidedChannel, { channel });
		}

		// Then if all these cases are okay we call remove
		// Remove is calling a private method in here "removeSubscription"
		// That method has to check if it is this removal is means no guild is subbed to this streamer any more
		// It calls twitch api to remove the sub, otherwise only remove the guild for that streamer

		const content = args.t(
			status === TwitchEventSubTypes.StreamOnline
				? LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessLive
				: LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessOffline,
			{ name: streamer.display_name, channel: channel.toString() }
		);
		return send(message, content);
	}

	// public async remove(message: GuildMessage, args: SkyraCommand.Args) {
	// const streamer = await args.pick(UserCommand.streamer);
	// const channel = await args.pick('channelName');
	// const status = await args.pick(UserCommand.status);

	// 	await writeSettings(message.guild, async (settings) => {
	// 		// Retrieve the index of the entry if the guild already subscribed to them.
	// 		const subscriptionIndexWith = settings[this.#settingsKey].findIndex((sub) => sub.streamerId === streamer.id);

	// 		// If the subscription could not be found, throw.
	// 		if (subscriptionIndexWith === -1) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerNotSubscribed);

	// 		// Retrieve the subscription, then find the index for the notification desired to delete.
	// 		const subscription = settings[this.#settingsKey][subscriptionIndexWith];

	// 		// If the subscription is not for the provided channel, throw.
	// 		if (subscription.channel !== channel.id) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveEntryNotExists);

	// 		// If the subscription is not for the provided status, throw.
	// 		if (subscription.eventSubType !== status) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerStatusNotMatch);

	// 		// If there is only 1 subscription to this streamer then remove it completely.
	// 		if (subscriptionsToStreamer.length === 1) {
	// 			settings[this.#settingsKey].splice(subscriptionIndexWith, 1);

	// 			await this.removeSubscription(message.guild, streamer, status);
	// 		} else {
	// 			// Create a clone of the array, remove the one we want to get rid of, create a clone of the subscription, and update.
	// 			const entries = subscription[1].slice();
	// 			entries.splice(entryIndex, 1);
	// 			const updated: NotificationsStreamTwitch = [subscription[0], entries];
	// 			settings[this.#settingsKey].splice(subscriptionIndexWith, 1, updated);
	// 		}
	// 	});
	// }

	// public async reset(message: GuildMessage, args: SkyraCommand.Args) {
	// 	const streamer = args.finished ? null : await args.pick(UserCommand.streamer);

	// 	// If the streamer was not defined, reset all entries and purge all entries.
	// 	if (streamer === null) {
	// 		const [entries] = await writeSettings(message.guild, (settings) => {
	// 			const entries = settings[this.#settingsKey].reduce((accumulator, subscription) => accumulator + subscription[1].length, 0);
	// 			if (entries === 0) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetEmpty);

	// 			settings[this.#settingsKey] = [];
	// 			return [entries];
	// 		});

	// 		// Update all entries that include this guild, then iterate over the empty values and remove the empty ones.
	// 		const { twitchStreamSubscriptions } = this.container.db;
	// 		await twitchStreamSubscriptions.manager.transaction(async (em) => {
	// 			const entries = await this.getSubscriptions(em, message.guild.id);
	// 			const toUpdate: TwitchStreamSubscriptionEntity[] = [];
	// 			const toDelete: TwitchStreamSubscriptionEntity[] = [];
	// 			for (const entry of entries) {
	// 				if (entry.guildIds.length === 1) {
	// 					toDelete.push(entry);
	// 				} else {
	// 					const index = entry.guildIds.indexOf(message.guild.id);
	// 					if (index === -1) continue;

	// 					entry.guildIds.splice(index, 1);
	// 					toUpdate.push(entry);
	// 				}
	// 			}

	// 			await em.remove(toDelete);
	// 			await em.save(toUpdate);
	// 		});

	// 		const content = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetSuccess, { count: entries });
	// 		return send(message, content);
	// 	}

	// 	/** Remove the subscription for the specified streaming, returning the length of {@link NotificationsStreamsTwitchStreamer} for this entry */
	// 	const entries = await writeSettings(message.guild, (settings) => {
	// 		const subscriptionIndex = settings[this.#settingsKey].findIndex((sub) => sub[0] === streamer.id);

	// 		if (subscriptionIndex === -1) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetStreamerNotSubscribed);

	// 		const subscription = settings[this.#settingsKey][subscriptionIndex];

	// 		settings[this.#settingsKey].splice(subscriptionIndex, 1);

	// 		return subscription[1].length;
	// 	});

	// 	await this.removeSubscription(message.guild, streamer);

	// 	const content = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetChannelSuccess, { name: streamer.display_name, count: entries });
	// 	return send(message, content);
	// }

	// @RequiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	// public async show(message: GuildMessage, args: SkyraCommand.Args) {
	// 	const streamer = args.finished ? null : await args.pick(UserCommand.streamer);
	// 	const { t } = args;

	// 	const guildSubscriptions = await readSettings(message.guild, this.#settingsKey);

	// 	// Create the response message.
	// 	const response = await sendLoadingMessage(message, t);

	// 	// Fetch the content.
	// 	const content = streamer === null ? await this.showAll(guildSubscriptions, t) : await this.showSingle(guildSubscriptions, streamer, t);

	// 	// Create the pages and the URD to display them.
	// 	const pages = chunk(content, 10);
	// 	const display = new SkyraPaginatedMessage({
	// 		template: new MessageEmbed()
	// 			.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
	// 			.setColor(await this.container.db.fetchColor(message))
	// 	});
	// 	for (const page of pages) display.addPageEmbed((embed) => embed.setDescription(page.join('\n')));

	// 	// Start the display and return the message.
	// 	await display.run(response, message.author);
	// 	return response;
	// }

	// private async getAllSubscriptionsForGuild(guildId: string): Promise<GuildTwitchEntity[]> {
	// 	const { guildTwitchNotifications } = this.container.db;

	// 	return guildTwitchNotifications.find({ where: { 'guild.id': guildId } });
	// }

	// private async showSingle(guildSubscriptions: NotificationsStreamTwitch[], streamer: TwitchHelixUsersSearchResult, t: TFunction) {
	// 	// Retrieve all subscriptions for the guild
	// 	const subscriptions = guildSubscriptions.find((entry) => entry[0] === streamer.id);
	// 	if (typeof subscriptions === 'undefined') this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStreamerNotSubscribed);

	// 	// Print all entries for this guild for this streamer.
	// 	const statuses = t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
	// 	const lines: string[] = [];
	// 	for (const subscription of subscriptions[1]) {
	// 		lines.push(`${streamer.display_name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
	// 	}

	// 	return lines;
	// }

	// private async showAll(guildSubscriptions: NotificationsStreamTwitch[], t: TFunction) {
	// 	// Retrieve all subscriptions for the guild
	// 	if (guildSubscriptions.length === 0) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowEmpty);

	// 	// Fetch all usernames and map them by their id.
	// 	const ids = guildSubscriptions.map((subscriptions) => subscriptions[0]);
	// 	const profiles = await this.container.client.twitch.fetchUsers(ids, []);
	// 	const names = new Map<string, string>();
	// 	for (const profile of profiles.data) names.set(profile.id, profile.display_name);

	// 	// Print all entries for this guild.
	// 	const statuses = t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
	// 	const lines: string[] = [];
	// 	for (const subscriptions of guildSubscriptions) {
	// 		const name = names.get(subscriptions[0]) || t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowUnknownUser);
	// 		for (const subscription of subscriptions[1]) {
	// 			lines.push(`${name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
	// 		}
	// 	}

	// 	return lines;
	// }

	// private async removeSubscription(guild: Guild, streamer: TwitchHelixUsersSearchResult) {
	// 	const { twitchStreamSubscriptions } = this.container.db;
	// 	const subscription = await twitchStreamSubscriptions.findOne({ id: streamer.id });
	// 	if (!subscription) return;

	// 	const index = subscription.guildIds.indexOf(guild.id);
	// 	if (index === -1) return;

	// 	// If this was the last guild subscribed to this channel, delete it from the database and unsubscribe from the Twitch notifications.
	// 	if (subscription.guildIds.length === 1) {
	// 		await subscription.remove();
	// 		this.container.client.twitch.removeSubscription(subscription.subscriptionId);
	// 	} else {
	// 		subscription.guildIds.splice(index, 1);
	// 		await subscription.save();
	// 	}
	// }

	// private async removeSubscription(guild: Guild, streamer: TwitchHelixUsersSearchResult, twitchSubscriptionType?: TwitchEventSubTypes) {
	// 	const { twitchStreamSubscriptions } = this.container.db;

	// 	if (twitchSubscriptionType) {
	// 		const subscription = await twitchStreamSubscriptions.findOne({ id: streamer.id, subscriptionType: twitchSubscriptionType });
	// 		if (!subscription) return;

	// 		await this.removeOneSubscription(subscription, guild);
	// 	} else {
	// 		const subscriptions = await twitchStreamSubscriptions.find({ id: streamer.id });
	// 		if (!subscriptions.length) return;

	// 		await Promise.all(subscriptions.map((sub) => this.removeOneSubscription(sub, guild)));
	// 	}
	// }

	// private async removeOneSubscription(subscription: TwitchStreamSubscriptionEntity, guild: Guild) {
	// 	const index = subscription.guildIds.indexOf(guild.id);
	// 	if (index === -1) return;

	// 	// If this was the last guild subscribed to this channel, delete it from the database and unsubscribe from the Twitch notifications.
	// 	if (subscription.guildIds.length === 1) {
	// 		await subscription.remove();
	// 		this.container.client.twitch.removeSubscription(subscription.subscriptionId);
	// 	} else {
	// 		subscription.guildIds.splice(index, 1);
	// 		await subscription.save();
	// 	}
	// }

	private static streamer = Args.make<TwitchHelixUsersSearchResult>(async (parameter, { argument }) => {
		try {
			const { data } = await container.client.twitch.fetchUsers([], [parameter]);
			if (data.length > 0) return Args.ok(data[0]);
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Twitch.TwitchSubscriptionStreamerNotFound });
		} catch {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Twitch.TwitchSubscriptionStreamerNotFound });
		}
	});

	private static status = Args.make<TwitchEventSubTypes>((parameter, { args, argument }) => {
		const index = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionStatusValues).indexOf(parameter.toLowerCase());
		if (index === -1) return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Twitch.TwitchSubscriptionInvalidStatus });
		if (index === 0) return Args.ok(TwitchEventSubTypes.StreamOnline);
		return Args.ok(TwitchEventSubTypes.StreamOffline);
	});
}
