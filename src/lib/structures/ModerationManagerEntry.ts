import { Collection, Snowflake } from 'discord.js';
import { Duration, KlasaTextChannel } from 'klasa';
import { MessageEmbed } from '../types/discord.js';
import { SkyraUser } from '../types/klasa';
import { ModerationLogData, ModerationLogEditData, ModerationTypes } from '../types/skyra';
import { ConstantsModerationTypeAsset, MODERATION, TIME } from '../util/constants';
import ModerationManager from './ModerationManager';

const { TYPE_ASSETS, TYPE_KEYS, SCHEMA_KEYS, ACTIONS, ERRORS } = MODERATION;
const { YEAR } = TIME;

// tslint:disable-next-line:typedef
const kTimeout = Symbol('ModerationManagerTimeout');

const TEMPORARY_TYPES: Array<number> = [TYPE_KEYS.BAN, TYPE_KEYS.MUTE, TYPE_KEYS.VOICE_MUTE];

export default class ModerationManagerEntry {

	public constructor(manager: ModerationManager, data: ModerationLogData) {
		this.manager = manager;
		this.id = 'id' in data ? <string> data.id : null;
		this.case = SCHEMA_KEYS.CASE in data ? data[SCHEMA_KEYS.CASE] : null;
		this.duration = SCHEMA_KEYS.DURATION in data ? data[SCHEMA_KEYS.DURATION] : null;
		this.extraData = SCHEMA_KEYS.EXTRA_DATA in data ? data[SCHEMA_KEYS.EXTRA_DATA] : null;
		this.moderator = SCHEMA_KEYS.MODERATOR in data ? data[SCHEMA_KEYS.MODERATOR] : null;
		this.reason = SCHEMA_KEYS.REASON in data ? data[SCHEMA_KEYS.REASON] : null;
		this.type = SCHEMA_KEYS.TYPE in data ? data[SCHEMA_KEYS.TYPE] : null;
		this.user = SCHEMA_KEYS.USER in data ? data[SCHEMA_KEYS.USER] : null;
		this.createdAt = SCHEMA_KEYS.CREATED_AT in data ? data[SCHEMA_KEYS.CREATED_AT] : null;
		this[kTimeout] = Date.now() + (TIME.MINUTE * 15);
	}

	public case: number | null;
	public createdAt: number | null;
	public duration: number | null;
	public extraData: any;
	public manager: ModerationManager;
	public moderator: Snowflake | SkyraUser | null;
	public reason: string | null;
	public type: ModerationTypes | null;
	public user: Snowflake | SkyraUser | null;
	private [kTimeout]: number;
	private id: string | null;

	public get appealed(): boolean {
		return Boolean(<number> this.type & ACTIONS.APPEALED);
	}

	public get cacheExpired(): boolean {
		return Date.now() > this[kTimeout];
	}

	public get cacheRemaining(): number {
		return Math.max(Date.now() - this[kTimeout], 0);
	}

	public get name(): string | null {
		return this.type && TYPE_ASSETS[this.type].title || null;
	}

	public get shouldSend(): boolean {
		// If the moderation log is not anonymous, it should always send
		if (this.moderator) return true;

		const now: number = Date.now();
		const entries: Collection<number, ModerationManagerEntry> = this.manager.filter((entry) => entry.user === this.user && <number> entry.createdAt - now < TIME.MINUTE);

		// If there is no moderation log for this user that has not received a report, it should send
		if (!entries.size) return true;

		// If there was a log with the same type in the last minute, do not duplicate
		if (entries.some((entry) => entry.type === this.type)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === TYPE_KEYS.BAN || this.type === TYPE_KEYS.UN_BAN) && entries.some((entry) => entry.type === TYPE_KEYS.SOFT_BAN)) return false;

