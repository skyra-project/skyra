import { Command } from '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: 'Get the information from a case by its index.',
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<Case:integer>'
		});
	}

	public async run(msg, [index]) {
		const modlog = await msg.guild.moderation.fetch(index);
		if (modlog) return msg.sendEmbed(await modlog.prepareEmbed());
		throw msg.language.get('COMMAND_REASON_NOT_EXISTS');
	}

}
