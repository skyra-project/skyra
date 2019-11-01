import { MessageEmbed, TextChannel, User } from 'discord.js';
import { Duration } from 'klasa';
import { Events } from '../types/Enums';
import { GuildSettings } from '../types/settings/GuildSettings';
import { Moderation, Time } from '../util/constants';
import { ModerationManager, ModerationManagerUpdateData, ModerationManagerInsertData } from './ModerationManager';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';
import { isNullOrUndefined } from '../util/util';
import { CLIENT_ID } from '../../../config';

const kTimeout = Symbol('ModerationManagerTimeout');
const regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;

export class ModerationManagerEntry {

	public manager: ModerationManager;
	public case!: number | null;
	public duration!: number | null;
	public extraData!: object | null;
	public moderator!: string | User | null;
	public reason!: string | null;
	public type!: Moderation.TypeCodes;
	public user!: string | User;
	public createdAt: number | null;
	private [kTimeout] = Date.now() + (Time.Minute * 15);

	public constructor(manager: ModerationManager, data: ModerationManagerInsertData) {
		this.manager = manager;

		this.setType(data.type)
			.setCase(data.case_id || null)
			.setDuration(data.duration || null)
			.setExtraData(data.extra_data || null)
			.setUser(data.user_id)
			.setModerator(data.moderator_id || null)
			.setReason(data.reason || null);
		this.createdAt = data.created_at || null;
	}

	/**
	 * The Client that manages this instance.
	 */
	public get client() {
		return this.manager.client;
	}

	/**
	 * Retrieve the metadata (title and color) for this entry.
	 */
	public get metadata() {
		const data = Moderation.metadata.get(this.type);
		if (typeof data === 'undefined') throw new Error(`Inexistent metadata for '0b${this.type.toString(2).padStart(8, '0')}'.`);
		return data;
	}

	/**
	 * Retrieve the title for this entry's embed.
	 */
	public get title() {
		return this.metadata.title;
	}

	/**
	 * Retrieve the color for this entry's embed.
	 */
	public get color() {
		return this.metadata.color;
	}

	/**
	 * Retrieve the creation date for this entry's embed. Returns current date if not set.
	 */
	public get createdTimestamp() {
		return this.createdAt || Date.now();
	}

	/**
	 * Get the variation type for this entry.
	 */
	public get typeVariation() {
		/**
		 * Variation is assigned to the first 4 bits of the entire type, therefore:
		 * 0b00001111 &
		 * 0bXXXX0100 =
		 * 0b00000100
		 */
		return (this.type & Moderation.TypeBits.Variation) as Moderation.TypeVariation;
	}

	/**
	 * Get the metadata type for this entry.
	 */
	public get typeMetadata() {
		/**
		 * Metadata is assigned to the last 4 bits of the entire type, therefore:
		 * 0b11110000 &
		 * 0b0010XXXX =
		 * 0b00100000
		 */
		return (this.type & Moderation.TypeBits.Metadata) as Moderation.TypeMetadata;
	}

	public get appealType() {
		return (this.typeMetadata & Moderation.TypeMetadata.Appeal) === Moderation.TypeMetadata.Appeal;
	}

	public get temporaryType() {
		return (this.typeMetadata & Moderation.TypeMetadata.Temporary) === Moderation.TypeMetadata.Temporary;
	}

	public get temporaryFastType() {
		return (this.typeMetadata & Moderation.TypeMetadata.Fast) === Moderation.TypeMetadata.Fast;
	}

	public get invalidated() {
		return (this.typeMetadata & Moderation.TypeMetadata.Invalidated) === Moderation.TypeMetadata.Invalidated;
	}

	public get appealable() {
		return Moderation.metadata.has(this.typeVariation | Moderation.TypeMetadata.Appeal);
	}

