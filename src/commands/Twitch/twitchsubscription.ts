import {
	GuildSettings,
	NotificationsStreamsTwitchEventStatus,
	NotificationsStreamsTwitchStreamer,
	NotificationsStreamTwitch,
	readSettings,
	TwitchStreamSubscriptionEntity,
	writeSettings
} from '#lib/database';
import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { TwitchHelixUsersSearchResult, TwitchSubscriptionTypes } from '#lib/types/definitions/Twitch';
import { PermissionLevels } from '#lib/types/Enums';
import { days } from '#utils/common';
import { RequiresPermissions } from '#utils/decorators';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, container } from '@sapphire/framework';
import { chunk } from '@sapphire/utilities';
import { send } from '@skyra/editable-commands';
import { Guild, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import type { EntityManager } from 'typeorm';

type Streamer = TwitchHelixUsersSearchResult;
type Status = NotificationsStreamsTwitchEventStatus;
type Entry = NotificationsStreamsTwitchStreamer;

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('TWITCH_CALLBACK', 'TWITCH_CLIENT_ID', 'TWITCH_TOKEN', 'TWITCH_EVENTSUB_SECRET'),
	aliases: ['twitch-subscription', 't-subscription', 't-sub'],
	generateDashLessAliases: true,
	description: LanguageKeys.Commands.Twitch.TwitchSubscriptionDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.TwitchSubscriptionExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: ['EMBED_LINKS'],
	runIn: ['GUILD_ANY'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#settingsKey = GuildSettings.Notifications.Stream.Twitch.Streamers;

	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const status = await args.pick(UserCommand.status);
		const entry: Entry = {
			author: message.author.id,
			channel: channel.id,
			createdAt: Date.now(),
			gamesBlacklist: [],
			gamesWhitelist: [],
			message: await args.rest('string').catch(() => null),
			status
		};

		await writeSettings(message.guild, async (settings) => {
			// First we check if we already have a subscription to the provided streamer
			// by checking if the ID of that stream appears in the list of subscribed IDs.
			const subscriptionIndex = settings[this.#settingsKey].findIndex((sub) => sub[0] === streamer.id);

			// If the subscription could not be found, we create a new one. Otherwise we patch it by creating a new tuple.
			if (subscriptionIndex === -1) {
				// Resolve the correct Twitch subscription type based on arg input
				const twitchSubscriptionType =
					status === NotificationsStreamsTwitchEventStatus.Online
						? TwitchSubscriptionTypes.StreamOnline
						: TwitchSubscriptionTypes.StreamOffline;

				// Subscribe to the streamer on the Twitch API, returning the ID of the subscription
				const subscriptionId = await this.container.client.twitch.subscriptionsStreamHandle(streamer.id, twitchSubscriptionType);

				// Insert the entry into the database through an upsert.
				await this.upsertSubscription(message.guild, streamer, subscriptionId, twitchSubscriptionType);

				// Store the subscription in the server's guild table
				const subscription: NotificationsStreamTwitch = [streamer.id, [entry]];
				settings[this.#settingsKey].push(subscription);
			} else {
				// Retrieve the subscription.
				const raw = settings[this.#settingsKey][subscriptionIndex];

				// Check if the streamer was already subscribed for the same channel and status.
				if (raw[1].some((e) => e.channel === entry.channel && e.status === entry.status)) {
					this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionAddDuplicated);
				}

				// Patch creating a clone of the value.
				const subscription: NotificationsStreamTwitch = [raw[0], [...raw[1], entry]];
				settings[this.#settingsKey].splice(subscriptionIndex, 1, subscription);
			}
		});

		const content = args.t(
			status === NotificationsStreamsTwitchEventStatus.Offline
				? LanguageKeys.Commands.Twitch.TwitchSubscriptionAddSuccessOffline
				: LanguageKeys.Commands.Twitch.TwitchSubscriptionAddSuccessLive,
			{ name: streamer.display_name, channel: channel.toString() }
		);
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const status = await args.pick(UserCommand.status);

		await writeSettings(message.guild, async (settings) => {
			// Retrieve the index of the entry if the guild already subscribed to them.
			const subscriptionIndex = settings[this.#settingsKey].findIndex((sub) => sub[0] === streamer.id);

			// If the subscription could not be found, throw.
			if (subscriptionIndex === -1) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerNotSubscribed);

			// Retrieve the subscription, then find the index for the notification desired to delete.
			const subscription = settings[this.#settingsKey][subscriptionIndex];
			const entryIndex = subscription[1].findIndex((entry) => entry.channel === channel.id && entry.status === status);

			// If there was no entry with the channel and status specified, throw.
			if (entryIndex === -1) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveEntryNotExists);

			// If it was the only entry for said subscription, remove it completely.
			if (subscription[1].length === 1) {
				settings[this.#settingsKey].splice(subscriptionIndex, 1);

				await this.removeSubscription(message.guild, streamer);
			} else {
				// Create a clone of the array, remove the one we want to get rid of, create a clone of the subscription, and update.
				const entries = subscription[1].slice();
				entries.splice(entryIndex, 1);
				const updated: NotificationsStreamTwitch = [subscription[0], entries];
				settings[this.#settingsKey].splice(subscriptionIndex, 1, updated);
			}
		});

		const content = args.t(
			status === NotificationsStreamsTwitchEventStatus.Offline
				? LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessOffline
				: LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessLive,
			{ name: streamer.display_name, channel: channel.toString() }
		);
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = args.finished ? null : await args.pick(UserCommand.streamer);

		// If the streamer was not defined, reset all entries and purge all entries.
		if (streamer === null) {
			const [entries] = await writeSettings(message.guild, (settings) => {
				const entries = settings[this.#settingsKey].reduce((accumulator, subscription) => accumulator + subscription[1].length, 0);
				if (entries === 0) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetEmpty);

				settings[this.#settingsKey] = [];
				return [entries];
			});

			// Update all entries that include this guild, then iterate over the empty values and remove the empty ones.
			const { twitchStreamSubscriptions } = this.container.db;
			await twitchStreamSubscriptions.manager.transaction(async (em) => {
				const entries = await this.getSubscriptions(em, message.guild.id);
				const toUpdate: TwitchStreamSubscriptionEntity[] = [];
				const toDelete: TwitchStreamSubscriptionEntity[] = [];
				for (const entry of entries) {
					if (entry.guildIds.length === 1) {
						toDelete.push(entry);
					} else {
						const index = entry.guildIds.indexOf(message.guild.id);
						if (index === -1) continue;

						entry.guildIds.splice(index, 1);
						toUpdate.push(entry);
					}
				}

				await em.remove(toDelete);
				await em.save(toUpdate);
			});

			const content = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetSuccess, { count: entries });
			return send(message, content);
		}

		/** Remove the subscription for the specified streaming, returning the length of {@link NotificationsStreamsTwitchStreamer} for this entry */
		const entries = await writeSettings(message.guild, (settings) => {
			const subscriptionIndex = settings[this.#settingsKey].findIndex((sub) => sub[0] === streamer.id);

			if (subscriptionIndex === -1) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetStreamerNotSubscribed);

			const subscription = settings[this.#settingsKey][subscriptionIndex];

			settings[this.#settingsKey].splice(subscriptionIndex, 1);

			return subscription[1].length;
		});

		await this.removeSubscription(message.guild, streamer);

		const content = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetChannelSuccess, { name: streamer.display_name, count: entries });
		return send(message, content);
	}

	@RequiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = args.finished ? null : await args.pick(UserCommand.streamer);
		const { t } = args;

		const guildSubscriptions = await readSettings(message.guild, this.#settingsKey);

		// Create the response message.
		const response = await sendLoadingMessage(message, t);

		// Fetch the content.
		const content = streamer === null ? await this.showAll(guildSubscriptions, t) : await this.showSingle(guildSubscriptions, streamer, t);

		// Create the pages and the URD to display them.
		const pages = chunk(content, 10);
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setColor(await this.container.db.fetchColor(message))
		});
		for (const page of pages) display.addPageEmbed((embed) => embed.setDescription(page.join('\n')));

		// Start the display and return the message.
		await display.run(response, message.author);
		return response;
	}

	private async showSingle(guildSubscriptions: NotificationsStreamTwitch[], streamer: Streamer, t: TFunction) {
		// Retrieve all subscriptions for the guild
		const subscriptions = guildSubscriptions.find((entry) => entry[0] === streamer.id);
		if (typeof subscriptions === 'undefined') this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStreamerNotSubscribed);

		// Print all entries for this guild for this streamer.
		const statuses = t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
		const lines: string[] = [];
		for (const subscription of subscriptions[1]) {
			lines.push(`${streamer.display_name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
		}

		return lines;
	}

	private async showAll(guildSubscriptions: NotificationsStreamTwitch[], t: TFunction) {
		// Retrieve all subscriptions for the guild
		if (guildSubscriptions.length === 0) this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowEmpty);

		// Fetch all usernames and map them by their id.
		const ids = guildSubscriptions.map((subscriptions) => subscriptions[0]);
		const profiles = await this.container.client.twitch.fetchUsers(ids, []);
		const names = new Map<string, string>();
		for (const profile of profiles.data) names.set(profile.id, profile.display_name);

		// Print all entries for this guild.
		const statuses = t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
		const lines: string[] = [];
		for (const subscriptions of guildSubscriptions) {
			const name = names.get(subscriptions[0]) || t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowUnknownUser);
			for (const subscription of subscriptions[1]) {
				lines.push(`${name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
			}
		}

		return lines;
	}

	private async getSubscriptions(entityManager: EntityManager, ...guildIds: string[]): Promise<TwitchStreamSubscriptionEntity[]> {
		return entityManager
			.createQueryBuilder(TwitchStreamSubscriptionEntity, 'twitchsubs')
			.where('twitchsubs.guild_ids IN (:ids)', { ids: guildIds })
			.getMany();
	}

	private async upsertSubscription(
		guild: Guild,
		streamer: Streamer,
		subscriptionId: string,
		subscriptionType: TwitchSubscriptionTypes
	): Promise<void> {
		const { twitchStreamSubscriptions } = this.container.db;

		await twitchStreamSubscriptions
			.createQueryBuilder()
			.insert()
			.values({
				id: streamer.id,
				subscriptionId,
				subscriptionType,
				expiresAt: new Date(Date.now() + days(8)),
				guildIds: [guild.id]
			})
			.onConflict(
				/* sql */ `(id, subscription_type) DO UPDATE SET guild_ids = ARRAY_CAT(twitch_stream_subscription.guild_ids, ARRAY['${guild.id}']::VARCHAR[])`
			)
			.execute();
	}

	private async removeSubscription(guild: Guild, streamer: Streamer) {
		const { twitchStreamSubscriptions } = this.container.db;
		const subscription = await twitchStreamSubscriptions.findOne({ id: streamer.id });
		if (!subscription) return;

		const index = subscription.guildIds.indexOf(guild.id);
		if (index === -1) return;

		// If this was the last guild subscribed to this channel, delete it from the database and unsubscribe from the Twitch notifications.
		if (subscription.guildIds.length === 1) {
			await subscription.remove();
			this.container.client.twitch.removeSubscription(subscription.subscriptionId);
		} else {
			subscription.guildIds.splice(index, 1);
			await subscription.save();
		}
	}

	private static streamer = Args.make<Streamer>(async (parameter, { argument }) => {
		try {
			const { data } = await container.client.twitch.fetchUsers([], [parameter]);
			if (data.length > 0) return Args.ok(data[0]);
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Twitch.TwitchSubscriptionStreamerNotFound });
		} catch {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Twitch.TwitchSubscriptionStreamerNotFound });
		}
	});

	private static status = Args.make<Status>((parameter, { args, argument }) => {
		const index = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionStatusValues).indexOf(parameter.toLowerCase());
		if (index === -1) return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Twitch.TwitchSubscriptionInvalidStatus });
		return Args.ok(index);
	});
}
