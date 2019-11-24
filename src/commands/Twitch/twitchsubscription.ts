import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { PermissionLevels } from '../../lib/types/Enums';
import { TextChannel, MessageEmbed } from 'discord.js';
import { NotificationsStreamsTwitchEventStatus, NotificationsStreamsTwitchStreamer, GuildSettings, NotificationsStreamTwitch } from '../../lib/types/settings/GuildSettings';
import { TwitchHelixUsersSearchResult } from '../../lib/types/definitions/Twitch';
import { TwitchHooksAction } from '../../lib/util/Notifications/Twitch';
import { Databases } from '../../lib/types/constants/Constants';
import { chunk } from '@klasa/utils';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { getColor } from '../../lib/util/util';
import { BrandingColors } from '../../lib/util/constants';

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

		this
			.createCustomResolver('streamer', async (argument, _possible, message, [type]) => {
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
			})
			.createCustomResolver('channel', (argument, possible, message, [type]) => {
				if (type === Type.Show || type === Type.Clear) return undefined;
				if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CHANNEL');

				return this.client.arguments.get('textchannel')!.run(argument, possible, message);
			})
			.createCustomResolver('status', (argument, _possible, message, [type]) => {
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
			if (raw[1].some(e => e.channel === entry.channel && e.status === entry.status)) {
				throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_ADD_DUPLICATED');
			}

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

		const updated = await this.client.queries.purgeTwitchStreamGuildSubscriptions(message.guild!.id);
		const pendingToDelete: string[] = [];
		for (const update of updated) {
			if (update.guild_ids.length === 0) pendingToDelete.push(update.id);
		}
		if (updated.length !== 0) await this.client.queries.deleteTwitchStreamSubscriptions(pendingToDelete);

		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_RESET_CHANNEL_SUCCESS', [streamer.display_name, entries]);
	}

	public async show(message: KlasaMessage, [streamer]: [Streamer?]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const content = typeof streamer === 'undefined'
			? await this.showAll(message)
			: this.showSingle(message, streamer);

		const pages = chunk(content, 10);
		const display = new UserRichDisplay(new MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128 }))
			.setColor(getColor(message)));
		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		await display.start(response, message.author.id);
		return response;
	}

	private showSingle(message: KlasaMessage, streamer: Streamer) {
		const guildSubscriptions = message.guild!.settings.get($KEY);
		const subscriptions = guildSubscriptions.find(entry => entry[0] === streamer.id);
		if (typeof subscriptions === 'undefined') throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_STREAMER_NOT_SUBSCRIBED');

		const statuses = message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_STATUS');
		const lines: string[] = [];
		for (const subscription of subscriptions[1]) {
			lines.push(`${streamer.display_name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
		}

		return lines;
	}

	private async showAll(message: KlasaMessage) {
		const guildSubscriptions = message.guild!.settings.get($KEY);
		if (guildSubscriptions.length === 0) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_EMPTY');

		const ids = guildSubscriptions.map(subscriptions => subscriptions[0]);
		const profiles = await this.client.twitch.fetchUsers(ids);
		const names = new Map<string, string>();
		for (const profile of profiles.data) names.set(profile.id, profile.display_name);

		const statuses = message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_STATUS');
		const lines: string[] = [];
		for (const subscriptions of guildSubscriptions) {
			const name = names.get(subscriptions[0]) || message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_UNKNOWN_USER');
			for (const subscription of subscriptions[1]) {
				lines.push(`${name} - <#${subscription.channel}> → ${statuses[subscription.status]}`)
			}
		}

		return lines;
	}

}
