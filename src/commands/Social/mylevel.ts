import { DbSet, GuildSettings, RolesAuto } from '#lib/database/index';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { User } from 'discord.js';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: (language) => language.get(LanguageKeys.Commands.Social.MylevelDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.MylevelExtended),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
	}

	public async run(message: GuildMessage, [user = message.author]: [User]) {
		const { members } = await DbSet.connect();
		const memberSettings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		const memberPoints = memberSettings?.points ?? 0;
		const [roles, language] = await message.guild.readSettings((settings) => [settings[GuildSettings.Roles.Auto], settings.getLanguage()]);
		const nextRole = this.getLatestRole(memberPoints, roles);
		const title = nextRole
			? `\n${language.get(LanguageKeys.Commands.Social.MylevelNext, {
					remaining: nextRole.points - memberPoints,
					next: nextRole.points
			  })}`
			: '';

		return user.id === message.author.id
			? message.send(language.get(LanguageKeys.Commands.Social.MylevelSelf, { points: memberPoints, next: title }))
			: message.send(language.get(LanguageKeys.Commands.Social.Mylevel, { points: memberPoints, next: title, user: user.username }));
	}

	public getLatestRole(points: number, autoroles: readonly RolesAuto[]) {
		for (const autorole of autoroles) {
			if (autorole.points > points) return autorole;
		}

		return null;
	}
}
