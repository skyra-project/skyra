const { Command, Timer, util } = require('../../index');
const listify = require('../../functions/listify');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['remind', 'reminder'],
            mode: 2,
            cooldown: 30,

            usage: '<input:string>',
            description: 'Add reminders.',
            extend: {
                EXPLANATION: 'This command allows you to set, delete and list reminders.',
                ARGUMENTS: '[to ][title] [time]',
                EXP_USAGE: [
                    ['title', 'What you want me to remind you.'],
                    ['time', 'The time the reminder should last. If not provided, Skyra will ask for it in a prompt.']
                ],
                EXAMPLES: [
                    'to get dailies in 12h'
                ]
            }
        });

        this.defaultParams = {
            list: null,
            delete: null
        };
    }

    async run(msg, [raw], settings, i18n) {
        // Check if it should try to list all reminders.
        if (this.getListParams(i18n).includes(raw))
            return this.listReminders(msg, i18n);
        // Check if it should try to delete a reminder.
        if (this.getDeleteParams(i18n).includes(raw.slice(0, raw.indexOf(' '))))
            return this.deleteReminder(msg, raw, i18n);

        const { time, title } = await this.parseInput(msg, raw, i18n)
            .catch(Command.handleError);

        const id = await this.client.handler.clock.create({
            type: 'reminder',
            timestamp: time + Date.now(),
            user: msg.author.id,
            content: title
        }).catch(Command.handleError);

        return msg.send(i18n.get('COMMAND_REMINDME_CREATE', id));
    }

    getListParams(i18n) {
        const params = i18n.language.COMMAND_REMINDME_LIST_PARAMS;
        if (typeof params !== 'undefined' && Array.isArray(params)) return [...params, ...this.defaultParams.list];
        return this.defaultParams.list;
    }

    async listReminders(msg, i18n) {
        const tasks = this.client.handler.clock.tasks.filter(entry => entry.type === 'reminder' && entry.user === msg.author.id);
        if (tasks.length === 0)
            throw i18n.get('COMMAND_REMINDME_LIST_EMPTY');

        return msg.send(util.codeBlock('asciidoc', listify(tasks.map(task => [task.id, task.content.length > 40 ? `${task.content.slice(0, 40)}...` : task.content]), { length: 10 })));
    }

    getDeleteParams(i18n) {
        const params = i18n.language.COMMAND_REMINDME_DELETE_PARAMS;
        if (typeof params !== 'undefined' && Array.isArray(params)) return [...params, ...this.defaultParams.delete];
        return this.defaultParams.delete;
    }

    async deleteReminder(msg, raw, i18n) {
        const parameters = raw.split(' ');
        if (parameters.length !== 2)
            throw i18n.get('COMMAND_REMINDME_DELETE_INVALID_PARAMETERS');

        const id = parameters[1];
        const valid = !isNaN(Number.parseInt(id, 36));
        if (valid === false)
            throw i18n.get('COMMAND_REMINDME_INVALID_ID');

        const task = this.client.handler.clock.tasks.find(entry => entry.type === 'reminder' && entry.id === id && entry.user === msg.author.id);
        if (typeof task === 'undefined')
            throw i18n.get('COMMAND_REMINDME_NOTFOUND');

        await this.client.handler.clock.remove(task.id, true);
        return msg.send(i18n.get('COMMAND_REMINDME_DELETE', task));
    }

    async parseInput(msg, string, i18n) {
        const parsed = {
            time: null,
            title: null
        };

        if (/^in\s/.test(string)) {
            const indexOfTitle = string.lastIndexOf(' to ');
            parsed.time = new Timer(string.slice(3, indexOfTitle > -1 ? indexOfTitle : undefined)).Duration;
            if (parsed.time < 60000)
                parsed.time = await this.askTime(msg, i18n.get('COMMAND_REMINDME_INPUT_PROMPT'), i18n)
                    .catch(Command.handleError);

            parsed.title = indexOfTitle > -1 ? string.slice(indexOfTitle + 4) : 'Something, you did not tell me what to remind you.';
        } else {
            const indexOfTime = string.lastIndexOf(' in ');
            parsed.title = string.slice(/^to\s/.test(string) ? 3 : 0, indexOfTime > -1 ? indexOfTime : undefined);

            if (indexOfTime === -1)
                parsed.time = await this.askTime(msg, i18n.get('COMMAND_REMINDME_INPUT_PROMPT'), i18n)
                    .catch(Command.handleError);
            else {
                parsed.time = new Timer(string.slice(indexOfTime + 4)).Duration;
                if (parsed.time < 60000)
                    parsed.time = await this.askTime(msg, i18n.get('COMMAND_REMINDME_INPUT_PROMPT'), i18n)
                        .catch(Command.handleError);
            }
        }

        return parsed;
    }

    async askTime(msg, alert, i18n) {
        await msg.send(alert);
        const messages = await msg.channel.awaitMessages((message) => message.author.id === msg.author.id, { time: 30000, max: 1 });
        if (messages.size === 0) throw null;
        const message = messages.first();
        const time = new Timer(message.content).Duration;
        if (time < 60000)
            return this.askTime(msg, i18n.get('COMMAND_REMINDME_TIME'), i18n);

        return time;
    }

    init() {
        const language = this.client.languages.get('en-US').language;
        this.defaultParams.list = language.COMMAND_REMINDME_LIST_PARAMS;
        this.defaultParams.delete = language.COMMAND_REMINDME_DELETE_PARAMS;
    }

};
