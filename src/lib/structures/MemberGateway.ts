import { Gateway, Settings, KlasaGuild } from 'klasa';

export class MemberGateway extends Gateway {

	protected _synced: boolean = false;

	public get(id: string) {
		const [guildID, memberID] = id.split('.');
		const guild = this.cache.get(guildID);
		if (!guild) return null;

		const member = guild!.members.get(memberID);
		return (member && member.settings) || null;
	}

	public async sync(input: string): Promise<Settings>;
	public async sync(input?: string[]): Promise<this>;
	public async sync(input?: string | string[]): Promise<Settings | this> {
		const result = await super.sync(input);
		if (result === this) {
			for (const guild of this.cache.values() as IterableIterator<KlasaGuild>) {
				// @ts-ignore
				for (const member of guild!.members.values()) if (member.settings.existenceStatus === null) member.settings.existenceStatus = false;
			}
		}
		return result;
	}

}
