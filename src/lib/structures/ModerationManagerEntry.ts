import { MessageEmbed, TextChannel, User } from 'discord.js';
import { Duration } from 'klasa';
import { MODERATION, TIME } from '../util/constants';
import { ModerationManager, ModerationManagerInsertData, ModerationManagerUpdateData, ModerationTypesEnum } from './ModerationManager';

const { TYPE_ASSETS, TYPE_KEYS, SCHEMA_KEYS, ACTIONS, ERRORS } = MODERATION;
const kTimeout = Symbol('ModerationManagerTimeout');

const TEMPORARY_TYPES = [TYPE_KEYS.BAN, TYPE_KEYS.MUTE, TYPE_KEYS.VOICE_MUTE];

export class ModerationManagerEntry {

	public manager: ModerationManager;
	public id: string = null;
	public case: number = null;
	public duration: number | null = null;
	public extraData: any = null;
	public moderator: string | User | null = null;
	public reason: string | null = null;
	public type: ModerationTypesEnum = null;
	public user: string | User = null;
	public createdAt: number = null;
	private [kTimeout] = Date.now() + (TIME.MINUTE * 15);

	public constructor(manager: ModerationManager, data: ModerationManagerInsertData) {
		this.manager = manager;
		// @ts-ignore
		if ('id' in data) this.id = data.id;
		if (SCHEMA_KEYS.CASE in data) this.case = data[SCHEMA_KEYS.CASE];
		if (SCHEMA_KEYS.DURATION in data) this.duration = data[SCHEMA_KEYS.DURATION];
		if (SCHEMA_KEYS.EXTRA_DATA in data) this.extraData = data[SCHEMA_KEYS.EXTRA_DATA];
		if (SCHEMA_KEYS.MODERATOR in data) this.moderator = data[SCHEMA_KEYS.MODERATOR];
		if (SCHEMA_KEYS.REASON in data) this.reason = data[SCHEMA_KEYS.REASON];
		if (SCHEMA_KEYS.TYPE in data) this.type = data[SCHEMA_KEYS.TYPE];
		if (SCHEMA_KEYS.USER in data) this.user = data[SCHEMA_KEYS.USER];
		if (SCHEMA_KEYS.CREATED_AT in data) this.createdAt = data[SCHEMA_KEYS.CREATED_AT];
	}

	public get name(): string {
		return TYPE_ASSETS[this.type].title;
	}

	public get appealed(): boolean {
		return Boolean(this.type & ACTIONS.APPEALED);
	}

	public get temporary(): boolean {
		return Boolean(this.type & ACTIONS.TEMPORARY);
	}

	public get cacheExpired(): boolean {
		return Date.now() > this[kTimeout];
	}

	public get cacheRemaining(): number {
		return Math.max(Date.now() - this[kTimeout], 0);
	}

	public get shouldSend(): boolean {
		// If the moderation log is not anonymous, it should always send
		if (this.moderator) return true;

		const now = Date.now();
		const user = typeof this.user === 'string' ? this.user : this.user.id;
		// @ts-ignore
		const entries = this.manager.filter((entry) => (typeof entry.user === 'string' ? entry.user : entry.user.id) === user && entry.createdAt - now < TIME.MINUTE);

		// If there is no moderation log for this user that has not received a report, it should send
		if (!entries.size) return true;

		// If there was a log with the same type in the last minute, do not duplicate
		if (entries.some((entry) => entry.type === this.type)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === TYPE_KEYS.BAN || this.type === TYPE_KEYS.UN_BAN) && entries.some((entry) => entry.type === TYPE_KEYS.SOFT_BAN)) return false;

