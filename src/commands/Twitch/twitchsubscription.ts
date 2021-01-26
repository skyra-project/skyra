import {
	DbSet,
	GuildSettings,
	NotificationsStreamsTwitchEventStatus,
	NotificationsStreamsTwitchStreamer,
	NotificationsStreamTwitch,
	TwitchStreamSubscriptionEntity
} from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { TwitchHelixUsersSearchResult } from '#lib/types/definitions/Twitch';
import { PermissionLevels } from '#lib/types/Enums';
import { Time } from '#utils/constants';
import { requiresPermissions } from '#utils/decorators';
import { TwitchHooksAction } from '#utils/Notifications/Twitch';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Store } from '@sapphire/framework';
import { chunk } from '@sapphire/utilities';
import { Guild, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { Any } from 'typeorm';

type Streamer = TwitchHelixUsersSearchResult;
type Status = NotificationsStreamsTwitchEventStatus;
type Entry = NotificationsStreamsTwitchStreamer;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['twitch-subscription', 't-subscription', 't-sub'],
	description: LanguageKeys.Commands.Twitch.TwitchSubscriptionDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.TwitchSubscriptionExtended,
	permissionLevel: PermissionLevels.Administrator,
	permissions: ['EMBED_LINKS'],
	runIn: ['text'],
	strategyOptions: { flags: ['embed'] },
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#kSettingsKey = GuildSettings.Notifications.Stream.Twitch.Streamers;

	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const status = await args.pick(UserCommand.status);
		const content = await args.rest('string');
		const embed = args.getFlags('embed');
		const entry: Entry = {
			author: message.author.id,
			channel: channel.id,
			createdAt: Date.now(),
			embed,
			gamesBlacklist: [],
			gamesWhitelist: [],
			message: content ?? (embed ? '' : null),
			status
		};

		await message.guild.writeSettings(async (settings) => {
			// then retrieve the index of the entry if the guild already subscribed to them.
			const subscriptionIndex = settings[this.#kSettingsKey].findIndex((sub) => sub[0] === streamer.id);

			// If the subscription could not be found, we create a new one, otherwise we patch it by creating a new tuple.
			if (subscriptionIndex === -1) {
				const subscription: NotificationsStreamTwitch = [streamer.id, [entry]];
				settings[this.#kSettingsKey].push(subscription);

				// Insert the entry to the database performing an upsert, if it created the entry, we tell the Twitch manager
				// to send Twitch a message saying "hey, I want to be notified, can you pass me some data please?"
				if (await this.upsertSubscription(message.guild, streamer)) {
					await this.context.client.twitch.subscriptionsStreamHandle(streamer.id, TwitchHooksAction.Subscribe);
				}
			} else {
				// Retrieve the subscription.
				const raw = settings[this.#kSettingsKey][subscriptionIndex];

				// Check if the streamer was already subscribed for the same channel and status.
				if (raw[1].some((e) => e.channel === entry.channel && e.status === entry.status)) {
					throw args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionAddDuplicated);
				}

				// Patch creating a clone of the value.
				const subscription: NotificationsStreamTwitch = [raw[0], [...raw[1], entry]];
				settings[this.#kSettingsKey].splice(subscriptionIndex, 1, subscription);
			}
		});

		return message.send(
			args.t(
				status === NotificationsStreamsTwitchEventStatus.Offline
					? LanguageKeys.Commands.Twitch.TwitchSubscriptionAddSuccessOffline
					: LanguageKeys.Commands.Twitch.TwitchSubscriptionAddSuccessLive,
				{ name: streamer.display_name, channel: channel.toString() }
			)
		);
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const status = await args.pick(UserCommand.status);
		const { t } = args;

		await message.guild.writeSettings(async (settings) => {
			// then retrieve the index of the entry if the guild already subscribed to them.
			const subscriptionIndex = settings[this.#kSettingsKey].findIndex((sub) => sub[0] === streamer.id);

			// If the subscription could not be found, throw.
			if (subscriptionIndex === -1) throw t(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerNotSubscribed);

			// Retrieve the subscription, then find the index for the notification desired to delete.
			const subscription = settings[this.#kSettingsKey][subscriptionIndex];
			const entryIndex = subscription[1].findIndex((entry) => entry.channel === channel.id && entry.status === status);

			// If there was no entry with the channel and status specified, throw.
			if (entryIndex === -1) throw t(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveEntryNotExists);

			// If it was the only entry for said subscription, remove it completely.
			if (subscription[1].length === 1) {
				settings[this.#kSettingsKey].splice(subscriptionIndex, 1);

				await this.removeSubscription(message.guild, streamer);
			} else {
				// Create a clone of the array, remove the one we want to get rid of, create a clone of the subscription, and update.
				const entries = subscription[1].slice();
				entries.splice(entryIndex, 1);
				const updated: NotificationsStreamTwitch = [subscription[0], entries];
				settings[this.#kSettingsKey].splice(subscriptionIndex, 1, updated);
			}
		});

		return message.send(
			args.t(
				status === NotificationsStreamsTwitchEventStatus.Offline
					? LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessOffline
					: LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessLive,
				{ name: streamer.display_name, channel: channel.toString() }
			)
		);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = args.finished ? null : await args.pick(UserCommand.streamer);
		const { t } = args;

		// If the streamer was not defined, reset all entries and purge all entries.
		if (streamer === null) {
			const [entries] = await message.guild.writeSettings((settings) => {
				const entries = settings[this.#kSettingsKey].reduce((accumulator, subscription) => accumulator + subscription[1].length, 0);
				if (entries === 0) throw t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetEmpty);

				settings[this.#kSettingsKey] = [];
				return [entries];
			});

			// Update all entries that include this guild, then iterate over the empty values and remove the empty ones.
			const { twitchStreamSubscriptions } = await DbSet.connect();
			await twitchStreamSubscriptions.manager.transaction(async (em) => {
				const entries = await em.find(TwitchStreamSubscriptionEntity, { where: { guildIds: Any([message.guild.id]) } });
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

			return message.send(args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetSuccess, { count: entries }));
		}

		/** Remove the subscription for the specified streaming, returning the length of {@link NotificationsStreamsTwitchStreamer} for this entry */
		const entries = await message.guild.writeSettings((settings) => {
			const subscriptionIndex = settings[this.#kSettingsKey].findIndex((sub) => sub[0] === streamer.id);

			if (subscriptionIndex === -1) throw t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetStreamerNotSubscribed);

			const subscription = settings[this.#kSettingsKey][subscriptionIndex];

			settings[this.#kSettingsKey].splice(subscriptionIndex, 1);

			return subscription[1].length;
		});

		await this.removeSubscription(message.guild, streamer);
		return message.send(
			args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetChannelSuccess, { name: streamer.display_name, count: entries })
		);
	}

	@requiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = args.finished ? null : await args.pick(UserCommand.streamer);
		const { t } = args;

		const guildSubscriptions = await message.guild.readSettings(this.#kSettingsKey);

		// Create the response message.
		const response = await sendLoadingMessage(message, t);

		// Fetch the content.
		const content = streamer === null ? await this.showAll(guildSubscriptions, t) : await this.showSingle(guildSubscriptions, streamer, t);

		// Create the pages and the URD to display them.
		const pages = chunk(content, 10);
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setColor(await DbSet.fetchColor(message))
		});
		for (const page of pages) display.addPageEmbed((template) => template.setDescription(page.join('\n')));

		// Start the display and return the message.
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async showSingle(guildSubscriptions: NotificationsStreamTwitch[], streamer: Streamer, t: TFunction) {
		// Retrieve all subscriptions for the guild
		const subscriptions = guildSubscriptions.find((entry) => entry[0] === streamer.id);
		if (typeof subscriptions === 'undefined') throw t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStreamerNotSubscribed);

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
		if (guildSubscriptions.length === 0) throw t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowEmpty);

		// Fetch all usernames and map them by their id.
		const ids = guildSubscriptions.map((subscriptions) => subscriptions[0]);
		const profiles = await this.context.client.twitch.fetchUsers(ids, []);
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

	private async upsertSubscription(guild: Guild, streamer: Streamer) {
		const { twitchStreamSubscriptions } = await DbSet.connect();
		const results = await twitchStreamSubscriptions
			.createQueryBuilder()
			.insert()
			.values({
				id: streamer.id,
				isStreaming: false,
				expiresAt: new Date(Date.now() + Time.Day * 8),
				guildIds: [guild.id]
			})
			.onConflict(/* sql */ `(id) DO UPDATE SET guild_ids = ARRAY_CAT(twitch_stream_subscription.guild_ids, ARRAY['${guild.id}']::VARCHAR[])`)
			.returning(['guild_ids'])
			.execute();
		return results.raw[0].guild_ids.length === 1;
	}

	private async removeSubscription(guild: Guild, streamer: Streamer) {
		const { twitchStreamSubscriptions } = await DbSet.connect();
		const subscription = await twitchStreamSubscriptions.findOne({ id: streamer.id });
		if (!subscription) return;

		const index = subscription.guildIds.indexOf(guild.id);
		if (index === -1) return;

		// If this was the last guild subscribed to this channel, delete it from the database and unsubscribe from the Twitch notifications.
		if (subscription.guildIds.length === 1) {
			await subscription.remove();
			await this.context.client.twitch.subscriptionsStreamHandle(streamer.id, TwitchHooksAction.Unsubscribe);
		} else {
			subscription.guildIds.splice(index, 1);
			await subscription.save();
		}
	}

	private static streamer = Args.make<Streamer>(async (parameter, { argument }) => {
		try {
			const { data } = await Store.injectedContext.client.twitch.fetchUsers([], [parameter]);
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
