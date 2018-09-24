const { Command, Serializer } = require('../../index');

const REG_USERS = Serializer.regex.userOrMember, REG_TAG = /[^#]{2,32}#\d{4,4}/;
const REG_ROLES = Serializer.regex.role;

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 15,
			description: (language) => language.get('COMMAND_POLL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_POLL_EXTENDED'),
			runIn: ['text'],
			usage: '<create|list|remove|vote|result> [parameters:string] [...]',
			usageDelim: ' ',
			quotedStringSupport: true,
			subcommands: true
		});

		this.userPrompt = this.definePrompt('<user:username> [...]', ',');
		this.rolePrompt = this.definePrompt('<user:rolename> [...]', ',');
		this.timePrompt = this.definePrompt('<time:time>');
	}

	public async create(msg, raw) {
		if (!raw.length) throw msg.language.get('COMMAND_POLL_MISSING_TITLE');
		const [time] = await this.timePrompt.createPrompt(msg).run(msg.language.get('COMMAND_POLL_TIME'));
		const title = raw.join(' ');

		let users = null, roles = null, options = null;

		if ('users' in msg.flags && msg.flags.users !== 'users') {
			users = this._resolveUsers(msg.flags.users.split(',').map((user) => user.trim()));
		} else if (!('no-prompt' in msg.flags)) {
			const wants = await msg.ask(msg.language.get('COMMAND_POLL_WANT_USERS'));
			if (wants) users = await this.userPrompt.createPrompt(msg).run(msg.language.get('COMMAND_POLL_FIRSTUSER')).catch(() => null);
		}

		if ('roles' in msg.flags && msg.flags.roles !== 'roles') {
			roles = this._resolveRoles(msg.flags.roles.split(',').map((role) => role.trim()));
		} else if (!('no-prompt' in msg.flags)) {
			const wants = await msg.ask(msg.language.get('COMMAND_POLL_WANT_ROLES'));
			if (wants) roles = await this.rolePrompt.createPrompt(msg).run(msg.language.get('COMMAND_POLL_FIRSTROLE')).catch(() => null);
		}

		if ('options' in msg.flags && msg.flags.options !== 'options')
			options = msg.flags.options.split(',').map((option) => option.trim().toLowerCase());
		else
			options = ['yes', 'no'];

		const data = {
			guild: msg.guild.id,
			options,
			roles: roles ? roles.map((role) => role.id) : null,
			timestamp: time.getTime(),
			title,
			author: msg.author.id,
			users: users ? users.map((user) => user.id) : null,
			votes: options.reduce((acc, cur) => ({...acc,  [cur]: 0}), {}),
			voted: []
		};
		const task = await this.client.schedule.create('poll', time, { catchUp: true, data });

		return msg.sendMessage(msg.language.get('COMMAND_POLL_CREATE', title,
			roles ? roles.map((role) => role.name) : null,
			users ? users.map((user) => user.username) : null,
			options,
			data.timestamp - Date.now(),
			task.id
		), { code: 'http' });
	}

	public list(msg) {
		const polls = this.client.schedule.tasks.filter((task) => task.taskName === 'poll' && this._accepts(msg, task.data));
		return msg.sendMessage(polls.length ? polls.map((entry) => `ID: \`${entry.id}\` *${entry.data.title}*`) : msg.language.get('COMMAND_POLL_LIST_EMPTY'));
	}

	public async remove(msg, [id]) {
		if (!id) throw msg.language.get('COMMAND_POLL_MISSING_ID');
		const found = this.client.schedule.get(id);
		if (!found || found.taskName !== 'poll' || found.data.guild !== msg.guild.id) throw msg.language.get('COMMAND_POLL_NOTEXISTS');
		if (!(msg.author.id === found.data.author || await msg.hasAtLeastPermissionLevel(7))) throw msg.language.get('COMMAND_POLL_NOTMANAGEABLE');
		await found.delete();
		return msg.sendLocale('COMMAND_POLL_REMOVE');
	}

	public async vote(msg, [id, option]) {
		if (!id) throw msg.language.get('COMMAND_POLL_MISSING_ID');
		if (msg.deletable) msg.nuke().catch((error) => this.client.emit('apiError', error));
		const found = this.client.schedule.get(id);
		if (!found || found.taskName !== 'poll' || found.data.guild !== msg.guild.id) throw msg.language.get('COMMAND_POLL_NOTEXISTS');
		if (found.data.voted.includes(msg.author.id)) throw msg.language.get('COMMAND_POLL_ALREADY_VOTED');
		if (option) option = option.toLowerCase();
		if (!option || !found.data.options.includes(option)) throw msg.language.get('COMMAND_POLL_INVALID_OPTION', found.data.options.map((opt) => `\`${opt}\``).join(', '));
		found.data.votes[option]++;
		found.data.voted.push(msg.author.id);
		await found.update({ data: found.data });
		return msg.channel.send(msg.language.get('COMMAND_POLL_VOTE')).then((message) => message.nuke(10000));
	}

	public async result(msg, [id]) {
		if (!id) throw msg.language.get('COMMAND_POLL_MISSING_ID');
		const poll = this.client.schedule.get(id);
		if (!(poll && (poll.taskName === 'poll' || poll.taskName === 'pollEnd') && poll.data.guild === msg.guild.id)) throw msg.language.get('COMMAND_POLL_NOTEXISTS');
		if (!(msg.author.id === poll.data.author || await msg.hasAtLeastPermissionLevel(7))) throw msg.language.get('COMMAND_POLL_NOTMANAGEABLE');

		const { title, options, votes, voted } = poll.data;
		if (!voted.length) return msg.sendLocale('COMMAND_POLL_EMPTY_VOTES');

		const maxLengthNames = options.reduce((acc, opt) => opt.length > acc ? opt.length : acc, 0);
		const graph = [];
		for (const opt of options) {
			const percentage = Math.round((votes[opt] / voted.length) * 100);
			graph.push(`${opt.padEnd(maxLengthNames, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
		}
		return msg.sendMessage([`Entry ID: '${poll.id}' (${title})`, ...graph].join('\n'), { code: 'http' });
	}

	public async _resolveRoles(msg, roles) {
		const output = [];
		for (const role of roles) {
			let resolved;
			if (REG_ROLES.test(role)) resolved = msg.guild.roles.get(REG_ROLES.exec(role)[1]);
			else resolved = msg.guild.roles.find('name', role);

			if (resolved) output.push(resolved.id);
		}

		return output;
	}

	public async _resolveUsers(msg, users) {
		const output = [];
		for (const user of users) {
			let resolved;
			if (REG_USERS.test(user)) resolved = await msg.guild.members.fetch(REG_USERS.exec(user)[1]);
			else if (REG_TAG.test(user)) resolved = msg.guild.members.find('tag', user);
			else resolved = msg.guild.members.find('displayName', user);

			if (resolved) output.push(resolved.id);
		}

		return output;
	}

	public _accepts(msg, { users, roles }) {
		return (users && users.includes(msg.author.id)) || (roles && roles.some((role) => msg.member.roles.has(role))) || !!users;
	}

};
