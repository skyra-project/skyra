import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildEmoji, MessageEmbed, TextChannel } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildEmojiDelete })
export class UserListener extends Listener<typeof Events.GuildEmojiDelete> {
	public async run(next: GuildEmoji) {
		const [channelId, t] = await readSettings(next.guild, (settings) => [
			settings[GuildSettings.Channels.Logs.EmojiDelete],
			settings.getLanguage()
		]);
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.EmojiDelete, null]]);
			return;
		}

		const embed = new MessageEmbed()
			.setColor(Colors.Red)
			.setThumbnail(next.url)
			.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.EmojiDelete))
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}
}
