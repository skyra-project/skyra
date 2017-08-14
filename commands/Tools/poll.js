const { Command } = require('../../index');
const Timer = require('../../utils/timer');

const timeRegExp = /^(\d{1,3} (s(?:ec(?:ond)?)?|m(?:in(?:ute)?)?|h(?:our)?|d(?:ay)?)s? ?)+/;

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            mode: 2,
            cooldown: 15,

            usage: '<equation:string>',
            description: 'Calculate arbitrary maths.',
            extendedHelp: Command.strip`
                Let's make a poll!
                
                = Usage =
                Skyra, list               :: I will show you all active voting polls.
                Skyra, create             :: Create a new voting poll.
                Skyra, remove <ID>        :: Delete a voting poll.
                Skyra, vote <ID> <Option> :: Vote in a voting poll, given ID and option.
                Skyra, result <ID>        :: Check the results of a voting poll.
                
                = Options =
                Timer    :: The duration for the poll. It has the following format: '1d 14h 25m 10s'
                Title    :: The title for the poll.
                *Users   :: The whitelisted users.
                *Roles   :: The whitelisted roles.
                *Options :: The options for the poll. Defaults to 'yes' and 'no'.
                The options with a '*' are optional.
                
                = Reminder =
                When you vote, the option is case sensitive.
                Options must be separated by commas.
                
                = Examples =
                • Skyra, poll create 1d 14h 25m 10s Should I build a house? -roles Admins, Mods -options Yes!, Of course!, No!! -users kyra, 267681855048908801
                    I will create a poll with the following properties:
                    ❯   Timer    :: 1d 14h 25m 10s
                    ❯   Title    :: Should I build a house?
                    ❯   Users    :: kyra, 267681855048908801
                    ❯   Roles    :: Admins, Mods
                    ❯   Options  :: Yes!, Of course!, No!!
            `
        });
    }

    async run(msg, [action, ...raw]) {
        switch (action) {
            case 'create': return this.add(msg, raw);
            case 'list': return this.list(msg);
            case 'remove': return this.remove(msg, raw);
            case 'vote': return this.vote(msg, raw);
            case 'result': return this.result(msg, raw);
            default: throw new Error('Unknown action.');
        }
    }

    async add(msg, raw) {
        let input = raw.length ? raw.join(' ') : null;
        if (!input) throw 'you must write up something.';
        if (!timeRegExp.test(input)) throw 'you must write a valid amount of time.';
        const poll = { time: null, users: null, roles: null, options: null };
        const timestamp = timeRegExp.exec(input)[0];
        input = input.replace(timestamp, '');
        poll.time = new Timer(timestamp.trim());
        if (/-users [^-]+/.test(input)) {
            const selection = /-users ([^-]+)/.exec(input);
            const map = selection[1].split(/, ?/);
            input = input.replace(selection[0], '');
            const fetchUser = this.client.handler.search.user;
            poll.users = [];
            for (const user of map) {
                await fetchUser(user, msg).then(res => poll.users.push(res.id));
            }
        }
        if (/-roles [^-]+/.test(input)) {
            const selection = /-roles ([^-]+)/.exec(input);
            const map = selection[1].split(/, ?/);
            input = input.replace(selection[0], '');
            const fetchRole = this.client.handler.search.role;
            poll.roles = [];
            for (const role of map) {
                await fetchRole(role, msg).then(res => poll.roles.push(res.id));
            }
        }
        if (/-options [^-]+/.test(input)) {
            const selection = /-options ([^-]+)/.exec(input);
            poll.options = selection[1].split(/, ?/);
            input = input.replace(selection[0], '');
        } else {
            poll.options = ['yes', 'no'];
        }
        poll.votes = {};
        poll.options.forEach((entry) => { poll.votes[entry] = 0; });
        poll.title = input.trim();

        const snowflake = await this.clock.create({
            type: 'poll',
            timestamp: poll.time + Date.now(),
            guild: msg.guild.id,
            title: poll.title,
            roles: poll.roles,
            users: poll.users,
            options: poll.options,
            user: msg.author.id,
            votes: poll.votes,
            voted: []
        }).catch((err) => { throw err; });

        return msg.send([
            'Successfully created a poll.',
            `Title: '${poll.title}'`,
            `Roles: ${poll.roles ? poll.roles.join('|') : 'None'}`,
            `Users: ${poll.users ? poll.users.join('|') : 'None'}`,
            `Options: ${poll.options ? poll.options.join('|') : 'None'}`,
            `Duration: ${poll.time} milliseconds.`,
            `ID: ${snowflake}`
        ].join('\n'), { code: 'http' });
    }

    async accepts(msg, entry) {
        if (entry.users && entry.users.includes(msg.author.id)) return true;
        if (entry.roles) {
            for (const role of entry.roles) {
                if (msg.member.roles.has(role)) return true;
            }
            if (entry.users) return false;
        }
        return true;
    }

    async list(msg) {
        const polls = this.clock.tasks.filter(entry => entry.guild === msg.guild.id && entry.type === 'poll' && this.accepts(msg, entry));
        if (polls.length === 0) throw 'I am sorry, but I could not find an active poll here.';
        const message = polls.map(entry => `ID: \`${entry.id}\` *${entry.title}*`);
        return msg.send(message.join('\n'));
    }

    async remove(msg, raw) {
        const input = raw.length ? raw.join(' ') : null;
        if (!input) throw 'you must write up something.';
        const poll = this.clock.tasks.find(entry => entry.guild === msg.guild.id && entry.type === 'poll' && entry.id === input);
        if (!poll) throw 'that poll does not exist.';
        if (poll.user !== msg.author.id && !msg.hasLevel(2)) throw 'you do not have permissions to remove this poll.';
        return msg.prompt('Are you sure you want to remove this poll?')
            .then(async () => {
                await this.clock.remove(poll.id, true);
                return msg.alert(`Success! The poll ${poll.id} has been removed.`);
            })
            .catch(() => msg.alert(`Dear ${msg.author}, you cancelled the poll deletion.`));
    }

    async vote(msg, raw) {
        if (msg.deletable) msg.delete().catch(() => null);
        const input = raw.length ? raw : null;
        if (!input) throw 'you must write up something.';
        const poll = this.clock.tasks.find(entry => entry.guild === msg.guild.id && entry.type === 'poll' && entry.id === input[0]);
        if (!poll) throw 'that poll does not exist.';
        input.shift();
        if (poll.voted.includes(msg.author.id)) throw 'you already voted this.';

        const option = input.join(' ');
        if (!poll.options.includes(option)) return msg.send(`Dear ${msg.author}, please choose between:\n${poll.options.map(opt => `• ${opt}`).join('\n')}`);
        const votes = poll.votes[option] || 0;
        poll.voted.push(msg.author.id);
        await this.clock.update(poll, { voted: poll.voted, votes: { [option]: votes + 1 } }).catch(Command.handleError);
        return msg.send('Vote registered.');
    }

    async result(msg, raw) {
        const input = raw.length ? raw.join(' ') : null;
        if (!input) throw 'you must write up something.';
        const poll = this.clock.tasks.find(entry => entry.type === 'poll' && entry.guild === msg.guild.id && entry.id === input) ||
            this.clock.tasks.find(entry => entry.type === 'pollEnd' && entry.poll.guild === msg.guild.id && entry.poll.id === input);
        if (!poll) throw 'that poll does not exist.';
        if (poll.user !== msg.author.id && !msg.hasLevel(2)) throw 'you do not have permissions to check the results from this poll.';
        const data = poll.type === 'poll' ? poll : poll.poll;
        if (data.voted.length === 0) throw 'I am sorry, but nobody voted in this poll.';
        const graph = [];
        const length = Object.keys(data.votes).reduce((long, str) => Math.max(long, str.length), 0);
        for (const [key, value] of Object.entries(data.votes)) {
            const percentage = Math.round((value / data.voted.length) * 100);
            graph.push(`${key.padEnd(length, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
        }
        return msg.send([
            `Entry ID: '${data.id}' (${data.title})`,
            graph.join('\n')
        ].join('\n'), { code: 'http' });
    }

    get clock() {
        return this.client.clock;
    }

};
