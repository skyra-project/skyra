import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { PermissionLevels } from '../../lib/types/Enums';
import { TextChannel } from 'discord.js';
import { NotificationsStreamsTwitchEventStatus, NotificationsStreamsTwitchStreamer, GuildSettings, NotificationsStreamTwitch } from '../../lib/types/settings/GuildSettings';
import { TwitchHelixUsersSearchResult } from '../../lib/types/definitions/Twitch';
import { TwitchHooksAction } from '../../lib/util/Notifications/Twitch';
import { Databases } from '../../lib/types/constants/Constants';

const enum Type {
	Add = 'add',
	Remove = 'remove',
	Clear = 'clear',
	Show = 'show'
}

type Streamer = TwitchHelixUsersSearchResult;
type Channel = TextChannel;
type Status = NotificationsStreamsTwitchEventStatus;
type Content = string;
type Entry = NotificationsStreamsTwitchStreamer;

const $KEY = GuildSettings.Notifications.Streams.Twitch.Streamers;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['twitch-subscription', 't-subscription', 't-sub'],
			description: language => language.tget('COMMAND_TWITCHSUBSCRIPTION_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TWITCHSUBSCRIPTION_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|clear|show:default> (streamer:streamer) (channel:channel) (status:status) (content:content)',
			usageDelim: ' '
		});

		this.createCustomResolver('streamer', async (argument, _possible, message, [type]) => {
			if (!argument) {
				if (type === Type.Show || type === Type.Clear) return undefined;
				throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_STREAMER');
			}

			try {
				const { data } = await this.client.twitch.fetchUsers([argument], [argument]);
				if (data.length === 0) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_STREAMER_NOT_FOUND');
				return data;
			} catch {
				throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_STREAMER_NOT_FOUND');
			}
		}).createCustomResolver('channel', (argument, possible, message, [type]) => {
			if (type === Type.Show || type === Type.Clear) return undefined;
			if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CHANNEL');

			return this.client.arguments.get('textchannel')!.run(argument, possible, message);
		}).createCustomResolver('status', (argument, _possible, message, [type]) => {
			if (type === Type.Show || type === Type.Clear) return undefined;
			if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_STATUS');

			const index = message.language.tget('COMMAND_TWITCHSUBSCRIPTION_STATUS_VALUES').indexOf(argument.toLowerCase());
			if (index === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_INVALID_STATUS');
			return index;
		})
			.createCustomResolver('content', (argument, possible, message, [type]) => {
				if (type === Type.Show || type === Type.Clear || type === Type.Remove) return undefined;
				if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CONTENT');
				return this.client.arguments.get('...string')!.run(argument, possible, message);
			});
	}

	// TODO(kyranet): Disallow entries that have the same channel and the same status
	public async add(message: KlasaMessage, [streamer, channel, status, content]: [Streamer, Channel, Status, Content]) {
		const entry: Entry = {
			author: message.author.id,
			channel: channel.id,
			createdAt: Date.now(),
			embed: null,
			gamesBlacklist: [],
			gamesWhitelist: [],
			message: content,
			status
		};
		const subscriptions = message.guild!.settings.get($KEY);
		const subscriptionIndex = subscriptions.findIndex(sub => sub[0] === streamer.id);

		if (subscriptionIndex === -1) {
			const subscription: NotificationsStreamTwitch = [streamer.id, [entry]];
			await message.guild!.settings.update($KEY, subscription, { arrayAction: 'add', throwOnError: true });
		} else {
			const raw = subscriptions[subscriptionIndex];
			const subscription: NotificationsStreamTwitch = [raw[0], [...raw[1], entry]];
			await message.guild!.settings.update($KEY, subscription, { arrayIndex: subscriptionIndex, throwOnError: true });
		}

		if (await this.client.queries.upsertTwitchStreamSubscription(streamer.id, message.guild!.id)) {
			await this.client.twitch.subscriptionsStreamHandle(streamer.id, TwitchHooksAction.Subscribe);
		}

		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_ADD_SUCCESS', [streamer.display_name, channel.name, status]);
	}

	public async remove(message: KlasaMessage, [streamer, channel, status]: [Streamer, Channel, Status]) {
		const subscriptions = message.guild!.settings.get($KEY);
		const subscriptionIndex = subscriptions.findIndex(sub => sub[0] === streamer.id);
		if (subscriptionIndex === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REMOVE_STREAMER_NOT_SUBSCRIBED');

		const subscription = subscriptions[subscriptionIndex];
		const entryIndex = subscription[1].findIndex(entry => entry.channel === channel.id && entry.status === status);
		if (entryIndex === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REMOVE_ENTRY_NOT_EXISTS');

		if (subscription[1].length === 1) {
			await message.guild!.settings.update($KEY, subscription, { arrayAction: 'remove', arrayIndex: subscriptionIndex, throwOnError: true });
		} else {
			const entries = subscription[1].slice();
			entries.splice(entryIndex, 1);
			const updated: NotificationsStreamTwitch = [subscription[0], entries];
			await message.guild!.settings.update($KEY, updated, { arrayIndex: subscriptionIndex, throwOnError: true });
		}

		if (await this.client.queries.deleteTwitchStreamSubscription(streamer.id, message.guild!.id)) {
			await this.client.providers.default.delete(Databases.TwitchStreamSubscriptions, streamer.id);
			await this.client.twitch.subscriptionsStreamHandle(streamer.id, TwitchHooksAction.Unsubscribe);
		}

		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_REMOVE_SUCCESS', [streamer.display_name, channel.name, status]);
	}

	public async clear(message: KlasaMessage, [streamer]: [Streamer?]) {
		const subscriptions = message.guild!.settings.get($KEY);

		if (typeof streamer === 'undefined') {
			const entries = subscriptions.reduce((accumulator, subscription) => accumulator + subscription[1].length, 0);
			if (entries === 0) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_RESET_EMPTY');
			await message.guild!.settings.reset($KEY);
			return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_RESET_SUCCESS', [entries]);
		}

		const subscriptionIndex = subscriptions.findIndex(sub => sub[0] === streamer.id);
		if (subscriptionIndex === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_RESET_STREAMER_NOT_SUBSCRIBED');
		const subscription = subscriptions[subscriptionIndex];
		const entries = subscription[1].length;
		await message.guild!.settings.update($KEY, subscription, { arrayIndex: subscriptionIndex, arrayAction: 'remove' });
		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_RESET_CHANNEL_SUCCESS', [streamer.display_name, entries]);
	}

	/* eslint-disable */
	// @ts-ignore
	public show(message: KlasaMessage, [streamer]: [Streamer?]) {
		throw new Error('NOT IMPLEMENTED');
	}
	/* eslint-enable */

}
