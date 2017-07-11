const Rethink = require("../providers/rethink");
const TaskProcess = require("./taskProcess");
const { Snowflake } = require("discord.js");

/**
 * Task scheduler.
 * @interface Clock
 * @class Clock
 */

class Clock {

    constructor(client) {
        this.client = client;
        this.tasks = [];
        this.interval = null;
    }

    async init() {
        this.tasks = await Rethink.getAll("tasks");
        this.sort();
        this.check();
    }

    async create(task) {
        const snowflake = Snowflake.generate();
        Object.assign(task, { id: snowflake, createdAt: new Date().getTime() });
        if (isNaN(task.timestamp)) throw new Error("The property 'timestamp' of task must exist and be a valid timestamp.");
        if (!task.type) throw new Error("The property 'type' of task must be defined.");
        await Rethink.create("tasks", task).catch((err) => { throw err; });
        this.tasks.push(task);
        this.sort();
        this.check();
        return snowflake;
    }

    async execute() {
        /* Do not execute if the Client is not available. */
        if (this.client.status !== 0) return;

        /* Process active tasks. */
        const tasks = this.tasks;
        const now = new Date().getTime();
        const execute = [];
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].timestamp < now) execute[i] = this.process(tasks[i]);
            else break;
        }
        const values = await Promise.all(execute);

        /* Remove finalized tasks or the ones which have at least 5 attempts. */
        const remove = [];
        for (let i = 0; i < values.length; i++) {
            if (values[i] === false) continue;
            remove.push(this.remove(values[i].id, false));
        }
        const removed = await Promise.all(remove);
        this.tasks = tasks.filter(task => !removed.includes(task.id));

        /* And check if the interval should continue, slowdown, or stop */
        this.check();
    }

    async remove(task, cache = true) {
        await Rethink.delete("tasks", task).catch((err) => { throw err; });
        if (cache) this.tasks = this.tasks.filter(entry => entry.id !== task);
        return task;
    }

    async update(task, doc) {
        await Rethink.update("tasks", task.id, doc).catch((err) => { throw err; });
        const index = this.tasks.indexOf(this.tasks.find(t => t.id === task.id));
        for (const key of Object.keys(doc)) {
            if (doc[key] instanceof Object && !(doc[key] instanceof Array)) {
                for (const subkey of Object.keys(doc[key])) this.tasks[index][key][subkey] = doc[key][subkey];
            } else {
                this.tasks[index][key] = doc[key];
            }
        }
        return true;
    }

    process(task) {
        if (!TaskProcess[task.type]) return task;
        return TaskProcess[task.type](this.client, task)
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
            this.interval = null;
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
    }

}

module.exports = Clock;
