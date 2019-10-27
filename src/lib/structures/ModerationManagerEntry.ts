import { MessageEmbed, TextChannel, User } from 'discord.js';
import { Duration } from 'klasa';
import { Events } from '../types/Enums';
import { GuildSettings } from '../types/settings/GuildSettings';
import { Moderation, TIME } from '../util/constants';
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
	public type: Moderation.TypeCodes;
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

	/**
	 * The Client that manages this instance.
	 */
	public get client() {
		return this.manager.client;
	}

	public get metadata() {
		return Moderation.metadata.get(this.type) || null;
	}

	public get title() {
		const { metadata } = this;
		return metadata ? metadata.title : 'Unknown';
	}

	public get color() {
		const { metadata } = this;
		return metadata ? metadata.color : 0x000000;
	}

	public get createdTimestamp() {
		return this.createdAt || Date.now();
	}

	public get typeVariation() {
		return this.type & Moderation.TypeBits.Variation;
	}

	public get typeMetadata() {
		return this.type & Moderation.TypeBits.Metadata;
	}

	public get appealed() {
		return this.typeMetadata === Moderation.TypeMetadata.Appealed;
	}

	public get temporary() {
		return this.typeMetadata === Moderation.TypeMetadata.Temporary;
	}

	public get fast() {
		return this.typeMetadata === Moderation.TypeMetadata.Fast;
	}

	public get invalidated() {
		return this.typeMetadata === Moderation.TypeMetadata.Invalidated;
	}

	public get appealable() {
		return !this.appealed && Moderation.metadata.has(this.typeVariation | Moderation.TypeMetadata.Appealed);
	}

	public get temporable() {
		return !this.temporary && Moderation.metadata.has(this.typeVariation | Moderation.TypeMetadata.Temporary);
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
		if (entries.some(entry => entry.typeVariation === this.typeVariation)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === Moderation.TypeCodes.Ban || this.type === Moderation.TypeCodes.UnBan)
			&& entries.some(entry => entry.type === Moderation.TypeCodes.Softban)) {
			return false;
		}

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
			if (flattened.duration) flattened.type |= Moderation.TypeMetadata.Temporary;
			else flattened.type &= ~Moderation.TypeMetadata.Temporary;
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
		if (!this.appealable) throw Moderation.CommandErrors.CaseTypeNotAppeal;

		const type = this.type | Moderation.TypeMetadata.Appealed;
		await this.client.queries.updateModerationLog({ ...this.toJSON(), type });
		this.type = type;

		return this;
	}

	public async prepareEmbed() {
		if (!this.user) throw new Error('A user has not been set.');
		const userID = typeof this.user === 'string' ? this.user : this.user.id;
		const [userTag, moderator] = await Promise.all([
			this.manager.guild.client.fetchUsername(userID),
			typeof this.moderator === 'string' ? this.manager.guild.client.users.fetch(this.moderator) : Promise.resolve(this.moderator || this.manager.guild.client.user!)
		]);

		const prefix = this.manager.guild.settings.get(GuildSettings.Prefix);
		const description = (this.duration
			? [
				`❯ **Type**: ${this.title}`,
				`❯ **User:** ${userTag} (${userID})`,
				`❯ **Reason:** ${this.reason || `Please use \`${prefix}reason ${this.case} to claim.\``}`,
				`❯ **Expires In**: ${this.manager.guild.client.languages.default.duration(this.duration)}`
			]
			: [
				`❯ **Type**: ${this.title}`,
				`❯ **User:** ${userTag} (${userID})`,
				`❯ **Reason:** ${this.reason || `Please use \`${prefix}reason ${this.case} to claim.\``}`
			]
		).join('\n');

		return new MessageEmbed()
			.setColor(this.color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
			.setDescription(description)
			.setFooter(`Case ${this.case}`, this.manager.guild.client.user!.displayAvatarURL({ size: 128 }))
			.setTimestamp(this.createdTimestamp);
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
		if (this.duration) this.type |= Moderation.TypeMetadata.Temporary;
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

	public setType(value: Moderation.TypeCodes) {
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

		const taskName = this.duration === null ? null : this.appealTaskName;
		if (taskName !== null) {
			this.manager.guild.client.schedule.create(taskName, this.duration! + Date.now(), {
				catchUp: true,
				data: {
					[Moderation.SchemaKeys.User]: typeof this.user === 'string' ? this.user : this.user.id,
					[Moderation.SchemaKeys.Guild]: this.manager.guild.id,
					[Moderation.SchemaKeys.Duration]: this.duration,
					[Moderation.SchemaKeys.Case]: this.case
				}
			}).catch(error => this.manager.guild.client.emit(Events.Wtf, error));
		}

		return this;
	}

	public get appealTaskName() {
		if (this.appealable) return null;
		switch (this.typeVariation) {
			case Moderation.TypeCodes.UnWarn: return 'moderationEndWarning';
			case Moderation.TypeCodes.Mute: return 'moderationEndMute';
			case Moderation.TypeCodes.Ban: return 'moderationEndBan';
			case Moderation.TypeCodes.VoiceMute: return 'moderationEndVoiceMute';
			case Moderation.TypeCodes.RestrictionReaction: return 'moderationEndRestrictionReaction';
			case Moderation.TypeCodes.RestrictionEmbed: return 'moderationEndRestrictionEmbed';
			case Moderation.TypeCodes.RestrictionAttachment: return 'moderationEndRestrictionAttachment';
			case Moderation.TypeCodes.RestrictionVoice: return 'moderationEndRestrictionVoice';
			default: return null;
		}
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
