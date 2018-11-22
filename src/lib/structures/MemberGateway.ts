import { GuildMember } from 'discord.js';
import { Gateway } from 'klasa';
import { MemberSettings } from './MemberSettings';

export class MemberGateway extends Gateway {

	protected _synced: boolean;

	public create(target: GuildMember): MemberSettings {
		const settings = new MemberSettings(this, target);
		if (this._synced && this.schema.size) settings.sync(true).catch((err) => this.client.emit('error', err));
		return settings;
	}

}
