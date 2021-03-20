import { GuildSettings, RolesAuto } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 15,
	description: LanguageKeys.Commands.Social.MyLevelDescription,
	extendedHelp: LanguageKeys.Commands.Social.MyLevelExtended,
	runIn: ['text'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');

		const { members } = this.context.db;
		const memberSettings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		const memberPoints = memberSettings?.points ?? 0;
		const roles = await message.guild.readSettings(GuildSettings.Roles.Auto);
		const nextRole = this.getLatestRole(memberPoints, roles);
		const title = nextRole
			? `\n${args.t(LanguageKeys.Commands.Social.MyLevelNext, {
					remaining: nextRole.points - memberPoints,
					next: nextRole.points
			  })}`
			: '';

		return message.send(
			user.id === message.author.id
				? args.t(LanguageKeys.Commands.Social.MyLevelSelf, { points: memberPoints, next: title })
				: args.t(LanguageKeys.Commands.Social.MyLevel, { points: memberPoints, next: title, user: user.username })
		);
	}

	public getLatestRole(points: number, autoroles: readonly RolesAuto[]) {
		for (const autorole of autoroles) {
			if (autorole.points > points) return autorole;
		}

		return null;
	}
}
