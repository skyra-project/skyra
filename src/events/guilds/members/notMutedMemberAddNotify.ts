import { GuildSettings } from '@lib/database';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageLogsEnum } from '@utils/constants';
import { GuildMember, MessageEmbed } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.NotMutedMemberAdd })
export default class extends Event {
	public async run(member: GuildMember) {
		const [enabled, language] = await member.guild.readSettings((settings) => [settings[GuildSettings.Events.MemberAdd], settings.getLanguage()]);
		if (!enabled) return;

		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, member.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(
					language.get(LanguageKeys.Events.GuildMemberAddDescription, {
						mention: member.toString(),
						time: Date.now() - member.user.createdTimestamp
					})
				)
				.setFooter(language.get(LanguageKeys.Events.GuildMemberAdd))
				.setTimestamp()
		);
	}
}
