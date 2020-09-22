import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildSettings, RolesAuto } from '@lib/types/namespaces/GuildSettings';
import { Time } from '@utils/constants';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: (language) => language.get('commandMylevelDescription'),
			extendedHelp: (language) => language.get('commandMylevelExtended'),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
	}

	public async run(message: KlasaMessage, [user = message.author]: [User]) {
		const { members } = await DbSet.connect();
		const memberSettings = await members.findOne({ where: { userID: user.id, guildID: message.guild!.id }, cache: Time.Minute * 15 });
		const memberPoints = memberSettings?.points ?? 0;
		const nextRole = this.getLatestRole(memberPoints, message.guild!.settings.get(GuildSettings.Roles.Auto));
		const title = nextRole
			? `\n${message.language.get('commandMylevelNext', {
					remaining: nextRole.points - memberPoints,
					next: nextRole.points
			  })}`
			: '';

		return user.id === message.author.id
			? message.sendLocale('commandMylevelSelf', [{ points: memberPoints, next: title }])
			: message.sendLocale('commandMylevel', [{ points: memberPoints, next: title, user: user.username }]);
	}

	public getLatestRole(points: number, autoroles: readonly RolesAuto[]) {
		for (const autorole of autoroles) {
			if (autorole.points > points) return autorole;
		}

		return null;
	}
}
