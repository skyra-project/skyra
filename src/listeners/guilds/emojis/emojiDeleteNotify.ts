import { readSettings, writeSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GuildEmoji, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildEmojiDelete })
export class UserListener extends Listener<typeof Events.GuildEmojiDelete> {
	public async run(next: GuildEmoji) {
		const settings = await readSettings(next.guild);
		const channelId = settings.channelsLogsEmojiDelete;
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [['channelsLogsEmojiDelete', null]]);
			return;
		}

		const t = getT(settings.language);
		const embed = new EmbedBuilder()
			.setColor(Colors.Red)
			.setThumbnail(next.imageURL({ size: 256 }))
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.EmojiDelete) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}
}
