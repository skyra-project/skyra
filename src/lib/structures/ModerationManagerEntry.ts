import { MessageEmbed, TextChannel, User } from 'discord.js';
import { Duration } from 'klasa';
import { Events } from '../types/Enums';
import { GuildSettings } from '../types/settings/GuildSettings';
import { ModerationActions, ModerationErrors, ModerationSchemaKeys, ModerationTypeKeys, TIME, TYPE_ASSETS, ModerationTypeAssets } from '../util/constants';
import { ModerationManager, ModerationManagerUpdateData } from './ModerationManager';

const kTimeout = Symbol('ModerationManagerTimeout');
const regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;

export class ModerationManagerEntry {

	public manager: ModerationManager;
	public id: string | null;
	public case: number | null;
	public duration: number | null;
	public extraData: object | null;
	public moderator: string | User | null;
	public reason: string | null;
	public type: ModerationTypeKeys | null;
	public user: string | User | null;
	public createdAt: number | null;
	private [kTimeout] = Date.now() + (TIME.MINUTE * 15);

	public constructor(manager: ModerationManager, data: Partial<ModerationManagerEntrySerialized | ModerationManagerEntryDeserialized>) {
		this.manager = manager;

		this.id = 'id' in data ? data.id! : null;
		this.case = ModerationSchemaKeys.Case in data ? data[ModerationSchemaKeys.Case]! : null;
		this.duration = ModerationSchemaKeys.Duration in data ? data[ModerationSchemaKeys.Duration]! : null;
		this.extraData = ModerationSchemaKeys.ExtraData in data ? data[ModerationSchemaKeys.ExtraData]! : null;
		this.moderator = ModerationSchemaKeys.Moderator in data ? data[ModerationSchemaKeys.Moderator]! : null;
		this.reason = ModerationSchemaKeys.Reason in data ? data[ModerationSchemaKeys.Reason]! : null;
		this.type = ModerationSchemaKeys.Type in data ? data[ModerationSchemaKeys.Type]! : null;
		this.user = ModerationSchemaKeys.User in data ? data[ModerationSchemaKeys.User]! : null;
		this.createdAt = ModerationSchemaKeys.CreatedAt in data ? data[ModerationSchemaKeys.CreatedAt]! : null;
	}

	public get name() {
		return TYPE_ASSETS[this.type!].title;
	}

	public get appealed() {
		return Boolean(this.type! & ModerationActions.Appealed);
	}

	public get temporary() {
		return Boolean(this.type! & ModerationActions.Temporary);
	}

	public get appealable() {
		return ((this.type! & ~ModerationActions.Temporary) | ModerationActions.Appealed) in TYPE_ASSETS;
	}

	public get temporable() {
		return ((this.type! & ~ModerationActions.Temporary) | ModerationActions.Temporary) in TYPE_ASSETS;
	}

