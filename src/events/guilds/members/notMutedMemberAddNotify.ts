import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { MessageLogsEnum } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GuildMember, MessageEmbed } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.NotMutedMemberAdd })
export default class extends Event {
	public async run(member: GuildMember) {
		const [enabled, t] = await member.guild.readSettings((settings) => [settings[GuildSettings.Events.MemberAdd], settings.getLanguage()]);
		if (!enabled) return;

		this.context.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, member.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(
					t(LanguageKeys.Events.GuildMemberAddDescription, {
						mention: member.toString(),
						time: Date.now() - member.user.createdTimestamp
					})
				)
				.setFooter(t(LanguageKeys.Events.GuildMemberAdd))
				.setTimestamp()
		);
	}
}
