import { MessageEmbed, TextChannel, User } from 'discord.js';
import { Duration } from 'klasa';
import { ModerationActions, ModerationErrors, ModerationSchemaKeys, ModerationTypeKeys, TIME, TYPE_ASSETS } from '../util/constants';
import { ModerationManager, ModerationManagerInsertData, ModerationManagerUpdateData } from './ModerationManager';

const kTimeout = Symbol('ModerationManagerTimeout');

const TEMPORARY_TYPES = [ModerationTypeKeys.Ban, ModerationTypeKeys.Mute, ModerationTypeKeys.VoiceMute];

export class ModerationManagerEntry {

	public manager: ModerationManager;
	public id: string = null;
	public case: number = null;
	public duration: number | null = null;
	public extraData: object = null;
	public moderator: string | User | null = null;
	public reason: string | null = null;
	public type: ModerationTypeKeys = null;
	public user: string | User = null;
	public createdAt: number = null;
	private [kTimeout] = Date.now() + (TIME.MINUTE * 15);

	public constructor(manager: ModerationManager, data: ModerationManagerInsertData) {
		this.manager = manager;
		// @ts-ignore
		if ('id' in data) this.id = data.id;
		if (ModerationSchemaKeys.Case in data) this.case = data[ModerationSchemaKeys.Case];
		if (ModerationSchemaKeys.Duration in data) this.duration = data[ModerationSchemaKeys.Duration];
		if (ModerationSchemaKeys.ExtraData in data) this.extraData = data[ModerationSchemaKeys.ExtraData];
		if (ModerationSchemaKeys.Moderator in data) this.moderator = data[ModerationSchemaKeys.Moderator];
		if (ModerationSchemaKeys.Reason in data) this.reason = data[ModerationSchemaKeys.Reason];
		if (ModerationSchemaKeys.Type in data) this.type = data[ModerationSchemaKeys.Type];
		if (ModerationSchemaKeys.User in data) this.user = data[ModerationSchemaKeys.User];
		if (ModerationSchemaKeys.CreatedAt in data) this.createdAt = data[ModerationSchemaKeys.CreatedAt];
	}

	public get name() {
		return TYPE_ASSETS[this.type].title;
	}

	public get appealed() {
		return Boolean(this.type & ModerationActions.Appealed);
	}

	public get temporary() {
		return Boolean(this.type & ModerationActions.Temporary);
	}

	public get basicType(): ModerationTypeKeys {
		return this.type & ~(ModerationActions.Appealed | ModerationActions.Temporary);
	}

	public get cacheExpired() {
		return Date.now() > this[kTimeout];
	}

	public get cacheRemaining() {
		return Math.max(Date.now() - this[kTimeout], 0);
	}

	public get shouldSend() {
		// If the moderation log is not anonymous, it should always send
		if (this.moderator) return true;

		const now = Date.now();
		const user = typeof this.user === 'string' ? this.user : this.user.id;
		const entries = this.manager.filter((entry) => (typeof entry.user === 'string' ? entry.user : entry.user.id) === user && entry.createdAt - now < TIME.MINUTE);

		// If there is no moderation log for this user that has not received a report, it should send
		if (!entries.size) return true;

		// If there was a log with the same type in the last minute, do not duplicate
		if (entries.some((entry) => entry.basicType === this.basicType)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === ModerationTypeKeys.Ban || this.type === ModerationTypeKeys.UnBan) && entries.some((entry) => entry.type === ModerationTypeKeys.Softban)) return false;

