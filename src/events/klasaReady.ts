const { Event } = require('../index');

module.exports = class extends Event {

	public async run() {
		await this.initCleanupTask();
		await this.initBackupTask();
		await this.initPostStatsTask();
		await this.initGiveawayRecurrentTask();
	}

	public async initGiveawayRecurrentTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task) => task.taskName === 'giveawayRecurrent'))
			await this.client.schedule.create('giveawayRecurrent', '*/10 * * * *', {});
	}

	public async initPostStatsTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task) => task.taskName === 'poststats'))
			await this.client.schedule.create('poststats', '*/15 * * * *', {});
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	public async initCleanupTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task) => task.taskName === 'cleanup'))
			await this.client.schedule.create('cleanup', '*/10 * * * *', {});
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every Monday and Thursday,
	// one minute after the backup.
	public async initDBSweepTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task) => task.taskName === 'databaseSweep'))
			await this.client.schedule.create('databaseSweep', '1 0 * * mon,thu', {});
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every Monday and Thursday.
	public async initBackupTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task) => task.taskName === 'backup'))
			await this.client.schedule.create('backup', '0 0 * * *', {});
	}

};
