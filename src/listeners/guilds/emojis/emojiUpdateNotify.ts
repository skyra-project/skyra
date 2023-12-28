import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { differenceMap } from '#utils/common/comparators';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import type { GuildEmoji, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildEmojiUpdate })
export class UserListener extends Listener<typeof Events.GuildEmojiUpdate> {
	public async run(previous: GuildEmoji, next: GuildEmoji) {
		const [channelId, t] = await readSettings(next.guild, (settings) => [
			settings[GuildSettings.Channels.Logs.EmojiUpdate],
			settings.getLanguage()
		]);
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.EmojiUpdate, null]]);
			return;
		}

		const changes: string[] = [...this.differenceEmoji(t, previous, next)];
		if (changes.length === 0) return;

		const embed = new EmbedBuilder()
			.setColor(Colors.Yellow)
			.setThumbnail(next.url)
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setDescription(changes.join('\n'))
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.EmojiUpdate) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}

	private *differenceEmoji(t: TFunction, previous: GuildEmoji, next: GuildEmoji) {
		const [no, yes] = [t(LanguageKeys.Globals.No), t(LanguageKeys.Globals.Yes)];

		if (previous.animated !== next.animated) {
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateAnimated, {
				previous: previous.animated ? yes : no,
				next: next.animated ? yes : no
			});
		}

		if (previous.available !== next.available) {
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateAvailable, {
				previous: previous.available ? yes : no,
				next: next.available ? yes : no
			});
		}

		if (previous.managed !== next.managed) {
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateManaged, {
				previous: previous.managed ? yes : no,
				next: next.managed ? yes : no
			});
		}

		if (previous.name !== next.name) {
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateName, {
				previous: previous.name,
				next: next.name
			});
		}

		if (previous.requiresColons !== next.requiresColons) {
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateRequiresColons, {
				previous: previous.requiresColons ? yes : no,
				next: next.requiresColons ? yes : no
			});
		}

		const modified = differenceMap(previous.roles.cache, next.roles.cache);
		if (modified.added.size !== 0) {
			const values = [...modified.added.keys()].map((id) => `<@&${id}>`);
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateRolesAdded, { values, count: values.length });
		}

		if (modified.removed.size !== 0) {
			const values = [...modified.removed.keys()].map((id) => `<@&${id}>`);
			yield t(LanguageKeys.Events.Guilds.Logs.EmojiUpdateRolesRemoved, { values, count: values.length });
		}
	}
}
