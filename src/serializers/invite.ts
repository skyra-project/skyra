import { Serializer, SerializerUpdateContext } from 'klasa';
import { api } from '@utils/Models/Api';
import { resolveOnErrorCodes } from '@utils/util';
import { APIErrors } from '@utils/constants';
import { APIInviteData } from '@lib/types/DiscordAPI';

export default class extends Serializer {

	private readonly kRegExp = /^(?:https?:\/\/)?(?:www.)?(?:discord\.gg\/|discordapp\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i;

	public async validate(data: string, { entry, language }: SerializerUpdateContext) {
		const parsed = this.kRegExp.exec(data);
		if (parsed === null) throw language.tget('RESOLVER_INVALID_INVITE', entry.key);

		const { code } = parsed.groups!;
		const invite = await resolveOnErrorCodes(api(this.client).invites(code).get(), APIErrors.UnknownInvite) as APIInviteData | null;
		if (invite === null || !Reflect.has(invite, 'guild')) throw language.tget('RESOLVER_INVALID_INVITE', entry.key);
		return invite.code;
	}

}