	public get temporable() {
		return Moderation.metadata.has(this.typeVariation | Moderation.TypeMetadata.Temporary);
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

	public get appealTaskName() {
		if (!this.appealable) return null;
		switch (this.typeVariation) {
			case Moderation.TypeVariation.Warning: return 'moderationEndWarning';
			case Moderation.TypeVariation.Mute: return 'moderationEndMute';
			case Moderation.TypeVariation.Ban: return 'moderationEndBan';
			case Moderation.TypeVariation.VoiceMute: return 'moderationEndVoiceMute';
			case Moderation.TypeVariation.RestrictedReaction: return 'moderationEndRestrictionReaction';
			case Moderation.TypeVariation.RestrictedEmbed: return 'moderationEndRestrictionEmbed';
			case Moderation.TypeVariation.RestrictedAttachment: return 'moderationEndRestrictionAttachment';
			case Moderation.TypeVariation.RestrictedVoice: return 'moderationEndRestrictionVoice';
			default: return null;
		}
	}

	public get shouldSend() {
		// If the moderation log is not anonymous, it should always send
		if (this.moderator) return true;

		const checkSoftban = this.typeVariation === Moderation.TypeVariation.Ban;
		const before = Date.now() - Time.Minute;
		const user = this.flattenedUser;
		for (const entry of this.manager.values()) {
			// If it's not the same user target or if it's at least 1 minute old, skip
			if (user !== entry.flattenedUser || before > entry.createdTimestamp) continue;

			// If there was a log with the same type in the last minute, do not duplicate
			if (this.typeVariation === entry.typeVariation) return false;

			// If this log is a ban or an unban, but the user was softbanned recently, abort
			if (checkSoftban && entry.type === Moderation.TypeCodes.Softban) return false;
		}

		// For all other cases, it should send
		return true;
	}

	public isType(type: Moderation.TypeCodes) {
		return this.type === type
			|| this.type === (type | Moderation.TypeMetadata.Temporary)
			|| this.type === (type | Moderation.TypeMetadata.Temporary | Moderation.TypeMetadata.Fast);
	}

	public async edit(data: ModerationManagerUpdateData = {}) {
		const flattened: ModerationManagerUpdateDataWithType = {
			duration: isNullOrUndefined(data.duration) || !this.temporable || data.duration > Time.Year
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

		flattened.type = ModerationManagerEntry.getTypeFlagsFromDuration(flattened.type, flattened.duration);
		await this.client.queries.updateModerationLog({ ...this.toJSON(), ...flattened });
		this.duration = flattened.duration;
		this.moderator = flattened.moderator_id;
		this.reason = flattened.reason;
		this.extraData = flattened.extra_data;
		this.type = flattened.type;

		return this;
	}

	public async invalidate() {
		if (this.invalidated) return this;
		const type = this.type | Moderation.TypeMetadata.Invalidated;
		await this.client.queries.updateModerationLog({ ...this.toJSON(), type });
		this.type = type;

		return this;
	}

	public async prepareEmbed() {
		if (!this.user) throw new Error('A user has not been set.');
		const userID = typeof this.user === 'string' ? this.user : this.user.id;
		const [userTag, moderator] = await Promise.all([
			this.client.fetchUsername(userID),
			typeof this.moderator === 'string' ? this.client.users.fetch(this.moderator) : Promise.resolve(this.moderator || this.client.user!)
		]);

		const prefix = this.manager.guild.settings.get(GuildSettings.Prefix);
		const formattedDuration = this.duration ? `\n❯ **Expires In**: ${this.client.languages.default.duration(this.duration)}` : '';
		const description = [
			`❯ **Type**: ${this.title}`,
			`❯ **User:** ${userTag} (${userID})`,
			`❯ **Reason:** ${this.reason || `Please use \`${prefix}reason ${this.case} to claim.\``}${formattedDuration}`
		].join('\n');

		return new MessageEmbed()
			.setColor(this.color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
			.setDescription(description)
			.setFooter(`Case ${this.case}`, this.client.user!.displayAvatarURL({ size: 128 }))
			.setTimestamp(this.createdTimestamp);
	}

	public setCase(value: number | null) {
		this.case = value;
		return this;
	}

	public setDuration(value: string | number | null) {
		// If this cannot be reversed, skip
		if (!this.temporable) return this;

		if (typeof value === 'string') value = new Duration(value.trim()).offset;
		if (typeof value === 'number' && (value <= 0 || value > Time.Year)) value = null;

		this.duration = value;
		this.type = ModerationManagerEntry.getTypeFlagsFromDuration(this.type, this.duration);
		return this;
	}

	public setExtraData(value: object | null) {
		this.extraData = value;
		return this;
	}

	public setModerator(value: User | string | null) {
		this.moderator = value;
		return this;
	}

	public setReason(value?: string | null) {
		if (!value) return this;
		value = value.trim();

		if (value && this.duration === null && this.temporable) {
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
			channel.send(messageEmbed).catch(error => this.client.emit(Events.ApiError, error));
		}

		const taskName = this.duration === null ? null : this.appealTaskName;
		if (taskName !== null) {
			this.client.schedule.create(taskName, this.duration! + Date.now(), {
				catchUp: true,
				data: {
					[Moderation.SchemaKeys.User]: typeof this.user === 'string' ? this.user : this.user.id,
					[Moderation.SchemaKeys.Guild]: this.manager.guild.id,
					[Moderation.SchemaKeys.Duration]: this.duration,
					[Moderation.SchemaKeys.Case]: this.case
				}
			}).catch(error => this.client.emit(Events.Wtf, error));
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

	private static getTypeFlagsFromDuration(type: Moderation.TypeCodes, duration: number | null) {
		if (duration === null) return type & ~(Moderation.TypeMetadata.Temporary | Moderation.TypeMetadata.Fast);
		if (duration < Time.Minute) return type | Moderation.TypeMetadata.Temporary | Moderation.TypeMetadata.Fast;
		return type | Moderation.TypeMetadata.Temporary;
	}

}

type ModerationManagerUpdateDataWithType = Pick<RawModerationSettings, 'duration' | 'extra_data' | 'moderator_id' | 'reason' | 'type'>;
