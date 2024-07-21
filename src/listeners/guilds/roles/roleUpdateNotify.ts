import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { toPermissionsArray } from '#utils/bits';
import { differenceBitField } from '#utils/common/comparators';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import type { Role, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildRoleUpdate })
export class UserListener extends Listener<typeof Events.GuildRoleUpdate> {
	public async run(previous: Role, next: Role) {
		const settings = await readSettings(next);
		const channelId = settings.channelsLogsRoleUpdate;
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next, [[GuildSettings.Channels.Logs.RoleUpdate, null]]);
			return;
		}

		const t = settings.getLanguage();
		const changes: string[] = [...this.differenceRole(t, previous, next)];
		if (changes.length === 0) return;

		const embed = new EmbedBuilder()
			.setColor(Colors.Yellow)
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setDescription(changes.join('\n'))
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.RoleUpdate) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}

	private *differenceRole(t: TFunction, previous: Role, next: Role) {
		const [no, yes] = [t(LanguageKeys.Globals.No), t(LanguageKeys.Globals.Yes)];

		if (previous.color !== next.color) {
			yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdateColor, {
				previous: previous.hexColor,
				next: next.hexColor
			});
		}

		if (previous.hoist !== next.hoist) {
			yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdateHoist, {
				previous: previous.hoist ? yes : no,
				next: next.hoist ? yes : no
			});
		}

		if (previous.mentionable !== next.mentionable) {
			yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdateMentionable, {
				previous: previous.mentionable ? yes : no,
				next: next.mentionable ? yes : no
			});
		}

		if (previous.name !== next.name) {
			yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdateName, {
				previous: previous.name,
				next: next.name
			});
		}

		if (previous.permissions.bitfield !== next.permissions.bitfield) {
			const modified = differenceBitField(previous.permissions.bitfield, next.permissions.bitfield);
			if (modified.added) {
				const values = toPermissionsArray(modified.added).map((key) => t(`permissions:${key}`));
				yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdatePermissionsAdded, { values, count: values.length });
			}

			if (modified.removed) {
				const values = toPermissionsArray(modified.removed).map((key) => t(`permissions:${key}`));
				yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdatePermissionsRemoved, { values, count: values.length });
			}
		}

		if (previous.position !== next.position) {
			yield t(LanguageKeys.Events.Guilds.Logs.RoleUpdatePosition, {
				previous: previous.position,
				next: next.position
			});
		}
	}
}
