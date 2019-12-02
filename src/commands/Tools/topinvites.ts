import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_TOPINVITES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TOPINVITES_EXTENDED'),
			requiredGuildPermissions: ['MANAGE_GUILD']
		});
	}

	public async run(message: KlasaMessage) {
		const invites = await message.guild!.fetchInvites();
		const topTen = invites
			.filter(inv => Boolean(inv.uses))
			.sort((a, b) => b.uses! - a.uses!)
			.first(10);

		const translationData = message.language.tget('COMMAND_TOPINVITES_DATA');
		if (topTen.length === 0) throw translationData.NO_INVITES;

		return message.send(topTen.map(inv => translationData.INVITE_STRING(inv.inviter!.username, inv.code, inv.uses!.toLocaleString())));
	}

}
