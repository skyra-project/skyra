import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions, createMuteRole } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 150,
	description: language => language.tget('COMMAND_CREATEMUTE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_CREATEMUTE_EXTENDED'),
	permissionLevel: 6,
	requiredGuildPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		if (message.guild!.roles.size >= 250) throw message.language.tget('COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES');
		await message.sendLocale('SYSTEM_LOADING');
		await createMuteRole(message);
		return message.responses[0];
	}

}
