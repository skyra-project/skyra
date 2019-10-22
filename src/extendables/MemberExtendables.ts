import { GuildMember } from 'discord.js';
import { Extendable, ExtendableOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<ExtendableOptions>({
	appliesTo: [GuildMember]
})
export default class extends Extendable {

	public async fetchRank(this: GuildMember) {
		const list = await this.client.leaderboard.fetch(this.guild.id);
		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.user.username;
		return rank.position;
	}

}