		// For all other cases, it should send
		return true;
	}

	public get temporary(): boolean {
		return Boolean(<ModerationTypes> this.type & ACTIONS.TEMPORARY);
	}

	public async appeal(): Promise<this> {
		if (this.appealed) return this;

		// eslint-disable-next-line no-bitwise
		const type: ModerationTypes = <ModerationTypes> (<ModerationTypes> this.type | ACTIONS.APPEALED);
		if (!(type in TYPE_ASSETS)) throw ERRORS.CASE_TYPE_NOT_APPEAL;

		await this.manager.table.get(this.id).update({ [SCHEMA_KEYS.TYPE]: type }).run();
		this.type = type;

		return this;
	}

	public async create(): Promise<this | null> {
		// If the entry was created, there is no point on re-sending
		if (!this.user || this.createdAt) return null;
		this.createdAt = Date.now();

		// If the entry should not send, abort creation
		if (!this.shouldSend) return null;

		this.case = await this.manager.count() + 1;
		[this.id] = <string[]> (await this.manager.table.insert(this.toJSON()).run()).generated_keys;
		this.manager.insert(this);

		const channel: KlasaTextChannel | null = <KlasaTextChannel | null>
			(this.manager.guild.settings.channels.modlog && this.manager.guild.channels.get(this.manager.guild.settings.channels.modlog)) || null;
		if (channel) {
			const messageEmbed: MessageEmbed = await this.prepareEmbed();
			(channel as KlasaTextChannel).send(messageEmbed).catch((error) => this.manager.guild.client.emit('error', error));
		}

		// eslint-disable-next-line no-bitwise
		if (this.duration && (<ModerationTypes> this.type | ACTIONS.APPEALED) in TYPE_ASSETS) {
			// eslint-disable-next-line no-bitwise
			this.manager.guild.client.schedule.create(TYPE_ASSETS[<ModerationTypes> (<ModerationTypes> this.type | ACTIONS.APPEALED)].title.replace(/ /g, '').toLowerCase(), this.duration + Date.now(), {
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

	public async edit({
		[SCHEMA_KEYS.DURATION]: duration,
		[SCHEMA_KEYS.MODERATOR]: moderator,
		[SCHEMA_KEYS.REASON]: reason,
		[SCHEMA_KEYS.EXTRA_DATA]: extraData }: ModerationLogEditData = {}): Promise<this> {
		const flattened: Exclude<ModerationLogEditData, { id: string }> & { type: ModerationTypes } = {
			[SCHEMA_KEYS.DURATION]: typeof duration !== 'undefined' && TEMPORARY_TYPES.includes(<ModerationTypes> this.type) && (duration === null || duration < YEAR)
				? duration
				: undefined,
			[SCHEMA_KEYS.MODERATOR]: typeof moderator !== 'undefined'
				? typeof moderator === 'string' ? moderator : (<SkyraUser> moderator).id
				: undefined,
			[SCHEMA_KEYS.REASON]: typeof reason !== 'undefined'
				? reason || null
				: undefined,
			[SCHEMA_KEYS.EXTRA_DATA]: typeof extraData !== 'undefined'
				? extraData
				: undefined,
			[SCHEMA_KEYS.TYPE]: <ModerationTypes> this.type
		};

		if (typeof flattened[SCHEMA_KEYS.DURATION] !== 'undefined') {
			flattened[SCHEMA_KEYS.TYPE] = flattened[SCHEMA_KEYS.DURATION]
				? <ModerationTypes> (flattened[SCHEMA_KEYS.TYPE] | ACTIONS.TEMPORARY)
				: <ModerationTypes> (flattened[SCHEMA_KEYS.TYPE] & ~ACTIONS.TEMPORARY);
		}

		if (typeof flattened[SCHEMA_KEYS.DURATION] !== 'undefined'
			|| typeof flattened[SCHEMA_KEYS.MODERATOR] !== 'undefined'
			|| typeof flattened[SCHEMA_KEYS.REASON] !== 'undefined'
			|| typeof flattened[SCHEMA_KEYS.EXTRA_DATA] !== 'undefined') {
			await this.manager.table.get(this.id).update(flattened).run();
			if (typeof flattened[SCHEMA_KEYS.DURATION] !== 'undefined') this.duration = <number | null> flattened[SCHEMA_KEYS.DURATION];
			if (typeof flattened[SCHEMA_KEYS.MODERATOR] !== 'undefined') this.moderator = <Snowflake> flattened[SCHEMA_KEYS.MODERATOR];
			if (typeof flattened[SCHEMA_KEYS.REASON] !== 'undefined') this.reason = <string | null> flattened[SCHEMA_KEYS.REASON];
			if (typeof flattened[SCHEMA_KEYS.EXTRA_DATA] !== 'undefined') this.extraData = flattened[SCHEMA_KEYS.EXTRA_DATA];
			this.type = flattened[SCHEMA_KEYS.TYPE];
		}

		return this;
	}

	public async prepareEmbed(): Promise<MessageEmbed> {
		if (!this.user) throw new Error('A user has not been set.');
		const [user, moderator] = await Promise.all([
			typeof this.user === 'string' ? await this.manager.guild.client.users.fetch(this.user) : this.user,
			typeof this.moderator === 'string' ? await this.manager.guild.client.users.fetch(this.moderator) : this.moderator || this.manager.guild.client.user
		]);

		const assets: ConstantsModerationTypeAsset = TYPE_ASSETS[<ModerationTypes> this.type];
		const description: string = (this.duration ? [
			`❯ **Type**: ${assets.title}`,
			`❯ **User:** ${user.tag} (${user.id})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.manager.guild.settings.prefix}reason ${this.case} to claim.\``}`,
			// @ts-ignore
			`❯ **Expires In**: ${this.manager.guild.client.languages.default.duration(this.duration)}`
		] : [
			`❯ **Type**: ${assets.title}`,
			`❯ **User:** ${user.tag} (${user.id})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.manager.guild.settings.prefix}reason ${this.case} to claim.\``}`
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

	public setDuration(value: number | string): this {
		if (!TEMPORARY_TYPES.includes(<ModerationTypes> this.type)) return this;
		if (typeof value === 'number') this.duration = value;
		else if (typeof value === 'string') this.duration = new Duration(value.trim()).offset;
		if (!this.duration || this.duration > YEAR) this.duration = null;
		if (this.duration) this.type = <ModerationTypes> (<ModerationTypes> this.type | ACTIONS.TEMPORARY);
		return this;
	}

	public setExtraData(value: any): this {
		this.extraData = value;
		return this;
	}

	public setModerator(value: SkyraUser | Snowflake): this {
		this.moderator = value;
		return this;
	}

	public setReason(value: string | null): this {
		if (!value) return this;
		value = (Array.isArray(value) ? value.join(' ') : value).trim();

		if (value && TEMPORARY_TYPES.includes(<ModerationTypes> this.type)) {
			const match: RegExpExecArray | null = ModerationManagerEntry.regexParse.exec(value);
			if (match) {
				this.setDuration(match[1]);
				value = value.slice(0, match.index);
			}
		}

		this.reason = value.length ? value : null;
		return this;
	}

	public setType(value: ModerationTypes): this {
		if (typeof value === 'string' && (value in TYPE_KEYS))
			value = TYPE_KEYS[value];

		else if (typeof value !== 'number')
			throw new TypeError(`${this} | The type ${value} is not valid.`);

		this.type = value;
		return this;
	}

	public setUser(value: SkyraUser | Snowflake): this {
		this.user = value;
		return this;
	}

	public toJSON(): ModerationLogData {
		return {
			[SCHEMA_KEYS.CASE]: <number> this.case,
			[SCHEMA_KEYS.DURATION]: this.duration,
			[SCHEMA_KEYS.EXTRA_DATA]: this.extraData,
			[SCHEMA_KEYS.GUILD]: this.manager.guild.id,
			[SCHEMA_KEYS.MODERATOR]: this.moderator ? typeof this.moderator === 'string' ? this.moderator : this.moderator.id : null,
			[SCHEMA_KEYS.REASON]: this.reason,
			[SCHEMA_KEYS.TYPE]: <ModerationTypes> this.type,
			[SCHEMA_KEYS.USER]: typeof this.user === 'string' ? this.user : (<SkyraUser> this.user).id,
			[SCHEMA_KEYS.CREATED_AT]: this.createdAt
		};
	}

	public toString(): string {
		return `ModerationManagerEntry<${this.id}>`;
	}

	private static regexParse: RegExp = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;

}
