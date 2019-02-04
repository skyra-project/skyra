import { IPCMonitor } from '../lib/structures/IPCMonitor';
import { UserSettings } from '../lib/types/namespaces/UserSettings';

export default class extends IPCMonitor {

	public async run(data: WebhookBody) {
		if (data.bot !== this.client.user.id) throw 'BAD';
		const user = await this.client.users.fetch(data.user);
		const settings = await user.settings.sync();

		const payment = data.votes && (data.votes.totalVotes % 5 === 0) ? 2000 : 500;
		const { errors } = await settings.increase(UserSettings.Money, payment);
		if (errors.length) throw String(errors[0]);
		return 'OK';
	}

}

interface WebhookBody {
	user: string;
	bot: string;
	votes: {
		totalVotes: number;
		votes24: number;
		votesMonth: number;
		hasVoted: string[];
		hasVoted24: string[];
	};
	type: 'vote' | 'test';
}
