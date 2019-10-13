import { DiscordAPIError } from 'discord.js';
import { constants, Task, util } from 'klasa';
import { Databases } from '../lib/types/constants/Constants';
const TASK_EOL = constants.TIME.DAY * 2;

export default class extends Task {

	public async run({ id }: { id: string }): Promise<void> {
		const poll = await this.client.providers.default.get(Databases.Polls, id) as PollData;
		if (!poll) return;

		const guild = this.client.guilds.get(poll.guild);
		if (!guild) return;

		const user = await this.client.users.fetch(poll.author).catch(error => this._catchErrorUser(error));
		if (!user) return;

		let content: string;
		const { title, options, votes, voted } = poll;
		if (voted.length) {
			const maxLengthNames = options.reduce((acc, opt) => opt.length > acc ? opt.length : acc, 0);
			const graph: string[] = [];
			for (const opt of options) {
				const percentage = Math.round((votes[opt] / voted.length) * 100);
				graph.push(`${opt.padEnd(maxLengthNames, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
			}
			content = `Hey! Your poll __${title}__ with ID \`${id}\` just finished, check the results!${
				util.codeBlock('http', [`Entry ID: '${id}' (${title})`, ...graph].join('\n'))}`;
		} else {
			content = `Hey! Your poll __${title}__ with ID \`${id}\` just finished, but nobody voted :(`;
		}

		await user.send(content).catch(error => this._catchErrorMessage(error));
		await this.client.schedule.create('pollEnd', Date.now() + TASK_EOL, { catchUp: true, data: { id } });
	}

	public _catchErrorUser(error: DiscordAPIError): void {
		// 10013: Unknown user
		if (error.code === 10013) return;
		throw error;
	}

	public _catchErrorMessage(error: DiscordAPIError): void {
		// 50007: Cannot send messages to this user
		if (error.code === 50007) return;
		throw error;
	}

}

export interface PollData {
	id: string;
	author: string;
	guild: string;
	title: string;
	options: string[];
	votes: Record<string, number>;
	voted: string[];
}