		// For all other cases, it should send
		return true;
	}

	public async edit({
		[ModerationSchemaKeys.Duration]: duration,
		[ModerationSchemaKeys.Moderator]: moderator,
		[ModerationSchemaKeys.Reason]: reason,
		[ModerationSchemaKeys.ExtraData]: extraData
	}: ModerationManagerUpdateData = {}) {
		const flattened = {
			[ModerationSchemaKeys.Duration]: typeof duration !== 'undefined' && TEMPORARY_TYPES.includes(this.type) && (duration === null || duration < TIME.YEAR)
				? duration
				: undefined,
			[ModerationSchemaKeys.Moderator]: typeof moderator !== 'undefined'
				? typeof moderator === 'string' ? moderator : moderator.id
				: undefined,
			[ModerationSchemaKeys.Reason]: typeof reason !== 'undefined'
				? reason || null
				: undefined,
			[ModerationSchemaKeys.ExtraData]: typeof extraData !== 'undefined'
				? extraData
				: undefined,
			[ModerationSchemaKeys.Type]: this.type
		};

		if (typeof flattened[ModerationSchemaKeys.Duration] !== 'undefined') {
			if (flattened[ModerationSchemaKeys.Duration]) flattened[ModerationSchemaKeys.Type] |= ModerationActions.Temporary;
			else flattened[ModerationSchemaKeys.Type] &= ~ModerationActions.Temporary;
		}

		if (typeof flattened[ModerationSchemaKeys.Duration] !== 'undefined'
			|| typeof flattened[ModerationSchemaKeys.Moderator] !== 'undefined'
			|| typeof flattened[ModerationSchemaKeys.Reason] !== 'undefined'
			|| typeof flattened[ModerationSchemaKeys.ExtraData] !== 'undefined') {
			await this.manager.table.get(this.id).update(flattened).run();
			if (typeof flattened[ModerationSchemaKeys.Duration] !== 'undefined') this.duration = flattened[ModerationSchemaKeys.Duration];
			if (typeof flattened[ModerationSchemaKeys.Moderator] !== 'undefined') this.moderator = flattened[ModerationSchemaKeys.Moderator];
			if (typeof flattened[ModerationSchemaKeys.Reason] !== 'undefined') this.reason = flattened[ModerationSchemaKeys.Reason];
			if (typeof flattened[ModerationSchemaKeys.ExtraData] !== 'undefined') this.extraData = flattened[ModerationSchemaKeys.ExtraData];
			this.type = flattened[ModerationSchemaKeys.Type];
		}

		return this;
	}

	public async appeal() {
		if (this.appealed) return this;

		const type = this.type | ModerationActions.Appealed;
		if (!(type in TYPE_ASSETS)) throw ModerationErrors.CaseTypeNotAppeal;

		await this.manager.table.get(this.id).update({ [ModerationSchemaKeys.Type]: type }).run();
		this.type = type;

		return this;
	}

	public async prepareEmbed() {
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

	public setCase(value: number) {
		this.case = value;
		return this;
	}

	public setDuration(value: string | number) {
		if (!TEMPORARY_TYPES.includes(this.type)) return this;
		if (typeof value === 'number') this.duration = value;
		else if (typeof value === 'string') this.duration = new Duration(value.trim()).offset;
		if (!this.duration || this.duration > TIME.YEAR) this.duration = null;
		if (this.duration) this.type |= ModerationActions.Temporary;
		return this;
	}

	public setExtraData(value: object) {
		this.extraData = value;
		return this;
	}

	public setModerator(value: User | string) {
		this.moderator = value;
		return this;
	}

	public setReason(value: string) {
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

	public setType(value: keyof typeof ModerationTypeKeys | ModerationTypeKeys) {
		if (typeof value === 'string' && (value in ModerationTypeKeys))
			value = ModerationTypeKeys[value];

		else if (typeof value !== 'number')
			throw new TypeError(`${this} | The type ${value} is not valid.`);

		this.type = value;
		return this;
	}

	public setUser(value: User | string) {
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

		if (this.duration && (this.type | ModerationActions.Appealed) in TYPE_ASSETS) {
			this.manager.guild.client.schedule.create(TYPE_ASSETS[this.type | ModerationActions.Appealed].title.replace(/ /g, '').toLowerCase(), this.duration + Date.now(), {
				catchUp: true,
				data: {
					[ModerationSchemaKeys.User]: typeof this.user === 'string' ? this.user : this.user.id,
					[ModerationSchemaKeys.Guild]: this.manager.guild.id,
					[ModerationSchemaKeys.Duration]: this.duration,
					[ModerationSchemaKeys.Case]: this.case
				}
			}).catch((error) => this.manager.guild.client.emit('error', error));
		}

		return this;
	}

	public toJSON(): ModerationManagerInsertData {
		return {
			[ModerationSchemaKeys.Case]: this.case,
			[ModerationSchemaKeys.Duration]: this.duration,
			[ModerationSchemaKeys.ExtraData]: this.extraData,
			[ModerationSchemaKeys.Guild]: this.manager.guild.id,
			[ModerationSchemaKeys.Moderator]: this.moderator ? typeof this.moderator === 'string' ? this.moderator : this.moderator.id : null,
			[ModerationSchemaKeys.Reason]: this.reason,
			[ModerationSchemaKeys.Type]: this.type,
			[ModerationSchemaKeys.User]: this.user ? typeof this.user === 'string' ? this.user : this.user.id : null,
			[ModerationSchemaKeys.CreatedAt]: this.createdAt
		} as ModerationManagerInsertData;
	}

	public toString() {
		return `ModerationManagerEntry<${this.id}>`;
	}

}

const regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;
