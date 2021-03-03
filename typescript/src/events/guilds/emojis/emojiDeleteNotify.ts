import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildEmoji, MessageEmbed, TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.EmojiDelete })
export class UserEvent extends Event<Events.EmojiDelete> {
	public async run(next: GuildEmoji) {
		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.EmojiDelete],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.EmojiDelete, null]]);
			return;
		}

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Red)
				.setThumbnail(next.url)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.EmojiDelete))
				.setTimestamp()
		);
	}
}
