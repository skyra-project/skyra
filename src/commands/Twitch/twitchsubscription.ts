import { GuildSubscriptionEntity, TwitchSubscriptionEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { minutes } from '#utils/common';
import { getColor, getFullEmbedAuthor, sendLoadingMessage } from '#utils/util';
import { channelMention } from '@discordjs/builders';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Args, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { chunk, isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { envIsDefined } from '@skyra/env-utilities';
import {
	addEventSubscription,
	fetchUsers,
	removeEventSubscription,
	TwitchEventSubTypes,
	type TwitchHelixUsersSearchResult
} from '@skyra/twitch-helpers';
import { EmbedBuilder, PermissionFlagsBits, type Guild } from 'discord.js';

@ApplyOptions<SkyraSubcommand.Options>({
	enabled: envIsDefined('TWITCH_CALLBACK', 'TWITCH_CLIENT_ID', 'TWITCH_TOKEN', 'TWITCH_EVENTSUB_SECRET'),
	aliases: ['twitch-subscription', 't-subscription', 't-sub'],
	description: LanguageKeys.Commands.Twitch.TwitchSubscriptionDescription,
	detailedDescription: LanguageKeys.Commands.Twitch.TwitchSubscriptionExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'show', messageRun: 'show', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const subscriptionType = await args.pick(UserCommand.status);
		const customMessage = await args.rest('string', { maximum: 200 }).catch(() => null);

		if (subscriptionType === TwitchEventSubTypes.StreamOffline && isNullishOrEmpty(customMessage)) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionAddMessageForOfflineRequired);
		}

		const { prisma } = this.container;

		// Get a potential pre-existing subscription for this streamer and subscriptionType
		const streamerForType = await prisma.twitchSubscription.findFirst({
			where: { streamerId: streamer.id, subscriptionType }
		});
		const guildSubscriptionsForGuild = await prisma.guildSubscription.findMany({
			where: { guildId: message.guild.id, channelId: channel.id }
		});

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
		guildSubscription.channelId = channel.id;
		guildSubscription.message = customMessage ?? undefined;

		if (streamerForType) {
			guildSubscription.subscription = streamerForType;
		} else {
			// Subscribe to the streamer on the Twitch API, returning the ID of the subscription
			const subscription = await addEventSubscription(streamer.id, subscriptionType);
			const twitchSubscriptionEntity = new TwitchSubscriptionEntity();

			twitchSubscriptionEntity.streamerId = streamer.id;
			twitchSubscriptionEntity.subscriptionType = subscriptionType;
			twitchSubscriptionEntity.subscriptionId = subscription.id;

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
		const guildSubscriptions = await this.getGuildSubscriptions(message.guild);

		// Only get the args if there are any subscriptions to process
		const streamer = await args.pick(UserCommand.streamer);
		const channel = await args.pick('channelName');
		const subscriptionType = await args.pick(UserCommand.status);

		// Get all subscriptions for the provided streamer
		const streamers = guildSubscriptions.filter((guildSubscription) => guildSubscription.subscription.streamerId === streamer.id);

		// If there are no subscriptions for this streamer, throw

		if (!streamers.length) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerNotSubscribed, { streamer: streamer.display_name });
		}

		// Get all subscriptions for the specified streamer and status
		const statuses = streamers.filter((guildSubscription) => guildSubscription.subscription.subscriptionType === subscriptionType);

		// If there are no subscriptions for this status then throw
		if (!statuses.length) {
			const statuses = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);

			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveStreamerStatusNotMatch, {
				streamer: streamer.display_name,
				status: this.getSubscriptionStatus(subscriptionType, statuses)
			});
		}

		// Get all subscriptions for this streamer, status and channel
		const streamerWithStatusHasChannel = statuses.find((guildSubscription) => guildSubscription.channelId === channel.id);

		// If there are no subscriptions configured for this channel then throw
		if (!streamerWithStatusHasChannel) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveNotToProvidedChannel, { channel });
		}

		// Remove the guild subscription. We always have just 1 left here.
		await streamerWithStatusHasChannel.remove();

		// Remove the subscription from the twitch API (if needed)
		await this.removeSubscription(streamerWithStatusHasChannel.subscription.subscriptionId);

		const content = args.t(
			subscriptionType === TwitchEventSubTypes.StreamOnline
				? LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessLive
				: LanguageKeys.Commands.Twitch.TwitchSubscriptionRemoveSuccessOffline,
			{ name: streamer.display_name, channel: channelMention(channel.id) }
		);

		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const guildSubscriptions = await this.getGuildSubscriptions(message.guild);

		// Only get the arg if there are any subscriptions to process
		const streamer = args.finished ? null : await args.pick(UserCommand.streamer);
		let count = 0;

		const removals: Promise<GuildSubscriptionEntity>[] = [];

		// Loop over all guildSubscriptions and remove them
		for (const guildSubscription of guildSubscriptions) {
			// If the streamer is defined
			if (streamer) {
				// Then only remove if the streamerId matches
				if (guildSubscription.subscription.streamerId === streamer.id) {
					removals.push(guildSubscription.remove());
					count++;
				}
				// Otherwise always remove
			} else {
				removals.push(guildSubscription.remove());
				count++;
			}
		}

		// Remove GuildSubscriptionEntities
		await Promise.all(removals);

		// Reset twitch subscriptions
		await this.resetSubscriptions(streamer);

		const content = args.t(LanguageKeys.Commands.Twitch.TwitchSubscriptionResetSuccess, { count });
		return send(message, content);
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const streamer = args.finished ? null : await args.pick(UserCommand.streamer);
		const { t } = args;

		// Create the response message.
		const response = await sendLoadingMessage(message, t);

		// Fetch the content to show in the reply message
		const lines = isNullish(streamer) ? await this.showAll(message.guild, t) : await this.showSingle(message.guild, streamer, t);

		// Create the pages and the URD to display them.
		const pages = chunk(lines, 10);
		const display = new PaginatedMessage({
			template: new EmbedBuilder() //
				.setAuthor(getFullEmbedAuthor(message.author))
				.setColor(getColor(message))
		});

		display.setIdle(minutes(5));
		for (const page of pages) display.addPageEmbed((embed) => embed.setDescription(page.join('\n')));

		// Start the display and return the message.
		await display.run(response, message.author);

		return response;
	}

	private async showSingle(guild: Guild, streamer: TwitchHelixUsersSearchResult, t: TFunction) {
		const guildSubscriptions = await this.getGuildSubscriptions(guild);

		const subscriptionsForStreamer = guildSubscriptions.filter((guildSubscription) => guildSubscription.subscription.streamerId === streamer.id);

		if (!subscriptionsForStreamer.length) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStreamerNotSubscribed);
		}

		// Return the line this guild and streamer.
		const statuses = t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
		const lines: string[] = [];

		for (const guildSubscription of subscriptionsForStreamer) {
			lines.push(
				`${streamer.display_name} - ${channelMention(guildSubscription.channelId)} → ${this.getSubscriptionStatus(
					guildSubscription.subscription.subscriptionType,
					statuses
				)}`
			);
		}

		return lines;
	}

	private async showAll(guild: Guild, t: TFunction) {
		const guildSubscriptions = await this.getGuildSubscriptions(guild);

		// Get all the streamer IDs for this guild, put into a Set to remove duplicates
		// (i.e. different channels, different subscription types)
		const streamerIds = new Set([...guildSubscriptions.map((guildSubscription) => guildSubscription.subscription.streamerId)]);

		const profiles = (await fetchUsers({ ids: streamerIds })).unwrapRaw();
		const names = new Map<string, string>();
		for (const profile of profiles.data) names.set(profile.id, profile.display_name);

		// Print all entries for this guild.
		const statuses = t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowStatus);
		const lines: string[] = [];

		for (const guildSubscription of guildSubscriptions) {
			const name = names.get(guildSubscription.subscription.streamerId) ?? t(LanguageKeys.Commands.Twitch.TwitchSubscriptionShowUnknownUser);

			lines.push(
				`${name} - ${channelMention(guildSubscription.channelId)} → ${this.getSubscriptionStatus(
					guildSubscription.subscription.subscriptionType,
					statuses
				)}`
			);
		}

		return lines;
	}

	private async removeSubscription(subscriptionId: string) {
		// Get all subscriptions for the provided streamer and subscription type
		const subscription = await this.container.prisma.twitchSubscription.findFirst({
			where: { subscriptionId },
			include: { guildSubscription: true }
		});

		// If there are no subscriptions for that streamer and subscription type then return
		if (!subscription) return;

		if (subscription.guildSubscription.length === 0) {
			await Promise.all([
				removeEventSubscription(subscription.subscriptionId), //
				await this.container.prisma.twitchSubscription.delete({ where: { id: subscription.id } })
			]);
		}
	}

	private async resetSubscriptions(streamer: TwitchHelixUsersSearchResult | null) {
		// Get all subscriptions
		const subscriptions = await this.container.prisma.twitchSubscription.findMany({
			...(!isNullish(streamer) && {
				where: { streamerId: streamer.id }
			}),
			include: { guildSubscription: true }
		});

		// If there are no subscriptions then return
		if (!subscriptions) return;

		// Loop over all subscriptions
		for (const subscription of subscriptions) {
			// If the subscription has no servers then remove it
			if (subscription.guildSubscription.length === 0) {
				await Promise.all([
					removeEventSubscription(subscription.subscriptionId), //
					await this.container.prisma.twitchSubscription.delete({ where: { id: subscription.id } })
				]);
			}
		}
	}

	private async getGuildSubscriptions(guild: Guild): Promise<GuildSubscriptionEntity[]> {
		// Get all subscriptions for the current server and channel combination
		const guildSubscriptionForGuild = await this.container.prisma.guildSubscription.findMany({ where: { guildId: guild.id } });

		if (guildSubscriptionForGuild.length === 0) {
			this.error(LanguageKeys.Commands.Twitch.TwitchSubscriptionNoSubscriptions);
		}

		return guildSubscriptionForGuild;
	}

	private getSubscriptionStatus(subscriptionType: TwitchEventSubTypes, statuses: { live: string; offline: string }) {
		return subscriptionType === TwitchEventSubTypes.StreamOnline ? statuses.live : statuses.offline;
	}

	private static streamer = Args.make<TwitchHelixUsersSearchResult>(async (parameter, { argument }) => {
		try {
			const { data } = (await fetchUsers({ logins: [parameter] })).unwrapRaw();
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
