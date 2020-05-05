import { chunk } from '@klasa/utils';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Databases } from '@lib/types/constants/Constants';
import { TwitchKrakenChannelSearchResult } from '@lib/types/definitions/Twitch';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings, NotificationsStreamsTwitchEventStatus, NotificationsStreamsTwitchStreamer, NotificationsStreamTwitch } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { TwitchHooksAction } from '@utils/Notifications/Twitch';
import { getColor } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

const enum Type {
	Add = 'add',
	Remove = 'remove',
	Reset = 'reset',
	Show = 'show'
}

type Streamer = TwitchKrakenChannelSearchResult;
type Channel = TextChannel;
type Status = NotificationsStreamsTwitchEventStatus;
type Content = string;
type Entry = NotificationsStreamsTwitchStreamer;

const $KEY = GuildSettings.Notifications.Streams.Twitch.Streamers;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['twitch-subscription', 't-subscription', 't-sub'],
	description: language => language.tget('COMMAND_TWITCHSUBSCRIPTION_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_TWITCHSUBSCRIPTION_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|reset|show:default> (streamer:streamer) (channel:channel) (status:status) (content:content)',
	usageDelim: ' ',
	flagSupport: true
})
export default class extends SkyraCommand {

	public async init() {
		this
			.createCustomResolver('streamer', async (argument, _possible, message, [type]) => {
				if (!argument) {
					if (type === Type.Show || type === Type.Reset) return undefined;
					throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_STREAMER');
				}

				try {
					const { users } = await this.client.twitch.fetchUsersByLogin([argument]);
					if (users.length === 0) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_STREAMER_NOT_FOUND');
					return users[0];
				} catch {
					throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_STREAMER_NOT_FOUND');
				}
			})
			.createCustomResolver('channel', (argument, possible, message, [type]) => {
				if (type === Type.Show || type === Type.Reset) return undefined;
				if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CHANNEL');

				return this.client.arguments.get('textchannelname')!.run(argument, possible, message);
			})
			.createCustomResolver('status', (argument, _possible, message, [type]) => {
				if (type === Type.Show || type === Type.Reset) return undefined;
				if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_STATUS');

				const index = message.language.tget('COMMAND_TWITCHSUBSCRIPTION_STATUS_VALUES').indexOf(argument.toLowerCase());
				if (index === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_INVALID_STATUS');
				return index;
			})
			.createCustomResolver('content', (argument, possible, message, [type, , , status]) => {
				// If the subcommand is Show, Reset, or Remove
				if (
					type === Type.Show
					|| type === Type.Reset
					|| type === Type.Remove
					// or if the command is Add, the flagArgs include --embed and the status is online then allow no content
					|| (type === Type.Add && Boolean(message.flagArgs.embed) && status === 0)
				) return undefined;
				if (!argument) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CONTENT');
				return this.client.arguments.get('...string')!.run(argument, possible, message);
			});
	}

	public async add(message: KlasaMessage, [streamer, channel, status, content]: [Streamer, Channel, Status, Content]) {
		const entry: Entry = {
			author: message.author.id,
			channel: channel.id,
			createdAt: Date.now(),
			embed: Boolean(message.flagArgs.embed),
			gamesBlacklist: [],
			gamesWhitelist: [],
			message: content,
			status
		};

		// Retrieve all subscriptions for the guild,
		// then retrieve the index of the entry if the guild already subscribed to them.
		const subscriptions = message.guild!.settings.get($KEY);
		const subscriptionIndex = subscriptions.findIndex(sub => sub[0] === streamer._id);

		// If the subscription could not be found, we create a new one, otherwise we patch it by creating a new tuple.
		if (subscriptionIndex === -1) {
			const subscription: NotificationsStreamTwitch = [streamer._id, [entry]];
			await message.guild!.settings.update($KEY, [subscription], {
				arrayAction: 'add',
				extraContext: { author: message.author.id }
			});

			// Insert the entry to the database performing an upsert, if it created the entry, we tell the Twitch manager
			// to send Twitch a message saying "hey, I want to be notified, can you pass me some data please?"
			if (await this.client.queries.upsertTwitchStreamSubscription(streamer._id, message.guild!.id)) {
				await this.client.twitch.subscriptionsStreamHandle(streamer._id, TwitchHooksAction.Subscribe);
			}
		} else {
			// Retrieve the subscription.
			const raw = subscriptions[subscriptionIndex];

			// Check if the streamer was already subscribed for thesame channel and status.
			if (raw[1].some(e => e.channel === entry.channel && e.status === entry.status)) {
				throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_ADD_DUPLICATED');
			}

			// Patch creating a clone of the value.
			const subscription: NotificationsStreamTwitch = [raw[0], [...raw[1], entry]];
			await message.guild!.settings.update($KEY, [subscription], {
				arrayIndex: subscriptionIndex,
				extraContext: { author: message.author.id }
			});
		}

		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_ADD_SUCCESS', [streamer.display_name, channel.name, status]);
	}

	public async remove(message: KlasaMessage, [streamer, channel, status]: [Streamer, Channel, Status]) {
		// Retrieve all subscriptions for the guild,
		// then retrieve the index of the entry if the guild already subscribed to them.
		const subscriptions = message.guild!.settings.get($KEY);
		const subscriptionIndex = subscriptions.findIndex(sub => sub[0] === streamer._id);

		// If the subscription could not be found, throw.
		if (subscriptionIndex === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REMOVE_STREAMER_NOT_SUBSCRIBED');

		// Retrieve the subscription, then find the index for the notification desired to delete.
		const subscription = subscriptions[subscriptionIndex];
		const entryIndex = subscription[1].findIndex(entry => entry.channel === channel.id && entry.status === status);

		// If there was no entry with the channel and status specified, throw.
		if (entryIndex === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_REMOVE_ENTRY_NOT_EXISTS');

		// If it was the only entry for said subscription, remove it completely.
		if (subscription[1].length === 1) {
			await message.guild!.settings.update($KEY, [subscription], {
				arrayAction: 'remove',
				arrayIndex: subscriptionIndex,
				extraContext: { author: message.author.id }
			});

			// If this was the last guild subscribed to this channel, delete it from the database and unsubscribe from the Twitch notifications.
			if (await this.client.queries.deleteTwitchStreamSubscription(streamer._id, message.guild!.id)) {
				await this.client.providers.default!.delete(Databases.TwitchStreamSubscriptions, streamer._id);
				await this.client.twitch.subscriptionsStreamHandle(streamer._id, TwitchHooksAction.Unsubscribe);
			}
		} else {
			// Create a clone of the array, remove the one we want to get rid of, create a clone of the subscription, and update.
			const entries = subscription[1].slice();
			entries.splice(entryIndex, 1);
			const updated: NotificationsStreamTwitch = [subscription[0], entries];
			await message.guild!.settings.update($KEY, [updated], {
				arrayIndex: subscriptionIndex,
				extraContext: { author: message.author.id }
			});
		}

		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_REMOVE_SUCCESS', [streamer.display_name, channel.name, status]);
	}

	public async reset(message: KlasaMessage, [streamer]: [Streamer?]) {
		// Retrieve all subscriptions for the guild
		const subscriptions = message.guild!.settings.get($KEY);

		// If the streamer was not defined, reset all entries and purge all entries.
		if (typeof streamer === 'undefined') {
			const entries = subscriptions.reduce((accumulator, subscription) => accumulator + subscription[1].length, 0);
			if (entries === 0) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_RESET_EMPTY');
			await message.guild!.settings.reset($KEY);

			// Update all entries that include this guild, then iterate over the empty values and remove the empty ones.
			const updated = await this.client.queries.purgeTwitchStreamGuildSubscriptions(message.guild!.id);
			const pendingToDelete: string[] = [];
			for (const update of updated) {
				if (update.guild_ids.length === 0) pendingToDelete.push(update.id);
			}
			if (updated.length !== 0) await this.client.queries.deleteTwitchStreamSubscriptions(pendingToDelete);
			return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_RESET_SUCCESS', [entries]);
		}

		const subscriptionIndex = subscriptions.findIndex(sub => sub[0] === streamer._id);
		if (subscriptionIndex === -1) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_RESET_STREAMER_NOT_SUBSCRIBED');
		const subscription = subscriptions[subscriptionIndex];
		const entries = subscription[1].length;
		await message.guild!.settings.update($KEY, [subscription], {
			arrayIndex: subscriptionIndex,
			arrayAction: 'remove',
			extraContext: { author: message.author.id }
		});

		// If this was the last guild subscribed to this channel, delete it from the database and unsubscribe from the Twitch notifications.
		if (await this.client.queries.deleteTwitchStreamSubscription(streamer._id, message.guild!.id)) {
			await this.client.providers.default!.delete(Databases.TwitchStreamSubscriptions, streamer._id);
			await this.client.twitch.subscriptionsStreamHandle(streamer._id, TwitchHooksAction.Unsubscribe);
		}

		return message.sendLocale('COMMAND_TWITCHSUBSCRIPTION_RESET_CHANNEL_SUCCESS', [streamer.display_name, entries]);
	}

	public async show(message: KlasaMessage, [streamer]: [Streamer?]) {
		// Create the response message.
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		// Fetch the content.
		const content = typeof streamer === 'undefined'
			? await this.showAll(message)
			: this.showSingle(message, streamer);

		// Create the pages and the URD to display them.
		const pages = chunk(content, 10);
		const display = new UserRichDisplay(new MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128 }))
			.setColor(getColor(message)));
		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		// Start the display and return the message.
		await display.start(response, message.author.id);
		return response;
	}

