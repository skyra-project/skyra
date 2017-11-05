const RethinkDB = require('../../../providers/rethink');
const TaskProcess = require('./TaskProcess');

/**
 * Task scheduler.
 * @class Clock
 */

class Clock {

	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
		this.tasks = [];
		this.interval = null;

		this.taskProcess = new TaskProcess(client);
	}

	async init() {
		this.tasks = await RethinkDB.getAll('tasks');
		this.sort().check();
	}

	async create(task) {
		if (!task.type) throw new Error('The property \'type\' of task must be defined.');
		if (isNaN(task.timestamp)) throw new Error('The property \'timestamp\' of task must exist and be a valid timestamp.');

		const date = Date.now();
		const id = date.toString(36);
		Object.assign(task, { id, createdAt: date });

		await RethinkDB.create('tasks', task).catch((err) => { throw err; });
		this.tasks.push(task);
		this.sort().check();
		return id;
	}

	async execute() {
		/* Do not execute if the Client is not available. */
		if (this.client.status !== 0) return;

		/* Process active tasks. */
		const tasks = this.tasks;
		const now = Date.now();
		const execute = [];
		for (let i = 0; i < tasks.length; i++) {
			if (tasks[i].timestamp > now) break;
			execute[i] = this.process(tasks[i]);
		}

		if (execute.length === 0) return;

		const values = await Promise.all(execute);

		/* Remove finalized tasks or the ones which have at least 5 attempts. */
		const remove = [];
		for (let i = 0; i < values.length; i++) {
			if (values[i] === false) continue;
			remove.push(this.remove(values[i].id, false));
		}

		if (remove.length === 0) return;

		const removed = await Promise.all(remove);
		this.tasks = tasks.filter(task => !removed.includes(task.id));

		/* And check if the interval should continue, slowdown, or stop */
		this.check();
	}

	async remove(task, cache = true) {
		this.client.emit('log', `CLOCK        | Deleting ${task}`, 'verbose');
		await RethinkDB.delete('tasks', task).catch((err) => { throw err; });
		if (cache) this.tasks = this.tasks.filter(entry => entry.id !== task);
		return task;
	}

	async update(task, doc) {
		await RethinkDB.update('tasks', task.id, doc).catch((err) => { throw err; });
		const index = this.tasks.indexOf(this.tasks.find(ts => ts.id === task.id));
		for (const key of Object.keys(doc)) {
			if (doc[key] instanceof Object && Array.isArray(doc[key]) === false) {
				for (const subkey of Object.keys(doc[key])) this.tasks[index][key][subkey] = doc[key][subkey];
			} else {
				this.tasks[index][key] = doc[key];
			}
		}
		return true;
	}

	process(task) {
		if (typeof this.taskProcess[task.type] === 'undefined') return Promise.resolve(task);
		return this.taskProcess[task.type](task)
			.then(() => task)
			.catch(() => {
				const value = isNaN(task.attempt) ? 0 : task.attempt + 1;
				if (value >= 5) return task;
				task.attempt = value;
				return false;
			});
	}

	newInterval(time) {
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.interval = setInterval(() => this.execute(), time);
	}

	check() {
		if (this.tasks.length === 0) {
			clearInterval(this.interval);
			this.interval = null;
		} else if (!this.interval) this.newInterval(5000);
	}

	sort() {
		this.tasks = this.tasks.sort((x, y) => +(x.timestamp > y.timestamp) || +(x.timestamp === y.timestamp) - 1);
		return this;
	}

}

module.exports = Clock;
