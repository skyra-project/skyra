import { Task, constants: { TIME }, klasaUtil: { codeBlock } } from '../index';
const TASK_EOL = TIME.DAY * 2;

export default class extends Task {

	async run(doc) {
		const guild = this.client.guilds.get(doc.guild);
		if (!guild) return;

		const user = await this.client.users.fetch(doc.author).catch(this._catchErrorUser);
		if (!user) return;

		let content;
		const { id, title, options, votes, voted } = doc;
		if (voted.length) {
			const maxLengthNames = options.reduce((acc, opt) => opt.length > acc ? opt.length : acc, 0);
			const graph = [];
			for (const opt of options) {
				const percentage = Math.round((votes[opt] / voted.length) * 100);
				graph.push(`${opt.padEnd(maxLengthNames, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
			}
			content = `Hey! Your poll __${title}__ with ID \`${id}\` just finished, check the results!${
				codeBlock('http', [`Entry ID: '${id}' (${title})`, ...graph].join('\n'))}`;
		} else {
			content = `Hey! Your poll __${title}__ with ID \`${id}\` just finished, but nobody voted :(`;
		}

		await user.send(content).catch(this._catchErrorMessage);
		await this.client.schedule.create('pollEnd', Date.now() + TASK_EOL, { catchUp: true, data: doc });
	}

	_catchErrorUser(error) {
		// 10013: Unknown user
		if (error.code === 10013) return;
		throw error;
	}

	_catchErrorMessage(error) {
		// 50007: Cannot send messages to this user
		if (error.code === 50007) return;
		throw error;
	}

};
