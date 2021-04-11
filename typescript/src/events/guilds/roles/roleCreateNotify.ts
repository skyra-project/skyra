import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { toPermissionsArray } from '#utils/bits';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<EventOptions>({ event: Events.RoleCreate })
export class UserEvent extends Event<Events.RoleCreate> {
	public async run(next: Role) {
		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.RoleCreate],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.RoleCreate, null]]);
			return;
		}

		const changes: string[] = [...this.getRoleInformation(t, next)];
		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.RoleCreate))
				.setTimestamp()
		);
	}

	private *getRoleInformation(t: TFunction, role: Role) {
		if (role.color !== 0x000000) yield t(LanguageKeys.Events.Guilds.Logs.RoleCreateColor, { value: role.hexColor });
		if (role.hoist) yield t(LanguageKeys.Events.Guilds.Logs.RoleCreateHoist);
		if (role.mentionable) yield t(LanguageKeys.Events.Guilds.Logs.RoleCreateMentionable);

		if (role.permissions.bitfield !== 0) {
			const values = toPermissionsArray(role.permissions.bitfield).map((key) => t(`permissions:${key}`));
			yield t(LanguageKeys.Events.Guilds.Logs.RoleCreatePermissions, { values, count: values.length });
		}

		yield t(LanguageKeys.Events.Guilds.Logs.RoleCreatePosition, { value: role.position });
	}
}
