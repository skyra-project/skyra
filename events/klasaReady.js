const { Event } = require('klasa');

module.exports = class extends Event {

	async run() {
		// Fill the dictionary name for faster user fetching
		for (const user of this.client.users.values()) this.client.dictionaryName.set(user.id, user.username);

		// this.client.user.setActivity('Skyra, help', { type: 'LISTENING' })
		await this.client.user.setActivity('Skyra, help', { type: 'LISTENING' })
			.catch(err => this.client.emit('error', err));

		await this.initCleanupTask();
		await this.initBackupTask();
		await this.initPostStatsTask();
		await this.initGiveawayRecurrentTask();
	}

	async initGiveawayRecurrentTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'giveawayRecurrent')) {
			await this.client.schedule.create('giveawayRecurrent', '*/10 * * * *');
		}
	}

	async initPostStatsTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'poststats')) {
			await this.client.schedule.create('poststats', '*/15 * * * *');
		}
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	async initCleanupTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'cleanup')) {
			await this.client.schedule.create('cleanup', '*/10 * * * *');
		}
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	async initBackupTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'backup')) {
			await this.client.schedule.create('backup', '0 0 * * mon,thu');
		}
	}

};
