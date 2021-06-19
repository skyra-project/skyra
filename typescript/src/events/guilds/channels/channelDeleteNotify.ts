import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { CategoryChannel, DMChannel, MessageEmbed, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import type { TFunction } from 'i18next';

// TODO: DMChannel is not emitted in Discord v8, whenever we update to discord.js v13, this should be removed.
type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;
type Channel = DMChannel | GuildBasedChannel;

@ApplyOptions<EventOptions>({ event: Events.ChannelDelete })
export class UserEvent extends Event<Events.ChannelDelete> {
	public async run(next: Channel) {
		if (isDMChannel(next)) return;

		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.ChannelDelete],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.ChannelDelete, null]]);
			return;
		}

		const changes: string[] = [...this.getChannelInformation(t, next)];
		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.ChannelDelete))
				.setTimestamp()
		);
	}

	private *getChannelInformation(t: TFunction, channel: GuildBasedChannel) {
		if (channel.parentID) yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreateParent, { value: `<#${channel.parentID}>` });
	}
}
