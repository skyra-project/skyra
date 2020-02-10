import { RawPollSettings } from '@root/commands/Tools/poll';
import { APIErrors } from '@utils/constants';
import { resolveOnErrorCodes } from '@utils/util';
import { constants, Task, util } from 'klasa';
const TASK_EOL = constants.TIME.DAY * 2;

export default class extends Task {

	public async run(poll: RawPollSettings & { id: string }) {
		const guild = this.client.guilds.get(poll.guild_id);
		if (!guild) return;

		const user = await resolveOnErrorCodes(this.client.users.fetch(poll.author_id), APIErrors.UnknownUser);
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
			content = `Hey! Your poll __${title}__ with ID \`${poll.id}\` just finished, check the results!${
				util.codeBlock('http', [`Entry ID: '${poll.id}' (${title})`, ...graph].join('\n'))}`;
		} else {
			content = `Hey! Your poll __${title}__ with ID \`${poll.id}\` just finished, but nobody voted :(`;
		}

		await resolveOnErrorCodes(user.send(content), APIErrors.CannotMessageUser);
		await this.client.schedule.create('pollEnd', Date.now() + TASK_EOL, { catchUp: true, data: poll });
	}

}
