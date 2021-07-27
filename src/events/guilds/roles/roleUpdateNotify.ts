import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { toPermissionsArray } from '#utils/bits';
import { differenceBitField } from '#utils/common/comparators';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<EventOptions>({ event: Events.RoleUpdate })
export class UserEvent extends Event<Events.RoleUpdate> {
	public async run(previous: Role, next: Role) {
		const [channelID, t] = await readSettings(next, (settings) => [settings[GuildSettings.Channels.Logs.RoleUpdate], settings.getLanguage()]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next, [[GuildSettings.Channels.Logs.RoleUpdate, null]]);
			return;
		}

		const changes: string[] = [...this.differenceRole(t, previous, next)];
		if (changes.length === 0) return;

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.RoleUpdate))
				.setTimestamp()
		);
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
