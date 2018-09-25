const { Task, Timestamp } = require('klasa');

export default class extends Task {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory);

		this.timestamp = new Timestamp('MMMM d, hh:mm:ss');
	}

	public async run(doc) {
		// Fetch the user to send the message to
		const user = await this.client.users.fetch(doc.user).catch(this._catchErrorUser);
		if (user) {
			await user.send(`⏲ Hey! You asked me on ${this.timestamp.displayUTC()} to remind you:\n*${doc.content}*`)
				.catch(this._catchErrorMessage);
		}
	}

	public _catchErrorUser(error) {
		// 10013: Unknown user
		if (error.code === 10013) return;
		throw error;
	}

	public _catchErrorMessage(error) {
		// 50007: Cannot send messages to this user
		if (error.code === 50007) return;
		throw error;
	}

}
