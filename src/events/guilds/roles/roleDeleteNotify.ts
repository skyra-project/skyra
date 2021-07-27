import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed, Role, TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.RoleDelete })
export class UserEvent extends Event<Events.RoleDelete> {
	public async run(role: Role) {
		const [channelID, t] = await readSettings(role, (settings) => [settings[GuildSettings.Channels.Logs.RoleDelete], settings.getLanguage()]);
		if (isNullish(channelID)) return;

		const channel = role.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(role, [[GuildSettings.Channels.Logs.RoleDelete, null]]);
			return;
		}

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(`${role.name} (${role.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.RoleDelete))
				.setTimestamp()
		);
	}
}
