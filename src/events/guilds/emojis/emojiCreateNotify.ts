import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildEmoji, MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<EventOptions>({ event: Events.EmojiCreate })
export class UserEvent extends Event<Events.EmojiCreate> {
	public async run(next: GuildEmoji) {
		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.EmojiCreate],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.EmojiCreate, null]]);
			return;
		}

		const changes: string[] = [...this.getEmojiInformation(t, next)];
		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Green)
				.setThumbnail(next.url)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.EmojiCreate))
				.setTimestamp()
		);
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
