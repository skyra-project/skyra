import { Event } from 'klasa';
import { Events } from '../lib/types/Enums';
import { Slotmachine } from '../lib/util/Games/Slotmachine';

export default class extends Event {

	public async run() {
		// Populate the usernames
		for (const user of this.client.users.values()) {
			this.client.usertags.set(user.id, user.tag);
		}

		// Clear all users
		this.client.users.clear();

		// Fill the dictionary name for faster user fetching
		for (const guild of this.client.guilds.values()) {
			const { me } = guild;

			// Populate the snowflakes
			for (const member of guild.members.values()) {
				guild.memberSnowflakes.add(member.id);
			}

			// Clear all members
			guild.members.clear();
			guild.members.set(me.id, me);
			guild.presences.clear();
			guild.emojis.clear();
		}

		try {
			Slotmachine.init().catch(error => this.client.emit(Events.Wtf, error));
			this.client.giveaways.init().catch(error => this.client.emit(Events.Wtf, error));
			this.initCleanupTask().catch(error => this.client.emit(Events.Wtf, error));
			this.initPostStatsTask().catch(error => this.client.emit(Events.Wtf, error));
		} catch (error) {
			this.client.console.wtf(error);
		}
	}

	public async initPostStatsTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'poststats')) {
			await this.client.schedule.create('poststats', '*/15 * * * *', {});
		}
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	public async initCleanupTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'cleanup')) {
			await this.client.schedule.create('cleanup', '*/10 * * * *', {});
		}
	}

}