	public get basicType(): ModerationTypeKeys {
		return this.type! & ~(ModerationActions.Appealed | ModerationActions.Temporary);
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
		const user = typeof this.user === 'string' ? this.user : this.user!.id;
		const entries = this.manager.filter(entry => (typeof entry.user === 'string' ? entry.user : entry.user!.id) === user && entry.createdAt! - now < TIME.MINUTE);

		// If there is no moderation log for this user that has not received a report, it should send
		if (!entries.size) return true;

		// If there was a log with the same type in the last minute, do not duplicate
		if (entries.some(entry => entry.basicType === this.basicType)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === ModerationTypeKeys.Ban || this.type === ModerationTypeKeys.UnBan) && entries.some(entry => entry.type === ModerationTypeKeys.Softban)) return false;

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
			[ModerationSchemaKeys.Duration]: typeof duration !== 'undefined' && this.temporable && (duration === null || duration < TIME.YEAR)
				? duration
				: undefined,
			[ModerationSchemaKeys.Moderator]: typeof moderator === 'undefined'
				? undefined
				: typeof moderator === 'string'
					? moderator
					: moderator!.id,
			[ModerationSchemaKeys.Reason]: typeof reason === 'undefined'
				? undefined
				: reason || null,
			[ModerationSchemaKeys.ExtraData]: typeof extraData === 'undefined'
				? undefined
				: extraData,
			[ModerationSchemaKeys.Type]: this.type
		};

		if (typeof flattened[ModerationSchemaKeys.Duration] !== 'undefined') {
			if (flattened[ModerationSchemaKeys.Duration]) flattened[ModerationSchemaKeys.Type]! |= ModerationActions.Temporary;
			else flattened[ModerationSchemaKeys.Type]! &= ~ModerationActions.Temporary;
		}

		if (typeof flattened[ModerationSchemaKeys.Duration] !== 'undefined'
			|| typeof flattened[ModerationSchemaKeys.Moderator] !== 'undefined'
			|| typeof flattened[ModerationSchemaKeys.Reason] !== 'undefined'
			|| typeof flattened[ModerationSchemaKeys.ExtraData] !== 'undefined') {
			await this.manager.table.get(this.id).update(flattened as ModerationManagerEntrySerialized).run();
			if (typeof flattened[ModerationSchemaKeys.Duration] !== 'undefined') this.duration = flattened[ModerationSchemaKeys.Duration]!;
			if (typeof flattened[ModerationSchemaKeys.Moderator] !== 'undefined') this.moderator = flattened[ModerationSchemaKeys.Moderator]!;
			if (typeof flattened[ModerationSchemaKeys.Reason] !== 'undefined') this.reason = flattened[ModerationSchemaKeys.Reason]!;
			if (typeof flattened[ModerationSchemaKeys.ExtraData] !== 'undefined') this.extraData = flattened[ModerationSchemaKeys.ExtraData]!;
			this.type = flattened[ModerationSchemaKeys.Type];
		}

		return this;
	}

	public async appeal() {
		if (this.appealed) return this;
		if (!this.appealable) throw ModerationErrors.CaseTypeNotAppeal;

		const type = this.type! | ModerationActions.Appealed;
		await this.manager.table.get(this.id).update({ [ModerationSchemaKeys.Type]: type }).run();
		this.type = type;

		return this;
	}

	public async prepareEmbed() {
		if (!this.user) throw new Error('A user has not been set.');
		const userID = typeof this.user === 'string' ? this.user : this.user.id;
		const [userTag, moderator] = await Promise.all([
			this.manager.guild!.client.fetchUsername(userID),
			typeof this.moderator === 'string' ? this.manager.guild!.client.users.fetch(this.moderator) : Promise.resolve(this.moderator || this.manager.guild!.client.user)
		]);

		const assets: ModerationTypeAssets = TYPE_ASSETS[this.type!];
		const prefix = this.manager.guild!.settings.get(GuildSettings.Prefix);
		const description = (this.duration
			? [
				`❯ **Type**: ${assets.title}`,
				`❯ **User:** ${userTag} (${userID})`,
				`❯ **Reason:** ${this.reason || `Please use \`${prefix}reason ${this.case} to claim.\``}`,
				`❯ **Expires In**: ${this.manager.guild!.client.languages.default.duration(this.duration)}`
			]
			: [
				`❯ **Type**: ${assets.title}`,
				`❯ **User:** ${userTag} (${userID})`,
				`❯ **Reason:** ${this.reason || `Please use \`${prefix}reason ${this.case} to claim.\``}`
			]
		).join('\n');

		return new MessageEmbed()
			.setColor(assets.color)
			.setAuthor(moderator!.tag, moderator!.displayAvatarURL({ size: 128 }))
			.setDescription(description)
			.setFooter(`Case ${this.case}`, this.manager.guild!.client.user!.displayAvatarURL({ size: 128 }))
			.setTimestamp(new Date(this.createdAt || Date.now()));
	}

	public setCase(value: number) {
		this.case = value;
		return this;
	}

	public setDuration(value: string | number) {
		// If this cannot be reversed, skip
		if (!this.temporable) return this;

		if (typeof value === 'number') this.duration = value;
		else if (typeof value === 'string') this.duration = new Duration(value.trim()).offset;
		if (!this.duration || this.duration > TIME.YEAR) this.duration = null;
		if (this.duration) this.type! |= ModerationActions.Temporary;
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

	public setReason(value?: string | null) {
		if (!value) return this;
		value = (Array.isArray(value) ? value.join(' ') : value).trim();

		if (value && this.temporable) {
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
		if (typeof value === 'string' && (value in ModerationTypeKeys)) {
			value = ModerationTypeKeys[value];
		} else if (typeof value !== 'number') {
			throw new TypeError(`${this} | The type ${value} is not valid.`);
		}

		this.type = value;
		return this;
	}

	public setUser(value: User | string) {
		this.user = value;
		return this;
	}

	public async create() {
		// If the entry was created, there is no point on re-sending
		if (!this.user || this.createdAt) return null;
		this.createdAt = Date.now();

		// If the entry should not send, abort creation
		if (!this.shouldSend) return null;

		this.case = await this.manager.count() + 1;
		[this.id] = (await this.manager.table.insert(this.toJSON()).run()).generated_keys!;
		this.manager.insert(this);

		const channelID = this.manager.guild!.settings.get(GuildSettings.Channels.ModerationLogs);
		const channel = (channelID && this.manager.guild!.channels.get(channelID) as TextChannel) || null;
		if (channel) {
			const messageEmbed = await this.prepareEmbed();
			channel.send(messageEmbed).catch(error => this.manager.guild!.client.emit(Events.ApiError, error));
		}

		if (this.duration) {
			this.manager.guild!.client.schedule.create(TYPE_ASSETS[this.basicType | ModerationActions.Appealed].title.replace(/ /g, '').toLowerCase(), this.duration + Date.now(), {
				catchUp: true,
				data: {
					[ModerationSchemaKeys.User]: typeof this.user === 'string' ? this.user : this.user.id,
					[ModerationSchemaKeys.Guild]: this.manager.guild!.id,
					[ModerationSchemaKeys.Duration]: this.duration,
					[ModerationSchemaKeys.Case]: this.case
				}
			}).catch(error => this.manager.guild!.client.emit(Events.Wtf, error));
		}

		return this;
	}

	public toJSON(): ModerationManagerEntrySerialized {
		const data: ModerationManagerEntrySerialized = {
			[ModerationSchemaKeys.Case]: this.case!,
			[ModerationSchemaKeys.Duration]: this.duration,
			[ModerationSchemaKeys.ExtraData]: this.extraData,
			[ModerationSchemaKeys.Guild]: this.manager.guild!.id,
			[ModerationSchemaKeys.Moderator]: this.moderator ? typeof this.moderator === 'string' ? this.moderator : this.moderator.id : null,
			[ModerationSchemaKeys.Reason]: this.reason,
			[ModerationSchemaKeys.Type]: this.type!,
			[ModerationSchemaKeys.User]: this.user ? typeof this.user === 'string' ? this.user : this.user.id : null,
			[ModerationSchemaKeys.CreatedAt]: this.createdAt
		};
		return data;
	}

	public toString() {
		return `ModerationManagerEntry<${this.id}>`;
	}

}

export interface ModerationManagerEntrySerialized {
	caseID: number;
	createdAt: number | null;
	duration: number | null;
	extraData: object | null;
	guildID: string;
	moderatorID: string | null;
	reason: string | null;
	type: ModerationTypeKeys;
	userID: string | null;
}

export interface ModerationManagerEntryDeserialized extends ModerationManagerEntrySerialized {
	id: string;
}