		// For all other cases, it should send
		return true;
	}

	public async edit({
		[SCHEMA_KEYS.DURATION]: duration,
		[SCHEMA_KEYS.MODERATOR]: moderator,
		[SCHEMA_KEYS.REASON]: reason,
		[SCHEMA_KEYS.EXTRA_DATA]: extraData
	}: ModerationManagerUpdateData = {}): Promise<this> {
		const flattened = {
			[SCHEMA_KEYS.DURATION]: typeof duration !== 'undefined' && TEMPORARY_TYPES.includes(this.type) && (duration === null || duration < TIME.YEAR)
				? duration
				: undefined,
			[SCHEMA_KEYS.MODERATOR]: typeof moderator !== 'undefined'
				? typeof moderator === 'string' ? moderator : moderator.id
				: undefined,
			[SCHEMA_KEYS.REASON]: typeof reason !== 'undefined'
				? reason || null
				: undefined,
			[SCHEMA_KEYS.EXTRA_DATA]: typeof extraData !== 'undefined'
				? extraData
				: undefined,
			[SCHEMA_KEYS.TYPE]: this.type
		};

		if (typeof flattened[SCHEMA_KEYS.DURATION] !== 'undefined') {
			// eslint-disable-next-line no-bitwise
			if (flattened[SCHEMA_KEYS.DURATION]) flattened[SCHEMA_KEYS.TYPE] |= ACTIONS.TEMPORARY;
			// eslint-disable-next-line no-bitwise
			else flattened[SCHEMA_KEYS.TYPE] &= ~ACTIONS.TEMPORARY;
		}

		if (typeof flattened[SCHEMA_KEYS.DURATION] !== 'undefined'
			|| typeof flattened[SCHEMA_KEYS.MODERATOR] !== 'undefined'
			|| typeof flattened[SCHEMA_KEYS.REASON] !== 'undefined'
			|| typeof flattened[SCHEMA_KEYS.EXTRA_DATA] !== 'undefined') {
			await this.manager.table.get(this.id).update(flattened).run();
			if (typeof flattened[SCHEMA_KEYS.DURATION] !== 'undefined') this.duration = flattened[SCHEMA_KEYS.DURATION];
			if (typeof flattened[SCHEMA_KEYS.MODERATOR] !== 'undefined') this.moderator = flattened[SCHEMA_KEYS.MODERATOR];
			if (typeof flattened[SCHEMA_KEYS.REASON] !== 'undefined') this.reason = flattened[SCHEMA_KEYS.REASON];
			if (typeof flattened[SCHEMA_KEYS.EXTRA_DATA] !== 'undefined') this.extraData = flattened[SCHEMA_KEYS.EXTRA_DATA];
			this.type = flattened[SCHEMA_KEYS.TYPE];
		}

		return this;
	}

	public async appeal(): Promise<this> {
		if (this.appealed) return this;

		// eslint-disable-next-line no-bitwise
		const type = this.type | ACTIONS.APPEALED;
		if (!(type in TYPE_ASSETS)) throw ERRORS.CASE_TYPE_NOT_APPEAL;

		await this.manager.table.get(this.id).update({ [SCHEMA_KEYS.TYPE]: type }).run();
		this.type = <ModerationTypesEnum> type;

		return this;
	}

	public async prepareEmbed(): Promise<MessageEmbed> {
		if (!this.user) throw new Error('A user has not been set.');
		const userID = typeof this.user === 'string' ? this.user : this.user.id;
		const [userTag, moderator] = await Promise.all([
			this.manager.guild.client.fetchUsername(userID),
			typeof this.moderator === 'string' ? this.manager.guild.client.users.fetch(this.moderator) : this.moderator || this.manager.guild.client.user
		]);

		const assets = TYPE_ASSETS[this.type];
		const description = (this.duration ? [
			`❯ **Type**: ${assets.title}`,
			`❯ **User:** ${userTag} (${userID})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.manager.guild.settings.get('prefix')}reason ${this.case} to claim.\``}`,
			// @ts-ignore
			`❯ **Expires In**: ${this.manager.guild.client.languages.default.duration(this.duration)}`
		] : [
			`❯ **Type**: ${assets.title}`,
			`❯ **User:** ${userTag} (${userID})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.manager.guild.settings.get('prefix')}reason ${this.case} to claim.\``}`
		]).join('\n');

		return new MessageEmbed()
			.setColor(assets.color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
			.setDescription(description)
			.setFooter(`Case ${this.case}`, this.manager.guild.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp(new Date(this.createdAt || Date.now()));
	}

	public setCase(value: number): this {
		this.case = value;
		return this;
	}

	public setDuration(value: string | number): this {
		if (!TEMPORARY_TYPES.includes(this.type)) return this;
		if (typeof value === 'number') this.duration = value;
		else if (typeof value === 'string') this.duration = new Duration(value.trim()).offset;
		if (!this.duration || this.duration > TIME.YEAR) this.duration = null;
		// eslint-disable-next-line no-bitwise
		if (this.duration) this.type |= ACTIONS.TEMPORARY;
		return this;
	}

	public setExtraData(value: any): this {
		this.extraData = value;
		return this;
	}

	public setModerator(value: User | string): this {
		this.moderator = value;
		return this;
	}

	public setReason(value: string): this {
		if (!value) return this;
		value = (Array.isArray(value) ? value.join(' ') : value).trim();

		if (value && TEMPORARY_TYPES.includes(this.type)) {
			const match = regexParse.exec(value);
			if (match) {
				this.setDuration(match[1]);
				value = value.slice(0, match.index);
			}
		}

		this.reason = value.length ? value : null;
		return this;
	}

	public setType(value: ModerationTypesEnum): this {
		if (typeof value === 'string' && (value in TYPE_KEYS))
			value = TYPE_KEYS[value];

		else if (typeof value !== 'number')
			throw new TypeError(`${this} | The type ${value} is not valid.`);

		this.type = value;
		return this;
	}

	public setUser(value: User | string): this {
		this.user = value;
		return this;
	}

	public async create(): Promise<this> {
		// If the entry was created, there is no point on re-sending
		if (!this.user || this.createdAt) return null;
		this.createdAt = Date.now();

		// If the entry should not send, abort creation
		if (!this.shouldSend) return null;

		this.case = await this.manager.count() + 1;
		[this.id] = (await this.manager.table.insert(this.toJSON()).run()).generated_keys;
		// @ts-ignore
		this.manager.insert(this);

		const channelID = this.manager.guild.settings.get('channels.modlog') as string;
		const channel = (channelID && this.manager.guild.channels.get(channelID) as TextChannel) || null;
		if (channel) {
			const messageEmbed = await this.prepareEmbed();
			channel.send(messageEmbed).catch((error) => this.manager.guild.client.emit('error', error));
		}

		// eslint-disable-next-line no-bitwise
		if (this.duration && (this.type | ACTIONS.APPEALED) in TYPE_ASSETS) {
			// eslint-disable-next-line no-bitwise
			this.manager.guild.client.schedule.create(TYPE_ASSETS[this.type | ACTIONS.APPEALED].title.replace(/ /g, '').toLowerCase(), this.duration + Date.now(), {
				catchUp: true,
				data: {
					[SCHEMA_KEYS.USER]: typeof this.user === 'string' ? this.user : this.user.id,
					[SCHEMA_KEYS.GUILD]: this.manager.guild.id,
					[SCHEMA_KEYS.DURATION]: this.duration,
					[SCHEMA_KEYS.CASE]: this.case
				}
			}).catch((error) => this.manager.guild.client.emit('error', error));
		}

		return this;
	}

	public toJSON(): ModerationManagerInsertData {
		return {
			[SCHEMA_KEYS.CASE]: this.case,
			[SCHEMA_KEYS.DURATION]: this.duration,
			[SCHEMA_KEYS.EXTRA_DATA]: this.extraData,
			[SCHEMA_KEYS.GUILD]: this.manager.guild.id,
			[SCHEMA_KEYS.MODERATOR]: this.moderator ? typeof this.moderator === 'string' ? this.moderator : this.moderator.id : null,
			[SCHEMA_KEYS.REASON]: this.reason,
			[SCHEMA_KEYS.TYPE]: this.type,
			[SCHEMA_KEYS.USER]: this.user ? typeof this.user === 'string' ? this.user : this.user.id : null,
			[SCHEMA_KEYS.CREATED_AT]: this.createdAt
		} as ModerationManagerInsertData;
	}

	public toString(): string {
		return `ModerationManagerEntry<${this.id}>`;
	}

}

const regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;
