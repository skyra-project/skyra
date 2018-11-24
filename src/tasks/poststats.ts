import { Colors, Task } from 'klasa';
import { TOKENS } from '../../config';
import { fetch } from '../lib/util/util';

const r = new Colors({ text: 'red' });
const g = new Colors({ text: 'green' });
const b = new Colors({ text: 'lightblue' });
const header = b.format('[POST STATS]');

export default class extends Task {

	public async run(): Promise<void> {
		if (this.client.options.dev) return;

		const guilds = this.client.guilds.size;
		const users = this.client.guilds.reduce((acc, val) => acc + val.memberCount, 0);

		const results = (await Promise.all([
			this.query(`https://discordbots.org/api/bots/${this.client.user.id}/stats`,
				`{"server_count":${guilds}}`, TOKENS.DISCORD_BOT_ORG, Lists.DiscordBotsOrg),
			this.query(`https://bots.discord.pw/api/bots/${this.client.user.id}/stats`,
				`{"server_count":${guilds}}`, TOKENS.DISCORD_BOTS, Lists.DiscordBotsPw),
			this.query(`https://botsfordiscord.com/api/bot/${this.client.user.id}`,
				`{"server_count":${guilds}}`, TOKENS.BOTS_FOR_DISCORD, Lists.BotsForDiscord),
			this.query(`https://discordbotlist.com/api/bots/${this.client.user.id}/stats`,
				`{"guilds":${guilds},"users":${users}}`, TOKENS.DISCORD_BOT_LIST ? `Bot ${TOKENS.DISCORD_BOT_LIST}` : null, Lists.DiscordBotList)
		])).filter((value) => value !== null);

		if (results.length) this.client.emit('log', `${header} ${results.join(' | ')}`);
	}

	public async query(url: string, body: string, token: string, list: Lists): Promise<string> {
		try {
			if (!token) return null;
			await fetch(url, {
				body,
				headers: { 'Content-Type': 'application/json', Authorization: token },
				method: 'POST'
			}, 'result');
			return g.format(list);
		} catch {
			return r.format(list);
		}
	}

}

enum Lists {
	BotsForDiscord = 'botsfordiscord.com',
	DiscordBotList = 'discordbotlist.com',
	DiscordBotsOrg = 'discordbots.org',
	DiscordBotsPw = 'discordbots.pw'
}
