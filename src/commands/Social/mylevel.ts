import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings, RolesAuto } from '../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: language => language.tget('COMMAND_MYLEVEL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MYLEVEL_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
	}

	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		const member = await message.guild!.members.fetch(user.id).catch(() => {
			throw message.language.tget('USER_NOT_IN_GUILD');
		});

		const memberSettings = await this.client.queries.fetchMemberSettings(message.guild!.id, member.id);
		const memberPoints = memberSettings ? memberSettings.point_count : 0;
		const nextRole = this.getLatestRole(memberPoints, message.guild!.settings.get(GuildSettings.Roles.Auto));
		const title = nextRole
			? `\n${message.language.tget('COMMAND_MYLEVEL_NEXT', nextRole.points - memberPoints, nextRole.points)}`
			: '';

		return message.sendLocale('COMMAND_MYLEVEL', [memberPoints, title, user.id === message.author.id ? null : user.username]);
	}

	public getLatestRole(points: number, autoroles: readonly RolesAuto[]) {
		for (const autorole of autoroles) {
			if (autorole.points > points) return autorole;
		}

		return null;
	}

}
