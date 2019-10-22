import { CommandStore, KlasaMessage, Serializer, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';
import { Message } from 'discord.js';

const REG_USERS = Serializer.regex.userOrMember;
const REG_TAG = /[^#]{2,32}#\d{4,4}/;
const REG_ROLES = Serializer.regex.role;

export default class extends SkyraCommand {

	public userPrompt = this.definePrompt('<user:username> [...]', ',');
	public rolePrompt = this.definePrompt('<user:rolename> [...]', ',');
	public timePrompt = this.definePrompt('<time:time>');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 15,
			description: language => language.tget('COMMAND_POLL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_POLL_EXTENDED'),
			quotedStringSupport: true,
			runIn: ['text'],
			subcommands: true,
			usage: '<create|list|remove|vote|result> [parameters:string] [...]',
			usageDelim: ' ',
			flagSupport: true
		});
	}

	public async create(message: KlasaMessage, raw: string[]) {
		if (!raw.length) throw message.language.tget('COMMAND_POLL_MISSING_TITLE');
		const [time] = await this.timePrompt.createPrompt(message).run(message.language.tget('COMMAND_POLL_TIME'));
		const title = raw.join(' ');

		let users: string[] = [];
		let roles: string[] = [];
		let options: string[] = [];

		if ('users' in message.flagArgs && message.flagArgs.users !== 'users') {
			users = await this._resolveUsers(message, message.flagArgs.users.split(',').map(user => user.trim()));
		} else if (!('no-prompt' in message.flagArgs)) {
			const wants = await message.ask(message.language.tget('COMMAND_POLL_WANT_USERS'));
			if (wants) users = (await this.userPrompt.createPrompt(message).run(message.language.tget('COMMAND_POLL_FIRSTUSER')) as KlasaUser[]).map(user => user.id);
		}

		if ('roles' in message.flagArgs && message.flagArgs.roles !== 'roles') {
			roles = this._resolveRoles(message, message.flagArgs.roles.split(',').map(role => role.trim()));
		} else if (!('no-prompt' in message.flagArgs)) {
			const wants = await message.ask(message.language.tget('COMMAND_POLL_WANT_ROLES'));
			if (wants) roles = await this.rolePrompt.createPrompt(message).run(message.language.tget('COMMAND_POLL_FIRSTROLE')).catch(() => []);
		}

		options = 'options' in message.flagArgs && message.flagArgs.options !== 'options'
			? message.flagArgs.options.split(',').map(option => option.trim().toLowerCase())
			: ['yes', 'no'];

		const data: RawPollSettings = {
			author_id: message.author!.id,
			guild_id: message.guild!.id,
			options,
			roles,
			timestamp: time.getTime(),
			title,
			users,
			voted: [],
			votes: options.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {})
		};
		const task = await this.client.schedule.create('poll', time, { catchUp: true, data });

		const guildRoles = message.guild!.roles;
		return message.sendMessage(message.language.tget('COMMAND_POLL_CREATE', title,
			roles ? roles.map(role => guildRoles.get(role)!.name) : null,
			users ? users.map(user => this.client.users.get(user)!.username) : null,
			options,
			data.timestamp - Date.now(),
			task.id), { code: 'http' });
	}

	public list(message: KlasaMessage) {
		const polls = this.client.schedule.tasks.filter(task => task.taskName === 'poll' && this._accepts(message, task.data));
		return message.sendMessage(polls.length ? polls.map(entry => `ID: \`${entry.id}\` *${entry.data.title}*`) : message.language.tget('COMMAND_POLL_LIST_EMPTY'));
	}

	public async remove(message: KlasaMessage, [id]: [string]) {
		if (!id) throw message.language.tget('COMMAND_POLL_MISSING_ID');
		const found = this.client.schedule.get(id);
		if (!found || found.taskName !== 'poll') throw message.language.tget('COMMAND_POLL_NOTEXISTS');
		const data = found.data as RawPollSettings;
		if (data.guild_id !== message.guild!.id) throw message.language.tget('COMMAND_POLL_NOTEXISTS');
		if (!(data.author_id === message.author!.id || await message.hasAtLeastPermissionLevel(7))) throw message.language.tget('COMMAND_POLL_NOTMANAGEABLE');
		await found.delete();
		return message.sendLocale('COMMAND_POLL_REMOVE');
	}

	public async vote(message: KlasaMessage, [id, option]: [string, string]) {
		if (!id) throw message.language.tget('COMMAND_POLL_MISSING_ID');
		if (message.deletable) message.nuke().catch(error => this.client.emit(Events.ApiError, error));
		const found = this.client.schedule.get(id);
		if (!found || found.taskName !== 'poll') throw message.language.tget('COMMAND_POLL_NOTEXISTS');
		const data = found.data as RawPollSettings;
		if (data.guild_id !== message.guild!.id) throw message.language.tget('COMMAND_POLL_NOTEXISTS');
		if (data.voted.includes(message.author!.id)) throw message.language.tget('COMMAND_POLL_ALREADY_VOTED');
		if (option) option = option.toLowerCase();
		if (!option || !data.options.includes(option)) throw message.language.tget('COMMAND_POLL_INVALID_OPTION', data.options.map(opt => `\`${opt}\``).join(', '));
		data.votes[option]++;
		data.voted.push(message.author!.id);
		await found.update({ data });
		const m = await message.channel.send(message.language.tget('COMMAND_POLL_VOTE')) as Message;
		return m.nuke(10000);
	}

	public async result(message: KlasaMessage, [id]: [string]) {
		if (!id) throw message.language.tget('COMMAND_POLL_MISSING_ID');
		const poll = this.client.schedule.get(id);
		if (!(poll && (poll.taskName === 'poll' || poll.taskName === 'pollEnd') && poll.data.guild === message.guild!.id)) throw message.language.tget('COMMAND_POLL_NOTEXISTS');
		if (!(message.author!.id === poll.data.author || await message.hasAtLeastPermissionLevel(7))) throw message.language.tget('COMMAND_POLL_NOTMANAGEABLE');

		const { title, options, votes, voted } = poll.data as RawPollSettings;
		if (!voted.length) return message.sendLocale('COMMAND_POLL_EMPTY_VOTES');

		const maxLengthNames = options.reduce((acc, opt) => opt.length > acc ? opt.length : acc, 0);
		const graph: string[] = [];
		for (const opt of options) {
			const percentage = Math.round((votes[opt] / voted.length) * 100);
			graph.push(`${opt.padEnd(maxLengthNames, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
		}
		return message.sendMessage([`Entry ID: '${poll.id}' (${title})`, ...graph].join('\n'), { code: 'http' });
	}

	public _resolveRoles(message: KlasaMessage, roles: string[]) {
		const output: string[] = [];
		for (const role of roles) {
			const resolved = REG_ROLES.test(role)
				? message.guild!.roles.get(REG_ROLES.exec(role)![1])
				: message.guild!.roles.find(r => r.name === role);

			if (resolved) output.push(resolved.id);
		}

		return output;
	}

	public async _resolveUsers(message: KlasaMessage, users: string[]) {
		const output: string[] = [];
		for (const user of users) {
			let resolved: string | undefined;
			if (REG_USERS.test(user)) resolved = (await message.guild!.members.fetch(REG_USERS.exec(user)![1])).id;
			else if (REG_TAG.test(user)) resolved = message.guild!.memberTags.findKey(tag => tag === user);
			else resolved = message.guild!.memberUsernames.findKey(tag => tag === user);

			if (resolved) output.push(resolved);
		}

		return output;
	}

	public _accepts(message: KlasaMessage, { users, roles }: { users: string[]; roles: string[] }) {
		return (users && users.includes(message.author!.id)) || (roles && roles.some(role => message.member!.roles.has(role))) || Boolean(users);
	}

}

export interface RawPollSettings {
	author_id: string;
	guild_id: string;
	title: string;
	timestamp: number;
	options: string[];
	roles: string[];
	users: string[];
	votes: Record<string, number>;
	voted: string[];
}
