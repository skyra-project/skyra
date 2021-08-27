import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildEmoji, MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildEmojiCreate })
export class UserListener extends Listener<typeof Events.GuildEmojiCreate> {
	public async run(next: GuildEmoji) {
		const [channelId, t] = await readSettings(next.guild, (settings) => [
			settings[GuildSettings.Channels.Logs.EmojiCreate],
			settings.getLanguage()
		]);
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.EmojiCreate, null]]);
			return;
		}

		const changes: string[] = [...this.getEmojiInformation(t, next)];
		const embed = new MessageEmbed()
			.setColor(Colors.Green)
			.setThumbnail(next.url)
			.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
			.setDescription(changes.join('\n'))
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.EmojiCreate))
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
