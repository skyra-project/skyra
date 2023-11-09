import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { toPermissionsArray } from '#utils/bits';
import { Colors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import type { Role, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildRoleCreate })
export class UserListener extends Listener<typeof Events.GuildRoleCreate> {
	public async run(next: Role) {
		const [channelId, t] = await readSettings(next, (settings) => [settings[GuildSettings.Channels.Logs.RoleCreate], settings.getLanguage()]);
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next, [[GuildSettings.Channels.Logs.RoleCreate, null]]);
			return;
		}

		const changes: string[] = [...this.getRoleInformation(t, next)];
		const embed = new EmbedBuilder()
			.setColor(Colors.Green)
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setDescription(changes.join('\n'))
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.RoleCreate) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}

	private *getRoleInformation(t: TFunction, role: Role) {
		if (role.color !== 0x000000) yield t(LanguageKeys.Events.Guilds.Logs.RoleCreateColor, { value: role.hexColor });
		if (role.hoist) yield t(LanguageKeys.Events.Guilds.Logs.RoleCreateHoist);
		if (role.mentionable) yield t(LanguageKeys.Events.Guilds.Logs.RoleCreateMentionable);

		if (role.permissions.bitfield !== 0n) {
			const values = toPermissionsArray(role.permissions.bitfield).map((key) => t(`permissions:${key}`));
			yield t(LanguageKeys.Events.Guilds.Logs.RoleCreatePermissions, { values, count: values.length });
		}

		yield t(LanguageKeys.Events.Guilds.Logs.RoleCreatePosition, { value: role.position });
	}
}
