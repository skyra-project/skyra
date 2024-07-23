import { readSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { getLogger } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { GuildEmoji } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildEmojiCreate })
export class UserListener extends Listener<typeof Events.GuildEmojiCreate> {
	public async run(next: GuildEmoji) {
		const settings = await readSettings(next.guild);
		await getLogger(next.guild).send({
			key: 'channelsLogsEmojiCreate',
			channelId: settings.channelsLogsEmojiCreate,
			makeMessage: () => {
				const t = getT(settings.language);
				const changes: string[] = [...this.getEmojiInformation(t, next)];
				return new EmbedBuilder()
					.setColor(Colors.Green)
					.setThumbnail(next.imageURL({ size: 256 }))
					.setAuthor({ name: `${next.name} (${next.id})`, iconURL: next.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
					.setDescription(changes.join('\n'))
					.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.EmojiCreate) })
					.setTimestamp();
			}
		});
	}

	private *getEmojiInformation(t: TFunction, next: GuildEmoji) {
		if (next.animated) yield t(LanguageKeys.Events.Guilds.Logs.EmojiCreateAnimated);
		if (!next.available) yield t(LanguageKeys.Events.Guilds.Logs.EmojiCreateUnAvailable);
		if (next.managed) yield t(LanguageKeys.Events.Guilds.Logs.EmojiCreateManaged);
		if (next.requiresColons) yield t(LanguageKeys.Events.Guilds.Logs.EmojiCreateRequiresColons);

		const roles = next.roles.cache;
		if (roles.size !== 0) {
			const values = [...next.roles.cache.values()].map((role) => role.toString());
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiCreateRoles, { values, count: values.length });
		}
	}
}
