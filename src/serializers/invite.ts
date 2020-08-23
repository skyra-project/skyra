import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	private readonly kRegExp = /^(?:https?:\/\/)?(?:www.)?(?:discord\.gg\/|discordapp\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i;

	public async validate(data: string, { entry, language }: SerializerUpdateContext) {
		const parsed = this.kRegExp.exec(data);
		if (parsed === null) throw language.get('resolverInvalidInvite', { name: entry.key });

		const { code } = parsed.groups!;
		const invite = await this.client.invites.fetch(code);
		if (invite === null || !Reflect.has(invite, 'guildID')) throw language.get('resolverInvalidInvite', { name: entry.key });
		return code;
	}
}
