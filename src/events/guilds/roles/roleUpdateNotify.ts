import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { difference, toArray } from '#utils/permissions';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed, Role, TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.RoleUpdate })
export class UserEvent extends Event<Events.RoleUpdate> {
	public async run(previous: Role, next: Role) {
		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.RoleUpdate],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.RoleUpdate, null]]);
			return;
		}

		const changes: string[] = [];
		const [no, yes] = [t(LanguageKeys.Globals.No), t(LanguageKeys.Globals.Yes)];

		if (previous.color !== next.color) {
			changes.push(
				t(LanguageKeys.Events.Guilds.Logs.RoleUpdateColor, {
					previous: previous.hexColor,
					next: next.hexColor
				})
			);
		}

		if (previous.hoist !== next.hoist) {
			changes.push(
				t(LanguageKeys.Events.Guilds.Logs.RoleUpdateHoist, {
					previous: previous.hoist ? yes : no,
					next: next.hoist ? yes : no
				})
			);
		}

		if (previous.mentionable !== next.mentionable) {
			changes.push(
				t(LanguageKeys.Events.Guilds.Logs.RoleUpdateMentionable, {
					previous: previous.mentionable ? yes : no,
					next: next.mentionable ? yes : no
				})
			);
		}

		if (previous.name !== next.name) {
			changes.push(
				t(LanguageKeys.Events.Guilds.Logs.RoleUpdateName, {
					previous: previous.name,
					next: next.name
				})
			);
		}

		if (previous.permissions.bitfield !== next.permissions.bitfield) {
			const modified = difference(previous.permissions.bitfield, next.permissions.bitfield);
			if (modified.added) {
				const added = toArray(modified.added).map((key) => t(`permissions:${key}`));
				changes.push(t(LanguageKeys.Events.Guilds.Logs.RoleUpdatePermissionsAdded, { permissions: added, count: added.length }));
			}

			if (modified.removed) {
				const removed = toArray(modified.removed).map((key) => t(`permissions:${key}`));
				changes.push(t(LanguageKeys.Events.Guilds.Logs.RoleUpdatePermissionsRemoved, { permissions: removed, count: removed.length }));
			}
		}

		if (previous.position !== next.position) {
			changes.push(
				t(LanguageKeys.Events.Guilds.Logs.RoleUpdatePosition, {
					previous: previous.position,
					next: next.position
				})
			);
		}

		if (changes.length === 0) return;

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setTitle(t(LanguageKeys.Events.Guilds.Logs.RoleUpdate))
				.setDescription(changes.join('\n'))
				.setTimestamp()
		);
	}
}
