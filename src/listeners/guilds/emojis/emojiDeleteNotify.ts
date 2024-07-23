import { readSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { getLogger } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { GuildEmoji } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildEmojiDelete })
export class UserListener extends Listener<typeof Events.GuildEmojiDelete> {
	public async run(next: GuildEmoji) {
		const settings = await readSettings(next.guild);
		await getLogger(next.guild).send({
			key: 'channelsLogsEmojiDelete',
			channelId: settings.channelsLogsEmojiDelete,
			makeMessage: () => {
				const t = getT(settings.language);
				return new EmbedBuilder()
					.setColor(Colors.Red)
					.setThumbnail(next.imageURL({ size: 256 }))
					.setAuthor({ name: `${next.name} (${next.id})`, iconURL: next.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
					.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.EmojiDelete) })
					.setTimestamp();
			}
		});
	}
}