	private showSingle(message: KlasaMessage, streamer: Streamer) {
		// Retrieve all subscriptions for the guild
		const guildSubscriptions = message.guild!.settings.get($KEY);
		const subscriptions = guildSubscriptions.find(entry => entry[0] === streamer._id);
		if (typeof subscriptions === 'undefined') throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_STREAMER_NOT_SUBSCRIBED');

		// Print all entries for this guild for this streamer.
		const statuses = message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_STATUS');
		const lines: string[] = [];
		for (const subscription of subscriptions[1]) {
			lines.push(`${streamer.display_name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
		}

		return lines;
	}

	private async showAll(message: KlasaMessage) {
		// Retrieve all subscriptions for the guild
		const guildSubscriptions = message.guild!.settings.get($KEY);
		if (guildSubscriptions.length === 0) throw message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_EMPTY');

		// Fetch all usernames and map them by their id.
		const ids = guildSubscriptions.map(subscriptions => subscriptions[0]);
		const profiles = await this.client.twitch.fetchUsers(ids, []);
		const names = new Map<string, string>();
		for (const profile of profiles.data) names.set(profile.id, profile.display_name);

		// Print all entries for this guild.
		const statuses = message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_STATUS');
		const lines: string[] = [];
		for (const subscriptions of guildSubscriptions) {
			const name = names.get(subscriptions[0]) || message.language.tget('COMMAND_TWITCHSUBSCRIPTION_SHOW_UNKNOWN_USER');
			for (const subscription of subscriptions[1]) {
				lines.push(`${name} - <#${subscription.channel}> → ${statuses[subscription.status]}`);
			}
		}

		return lines;
	}

}
