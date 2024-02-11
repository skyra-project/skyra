import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { getLogger } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { Snowflake, User, VoiceBasedChannel, VoiceState } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.VoiceStateUpdate })
export class UserListener extends Listener<typeof Events.VoiceStateUpdate> {
	public async run(old: VoiceState, next: VoiceState) {
		// If the channel is the same, return:
		if (old.channelId === next.channelId) return;

		const oldChannel = old.channel;
		const nextChannel = next.channel;
		const user = await this.container.client.users.fetch(next.id);

		const [t, targetChannelId, ...settings] = await readSettings(next.guild, (settings) => [
			settings.getLanguage(),
			settings[GuildSettings.Channels.Logs.VoiceChannel],
			settings[GuildSettings.Events.IncludeBots],
			settings[GuildSettings.Channels.Ignore.VoiceActivity],
			settings[GuildSettings.Channels.Ignore.All]
		]);

		await getLogger(next.guild).send({
			key: GuildSettings.Channels.Logs.VoiceChannel,
			channelId: targetChannelId,
			condition: () => this.onCondition(oldChannel, nextChannel, user, ...settings),
			makeMessage: () => {
				const { description, color } = this.render(t, oldChannel, nextChannel);
				return new EmbedBuilder() //
					.setAuthor(getFullEmbedAuthor(user))
					.setColor(color)
					.setDescription(description)
					.setFooter({ text: t(LanguageKeys.Events.Messages.VoiceActivityFooter) })
					.setTimestamp();
			}
		});
	}

	private onCondition(
		old: VoiceBasedChannel | null,
		next: VoiceBasedChannel | null,
		user: User,
		includeBots: boolean,
		ignoredChannels: readonly Snowflake[],
		ignoredAll: readonly Snowflake[]
	) {
		// If includeBots is false, and the user is a bot, return false
		if (!includeBots && user.bot) return false;
		// Assume in all conditions that old !== next, as checked earlier.
		// If the old channel is null, the user joined a channel, check if `next` is ignored:
		if (old === null) return this.onConditionSingleChannel(next!, ignoredChannels, ignoredAll);
		// If the new channel is null, the user left a channel, check if `old` is ignored:
		if (next === null) return this.onConditionSingleChannel(old, ignoredChannels, ignoredAll);
		// If the user changed channels, check if any of the two channels are ignored:
		return (
			this.onConditionSingleChannel(old, ignoredChannels, ignoredAll) || //
			this.onConditionSingleChannel(next, ignoredChannels, ignoredAll)
		);
	}

	private onConditionSingleChannel(channel: VoiceBasedChannel, ignoredChannels: readonly Snowflake[], ignoredAll: readonly Snowflake[]) {
		// If the channel is in the ignoredChannels array, return false
		if (ignoredChannels.includes(channel.id)) return false;
		// If the channel or its parent is in the ignoredAll array, return false
		if (ignoredAll.some((id) => id === channel.id || channel.parentId === id)) return false;
		// All checks passed, return true
		return true;
	}

	private render(t: TFunction, old: VoiceBasedChannel | null, next: VoiceBasedChannel | null) {
		if (old === null) {
			return {
				color: Colors.Green,
				description: t(LanguageKeys.Events.Guilds.Logs.VoiceChannelJoin, { channel: next!.toString() })
			};
		}

		if (next === null) {
			return {
				color: Colors.Red,
				description: t(LanguageKeys.Events.Guilds.Logs.VoiceChannelLeave, { channel: old.toString() })
			};
		}

		return {
			color: Colors.Blue,
			description: t(LanguageKeys.Events.Guilds.Logs.VoiceChannelMove, { oldChannel: old.toString(), newChannel: next.toString() })
		};
	}
}
