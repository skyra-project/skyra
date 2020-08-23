import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: (language) => language.get('commandInviteDescription'),
	extendedHelp: (language) => language.get('commandInviteExtended'),
	usage: '[noperms]',
	flagSupport: true,
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [noperms]: ['noperms' | undefined]) {
		if (noperms === 'noperms' || Reflect.has(message.flagArgs, 'nopermissions')) {
			return message.sendLocale('commandInviteNoPerms', []);
		}

		return message.sendLocale('commandInvite', []);
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}
}
