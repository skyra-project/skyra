import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { CLIENT_ID } from '@root/config';
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
	private get inviteWithPerms() {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.append('client_id', CLIENT_ID);
		url.searchParams.append('permissions', '491121748');
		url.searchParams.append('scope', 'bot');
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('redirect_uri', encodeURIComponent('https://skyra.pw'));
		return url.toString();
	}

	private get inviteWithoutPerms() {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.append('client_id', CLIENT_ID);
		url.searchParams.append('scope', 'bot');
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('redirect_uri', encodeURIComponent('https://skyra.pw'));
		return url.toString();
	}

	public async run(message: KlasaMessage, [noperms]: ['noperms' | undefined]) {
		if (noperms === 'noperms' || Reflect.has(message.flagArgs, 'nopermissions')) {
			return message.sendLocale('commandInviteNoPerms', [{ invite: this.inviteWithoutPerms }]);
		}

		return message.sendLocale('commandInvite', [{ invite: this.inviteWithPerms }]);
	}

	public async init() {
		if (this.client.application && !this.client.application.botPublic) this.permissionLevel = PermissionLevels.BotOwner;
	}
}
