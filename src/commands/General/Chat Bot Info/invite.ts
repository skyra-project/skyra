import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { PermissionLevels } from '@lib/types/Enums';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_INVITE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_INVITE_EXTENDED'),
	usage: '[noperms]',
	flagSupport: true,
	guarded: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [noperms]: ['noperms' | undefined]) {
		if (noperms === 'noperms' || Reflect.has(message.flagArgs, 'noperms') || Reflect.has(message.flagArgs, 'nopermissions')) {
			return message.sendLocale('COMMAND_INVITE_NO_PERMS');
		}

		return message.sendLocale('COMMAND_INVITE');
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}

}
