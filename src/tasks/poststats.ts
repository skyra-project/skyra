import { PartialResponseValue, ResponseType, Task } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { Mime } from '#utils/constants';
import { fetch, FetchResultTypes } from '#utils/util';
import { blueBright, green, red } from 'colorette';
import { Constants } from 'discord.js';

const header = blueBright('[POST STATS   ]');

enum Lists {
	BotListSpace = 'botlist.space',
	BotsForDiscord = 'botsfordiscord.com',
	DiscordBotList = 'discordbotlist.com',
	TopGG = 'top.gg',
	DiscordBotsGG = 'discord.bots.gg',
	BotsOnDiscord = 'bots.ondiscord.xyz'
}

export class UserTask extends Task {
	public async run(): Promise<PartialResponseValue | null> {
		const { client } = this.context;

		// If the websocket isn't ready, delay the execution by 30 seconds:
		if (client.ws.status !== Constants.Status.READY) {
			return { type: ResponseType.Delay, value: 30000 };
		}

		const rawGuilds = client.guilds.cache.size;
		const rawUsers = client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0);

		this.processAnalytics(rawGuilds, rawUsers);
		if (this.context.client.dev) return { type: ResponseType.Finished };

		const guilds = rawGuilds.toString();
		const users = rawUsers.toString();
		const results = (
			await Promise.all([
				this.query(
					`https://top.gg/api/bots/${process.env.CLIENT_ID}/stats`,
					`{"server_count":${guilds}}`,
					process.env.TOP_GG_TOKEN,
					Lists.TopGG
				),
				this.query(
					`https://discord.bots.gg/api/v1/bots/${process.env.CLIENT_ID}/stats`,
					`{"guildCount":${guilds}}`,
					process.env.DISCORD_BOTS_TOKEN,
					Lists.DiscordBotsGG
				),
				this.query(
					`https://botsfordiscord.com/api/bot/${process.env.CLIENT_ID}`,
					`{"server_count":${guilds}}`,
					process.env.BOTS_FOR_DISCORD_TOKEN,
					Lists.BotsForDiscord
				),
				this.query(
					`https://discordbotlist.com/api/v1/bots/${process.env.CLIENT_ID}/stats`,
					`{"guilds":${guilds},"users":${users}}`,
					process.env.DISCORD_BOT_LIST_TOKEN ? `Bot ${process.env.DISCORD_BOT_LIST_TOKEN}` : null,
					Lists.DiscordBotList
				),
				this.query(
					`https://bots.ondiscord.xyz/bot-api/bots/${process.env.CLIENT_ID}/guilds`,
					`{"guildCount":${guilds}}`,
					process.env.BOTS_ON_DISCORD_TOKEN,
					Lists.BotsOnDiscord
				),
				this.query(
					`https://api.botlist.space/v1/bots/${process.env.CLIENT_ID}`,
					`{"server_count":${guilds}}`,
					process.env.BOTLIST_SPACE_TOKEN,
					Lists.BotListSpace
				)
			])
		).filter((value) => value !== null);

		if (results.length) client.logger.trace(`${header} [ ${guilds} [G] ] [ ${users} [U] ] | ${results.join(' | ')}`);
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
			return green(list);
		} catch (error) {
			return `${red(list)} [${red(error.code)}]`;
		}
	}

	private processAnalytics(guilds: number, users: number) {
		this.context.client.emit(Events.AnalyticsSync, guilds, users);
	}
}
