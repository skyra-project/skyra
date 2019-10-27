import { MessageEmbed, TextChannel, User } from 'discord.js';
import { Duration } from 'klasa';
import { Events } from '../types/Enums';
import { GuildSettings } from '../types/settings/GuildSettings';
import { ModerationActions, ModerationErrors, ModerationSchemaKeys, ModerationTypeKeys, TIME, TYPE_ASSETS, ModerationTypeAssets } from '../util/constants';
import { ModerationManager, ModerationManagerUpdateData, ModerationManagerInsertData } from './ModerationManager';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';
import { isNullOrUndefined } from '../util/util';
import { CLIENT_ID } from '../../../config';

const kTimeout = Symbol('ModerationManagerTimeout');
const regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;

export class ModerationManagerEntry {

	public manager: ModerationManager;
	public case: number | null;
	public duration: number | null;
	public extraData: object | null;
	public moderator: string | User | null;
	public reason: string | null;
	public type: ModerationTypeKeys;
	public user: string | User;
	public createdAt: number | null;
	private [kTimeout] = Date.now() + (TIME.MINUTE * 15);

	public constructor(manager: ModerationManager, data: ModerationManagerInsertData) {
		this.manager = manager;

		this.case = data.case_id || null;
		this.duration = data.duration || null;
		this.extraData = data.extra_data || null;
		this.moderator = data.moderator_id || null;
		this.reason = data.reason || null;
		this.type = data.type;
		this.user = data.user_id;
		this.createdAt = data.created_at || null;
	}

	public get client() {
		return this.manager.client;
	}

	public get name() {
		return this.type in TYPE_ASSETS ? TYPE_ASSETS[this.type].title : 'Unknown';
	}

	public get appealed() {
		return Boolean(this.type & ModerationActions.Appealed);
	}

	public get temporary() {
		return Boolean(this.type & ModerationActions.Temporary);
	}

	public get appealable() {
		return ((this.type & ~ModerationActions.Temporary) | ModerationActions.Appealed) in TYPE_ASSETS;
	}

	public get temporable() {
		return ((this.type & ~ModerationActions.Temporary) | ModerationActions.Temporary) in TYPE_ASSETS;
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

	public get flattenedModerator() {
		return this.moderator === null
			? CLIENT_ID
			: typeof this.moderator === 'string'
				? this.moderator
				: this.moderator.id;
	}

	public get flattenedUser() {
		return typeof this.user === 'string'
			? this.user
			: this.user.id;
	}

	public get shouldSend() {
		// If the moderation log is not anonymous, it should always send
		if (this.moderator) return true;

		const now = Date.now();
		const user = typeof this.user === 'string' ? this.user : this.user.id;
		const entries = this.manager.filter(entry => (typeof entry.user === 'string' ? entry.user : entry.user.id) === user && entry.createdAt! - now < TIME.MINUTE);

		// If there is no moderation log for this user that has not received a report, it should send
		if (!entries.size) return true;

		// If there was a log with the same type in the last minute, do not duplicate
		if (entries.some(entry => entry.basicType === this.basicType)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === ModerationTypeKeys.Ban || this.type === ModerationTypeKeys.UnBan) && entries.some(entry => entry.type === ModerationTypeKeys.Softban)) return false;

		// For all other cases, it should send
		return true;
	}

	public async edit(data: ModerationManagerUpdateData = {}) {
		const flattened: ModerationManagerUpdateDataWithType = {
			duration: isNullOrUndefined(data.duration) || !this.temporable || data.duration > TIME.YEAR
				? this.duration
				: data.duration || null,
			moderator_id: typeof data.moderator_id === 'undefined'
				? this.flattenedModerator
				: data.moderator_id,
			reason: typeof data.reason === 'undefined'
				? this.reason
				: data.reason || null,
			extra_data: typeof data.extra_data === 'undefined'
				? this.extraData
				: data.extra_data,
			type: this.type
		};

		if (typeof flattened.duration !== 'undefined') {
			if (flattened.duration) flattened.type |= ModerationActions.Temporary;
			else flattened.type &= ~ModerationActions.Temporary;
		}

		await this.client.queries.updateModerationLog({ ...this.toJSON(), ...flattened });
		this.duration = flattened.duration;
		this.moderator = flattened.moderator_id;
		this.reason = flattened.reason;
		this.extraData = flattened.extra_data;
		this.type = flattened.type;

		return this;
	}

	public async appeal() {
		if (this.appealed) return this;
		if (!this.appealable) throw ModerationErrors.CaseTypeNotAppeal;

		const type = this.type | ModerationActions.Appealed;
		await this.client.queries.updateModerationLog({ ...this.toJSON(), type });
		this.type = type;

		return this;
	}

	public async prepareEmbed() {
		if (!this.user) throw new Error('A user has not been set.');
		const userID = typeof this.user === 'string' ? this.user : this.user.id;
		const [userTag, moderator] = await Promise.all([
			this.manager.guild.client.fetchUsername(userID),
			typeof this.moderator === 'string' ? this.manager.guild.client.users.fetch(this.moderator) : Promise.resolve(this.moderator || this.manager.guild.client.user)
		]);

		const assets: ModerationTypeAssets = TYPE_ASSETS[this.type];
		const prefix = this.manager.guild.settings.get(GuildSettings.Prefix);
		const description = (this.duration
			? [
				`❯ **Type**: ${assets.title}`,
				`❯ **User:** ${userTag} (${userID})`,
				`❯ **Reason:** ${this.reason || `Please use \`${prefix}reason ${this.case} to claim.\``}`,
				`❯ **Expires In**: ${this.manager.guild.client.languages.default.duration(this.duration)}`
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
			.setFooter(`Case ${this.case}`, this.manager.guild.client.user!.displayAvatarURL({ size: 128 }))
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

	public setReason(value?: string | null) {
		if (!value) return this;
		value = value.trim();

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
		await this.client.queries.insertModerationLog(this.toJSON());
		this.manager.insert(this);

		const channelID = this.manager.guild.settings.get(GuildSettings.Channels.ModerationLogs);
		const channel = (channelID && this.manager.guild.channels.get(channelID) as TextChannel) || null;
		if (channel) {
			const messageEmbed = await this.prepareEmbed();
			channel.send(messageEmbed).catch(error => this.manager.guild.client.emit(Events.ApiError, error));
		}

		if (this.duration) {
			this.manager.guild.client.schedule.create(TYPE_ASSETS[this.basicType | ModerationActions.Appealed].title.replace(/ /g, '').toLowerCase(), this.duration + Date.now(), {
				catchUp: true,
				data: {
					[ModerationSchemaKeys.User]: typeof this.user === 'string' ? this.user : this.user.id,
					[ModerationSchemaKeys.Guild]: this.manager.guild.id,
					[ModerationSchemaKeys.Duration]: this.duration,
					[ModerationSchemaKeys.Case]: this.case
				}
			}).catch(error => this.manager.guild.client.emit(Events.Wtf, error));
		}

		return this;
	}

	public toJSON(): RawModerationSettings {
		if (this.case === null) throw new TypeError('Cannot serialize incomplete entry.');
		return {
			case_id: this.case,
			duration: this.duration,
			extra_data: this.extraData,
			guild_id: this.manager.guild.id,
			moderator_id: this.flattenedModerator,
			reason: this.reason,
			type: this.type,
			user_id: this.flattenedUser,
			created_at: this.createdAt
		};
	}

}

type ModerationManagerUpdateDataWithType = Pick<RawModerationSettings, 'duration' | 'extra_data' | 'moderator_id' | 'reason' | 'type'>;
