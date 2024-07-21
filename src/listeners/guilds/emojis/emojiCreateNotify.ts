import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import type { GuildEmoji, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildEmojiCreate })
export class UserListener extends Listener<typeof Events.GuildEmojiCreate> {
	public async run(next: GuildEmoji) {
		const settings = await readSettings(next.guild);
		const channelId = settings.channelsLogsEmojiCreate;
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.EmojiCreate, null]]);
			return;
		}

		const t = settings.getLanguage();
		const changes: string[] = [...this.getEmojiInformation(t, next)];
		const embed = new EmbedBuilder()
			.setColor(Colors.Green)
			.setThumbnail(next.imageURL({ size: 256 }))
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setDescription(changes.join('\n'))
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.EmojiCreate) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
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
