import { Colors } from '@klasa/console';
import { PartialResponseValue, ResponseType } from '@lib/database/entities/ScheduleEntity';
import { Events } from '@lib/types/Enums';
import { CLIENT_ID, DEV, ENABLE_INFLUX, TOKENS } from '@root/config';
import { Mime } from '@utils/constants';
import { fetch, FetchResultTypes } from '@utils/util';
import { Task } from 'klasa';

const r = new Colors({ text: 'red' });
const g = new Colors({ text: 'green' });
const b = new Colors({ text: 'lightblue' });
const header = b.format('[POST STATS   ]');

enum Lists {
	BotListSpace = 'botlist.space',
	BotsForDiscord = 'botsfordiscord.com',
	DiscordBotList = 'discordbotlist.com',
	TopGG = 'top.gg',
	DiscordBotsGG = 'discord.bots.gg',
	BotsOnDiscord = 'bots.ondiscord.xyz'
}

export default class extends Task {
	public async run(): Promise<PartialResponseValue | null> {
		if (!this.client.ready) return { type: ResponseType.Delay, value: 30000 };

		const rawGuilds = this.client.guilds.cache.size;
		const rawUsers = this.client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0);

		this.processAnalytics(rawGuilds, rawUsers);
		if (DEV) return { type: ResponseType.Finished };

		const guilds = rawGuilds.toString();
		const users = rawUsers.toString();
		const results = (
			await Promise.all([
				this.query(`https://top.gg/api/bots/${CLIENT_ID}/stats`, `{"server_count":${guilds}}`, TOKENS.TOP_GG, Lists.TopGG),
				this.query(
					`https://discord.bots.gg/api/v1/bots/${CLIENT_ID}/stats`,
					`{"guildCount":${guilds}}`,
					TOKENS.DISCORD_BOTS,
					Lists.DiscordBotsGG
				),
				this.query(
					`https://botsfordiscord.com/api/bot/${CLIENT_ID}`,
					`{"server_count":${guilds}}`,
					TOKENS.BOTS_FOR_DISCORD_KEY,
					Lists.BotsForDiscord
				),
				this.query(
					`https://discordbotlist.com/api/v1/bots/${CLIENT_ID}/stats`,
					`{"guilds":${guilds},"users":${users}}`,
					TOKENS.DISCORD_BOT_LIST ? `Bot ${TOKENS.DISCORD_BOT_LIST}` : null,
					Lists.DiscordBotList
				),
				this.query(
					`https://bots.ondiscord.xyz/bot-api/bots/${CLIENT_ID}/guilds`,
					`{"guildCount":${guilds}}`,
					TOKENS.BOTS_ON_DISCORD_KEY,
					Lists.BotsOnDiscord
				),
				this.query(
					`https://api.botlist.space/v1/bots/${CLIENT_ID}`,
					`{"server_count":${guilds}}`,
					TOKENS.BOTLIST_SPACE_KEY,
					Lists.BotListSpace
				)
			])
		).filter((value) => value !== null);

		if (results.length) this.client.emit(Events.Verbose, `${header} [ ${guilds} [G] ] [ ${users} [U] ] | ${results.join(' | ')}`);
		return null;
	}

	public async query(url: string, body: string, token: string | null, list: Lists) {
		try {
			if (!token) return null;
			await fetch(
				url,
				{
					body,
					headers: { 'content-type': Mime.Types.ApplicationJson, authorization: token },
					method: 'POST'
				},
				FetchResultTypes.Result
			);
			return g.format(list);
		} catch (error) {
			return `${r.format(list)} [${r.format(error.code)}]`;
		}
	}

	private processAnalytics(guilds: number, users: number) {
		if (ENABLE_INFLUX) this.client.emit(Events.AnalyticsSync, guilds, users);
	}
}
