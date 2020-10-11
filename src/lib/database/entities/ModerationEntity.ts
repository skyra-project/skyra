/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import type { ModerationManager, ModerationManagerUpdateData } from '@lib/structures/managers/ModerationManager';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import type { AnyObject } from '@lib/types/util';
import { CLIENT_ID } from '@root/config';
import { isNumber, parseURL } from '@sapphire/utilities';
import { Moderation, Time } from '@utils/constants';
import { Client, MessageEmbed, User } from 'discord.js';
import { Duration } from 'klasa';
import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('moderation', { schema: 'public' })
@Check(/* sql */ `("duration" >= 0) AND ("duration" <= 31536000000)`)
@Check(/* sql */ `"reason"::text <> ''::text`)
@Check(/* sql */ `"type" >= 0`)
export class ModerationEntity extends BaseEntity {
	#client: Client = null!;
	#manager: ModerationManager = null!;
	#moderator: User | null = null;
	#user: User | null = null;
	#timeout = Date.now() + Time.Minute * 15;

	@PrimaryColumn('integer')
	public caseID = -1;

	@Column('timestamp without time zone', { nullable: true, default: () => 'null' })
	public createdAt: Date | null = null;

	@Column('integer', { nullable: true, default: () => 'null' })
	public duration: number | null = null;

	@Column('json', { nullable: true, default: () => 'null' })
	public extraData: unknown[] | AnyObject | null = null;

	@PrimaryColumn('varchar', { length: 19 })
	public guildID: string = null!;

	@Column('varchar', { length: 19, default: CLIENT_ID })
	public moderatorID: string = CLIENT_ID;

	@Column('varchar', { nullable: true, length: 2000, default: () => 'null' })
	public reason: string | null = null;

	@Column('varchar', { nullable: true, length: 2000, default: () => 'null' })
	public imageURL: string | null = null;

	@Column('varchar', { nullable: true, length: 19, default: () => 'null' })
	public userID: string | null = null;

	@Column('smallint')
	public type?: number | null;

	public constructor(data?: Partial<ModerationEntity>) {
		super();

		if (data) {
			Object.assign(this, data);
			this.type = ModerationEntity.getTypeFlagsFromDuration(this.type!, this.duration);
		}
	}

	public setup(manager: ModerationManager) {
		this.#client = manager.client;
		this.#manager = manager;
		this.guildID = manager.guild.id;
		return this;
	}

	public clone() {
		return new ModerationEntity(this).setup(this.#manager);
	}

	public equals(other: ModerationEntity) {
		return (
			this.type === other.type &&
			this.duration === other.duration &&
			this.extraData === other.extraData &&
			this.reason === other.reason &&
			this.imageURL === other.imageURL &&
			this.userID === other.userID &&
			this.moderatorID === other.moderatorID
		);
	}

	public get guild() {
		return this.#manager.guild;
	}

	public get channel() {
		return this.#manager.channel;
	}

	/**
	 * Retrieve the metadata (title and color) for this entry.
	 */
	public get metadata(): Moderation.ModerationTypeAssets {
		const data = Moderation.metadata.get(this.type! & ~Moderation.TypeMetadata.Invalidated);
		if (typeof data === 'undefined') throw new Error(`Inexistent metadata for '0b${this.type!.toString(2).padStart(8, '0')}'.`);
		return data;
	}

	/**
	 * Retrieve the title for this entry's embed.
	 */
	public get title(): string {
		return this.metadata.title;
	}

	/**
	 * Retrieve the color for this entry's embed.
	 */
	public get color(): number {
		return this.metadata.color;
	}

	/**
	 * Retrieve the creation date for this entry's embed. Returns current date if not set.
	 */
	public get createdTimestamp(): number {
		return this.createdAt?.getTime() ?? Date.now();
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
		return (this.type! & Moderation.TypeBits.Variation) as Moderation.TypeVariation;
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
		return (this.type! & Moderation.TypeBits.Metadata) as Moderation.TypeMetadata;
	}

	public get appealType() {
		return (this.type! & Moderation.TypeMetadata.Appeal) === Moderation.TypeMetadata.Appeal;
	}

	public get temporaryType() {
		return (this.type! & Moderation.TypeMetadata.Temporary) === Moderation.TypeMetadata.Temporary;
	}

	public get temporaryFastType() {
		return (this.type! & Moderation.TypeMetadata.Fast) === Moderation.TypeMetadata.Fast;
	}

	public get invalidated() {
		return (this.type! & Moderation.TypeMetadata.Invalidated) === Moderation.TypeMetadata.Invalidated;
	}

	public get appealable() {
		return !this.appealType && Moderation.metadata.has(this.typeVariation | Moderation.TypeMetadata.Appeal);
	}

	public get temporable() {
		return Moderation.metadata.has(this.type! | Moderation.TypeMetadata.Temporary);
	}

	public get cacheExpired() {
		return Date.now() > this.#timeout;
	}

	public get cacheRemaining() {
		return Math.max(Date.now() - this.#timeout, 0);
	}

	public get appealTaskName() {
		if (!this.appealable) return null;
		switch (this.typeVariation) {
			case Moderation.TypeVariation.Warning:
				return Moderation.TypeVariationAppealNames.Warning;
			case Moderation.TypeVariation.Mute:
				return Moderation.TypeVariationAppealNames.Mute;
			case Moderation.TypeVariation.Ban:
				return Moderation.TypeVariationAppealNames.Ban;
			case Moderation.TypeVariation.VoiceMute:
				return Moderation.TypeVariationAppealNames.VoiceMute;
			case Moderation.TypeVariation.RestrictedAttachment:
				return Moderation.TypeVariationAppealNames.RestrictedAttachment;
			case Moderation.TypeVariation.RestrictedReaction:
				return Moderation.TypeVariationAppealNames.RestrictedReaction;
			case Moderation.TypeVariation.RestrictedEmbed:
				return Moderation.TypeVariationAppealNames.RestrictedEmbed;
			case Moderation.TypeVariation.RestrictedEmoji:
				return Moderation.TypeVariationAppealNames.RestrictedEmoji;
			case Moderation.TypeVariation.RestrictedVoice:
				return Moderation.TypeVariationAppealNames.RestrictedVoice;
			case Moderation.TypeVariation.SetNickname:
				return Moderation.TypeVariationAppealNames.SetNickname;
			case Moderation.TypeVariation.AddRole:
				return Moderation.TypeVariationAppealNames.AddRole;
			case Moderation.TypeVariation.RemoveRole:
				return Moderation.TypeVariationAppealNames.RemoveRole;
			default:
				return null;
		}
	}

	public get shouldSend() {
		// If the moderation log is not anonymous, it should always send
		if (this.moderatorID !== CLIENT_ID) return true;

		const before = Date.now() - Time.Minute;
		const type = this.typeVariation;
		const checkSoftban = type === Moderation.TypeVariation.Ban;
		for (const entry of this.#manager.values()) {
			// If it's not the same user target or if it's at least 1 minute old, skip
			if (this.userID !== entry.userID || before > entry.createdTimestamp) continue;

			// If there was a log with the same type in the last minute, do not duplicate
			if (type === entry.typeVariation) return false;

			// If this log is a ban or an unban, but the user was softbanned recently, abort
			if (checkSoftban && entry.type === Moderation.TypeCodes.Softban) return false;
		}

		// For all other cases, it should send
		return true;
	}

	public get task() {
		const { guild } = this.#manager;
		return (
			this.#client.schedules.queue.find((value) => value.data && value.data.caseID === this.caseID && value.data.guildID === guild.id) ?? null
		);
	}

	public async fetchUser() {
		if (!this.userID) {
			throw new Error('userID must be set before calling this method.');
		}

		const previous = this.#user;
		if (previous?.id === this.userID) return previous;

		const user = await this.#client.users.fetch(this.userID);
		this.#user = user;
		return user;
	}

	public async fetchModerator() {
		const previous = this.#moderator;
		if (previous) return previous;

		const moderator = await this.#client.users.fetch(this.moderatorID);
		this.#moderator = moderator;
		return moderator;
	}

	public isType(type: Moderation.TypeCodes) {
		return (
			this.type === type ||
			this.type === (type | Moderation.TypeMetadata.Temporary) ||
			this.type === (type | Moderation.TypeMetadata.Temporary | Moderation.TypeMetadata.Fast)
		);
	}

	public async edit(data: ModerationManagerUpdateData = {}) {
		const dataWithType = { ...data, type: ModerationEntity.getTypeFlagsFromDuration(this.type!, data.duration ?? this.duration) };
		const clone = this.clone();
		try {
			Object.assign(this, dataWithType);
			await this.save();
		} catch (error) {
			Object.assign(this, clone);
			throw error;
		}

		this.#client.emit(Events.ModerationEntryEdit, clone, this);
		return this;
	}

	public async invalidate() {
		if (this.invalidated) return this;
		const clone = this.clone();
		try {
			this.type! |= Moderation.TypeMetadata.Invalidated;
			await this.save();
		} catch (error) {
			this.type = clone.type;
			throw error;
		}

		this.#client.emit(Events.ModerationEntryEdit, clone, this);
		return this;
	}

	public async prepareEmbed() {
		if (!this.userID) throw new Error('A user has not been set.');
		const manager = this.#manager;

		const [user, moderator] = await Promise.all([this.fetchUser(), this.fetchModerator()]);

		const prefix = manager.guild.settings.get(GuildSettings.Prefix);
		const formattedDuration = this.duration
			? manager.guild.language.get(LanguageKeys.Commands.Moderation.ModerationLogExpiresIn, { duration: this.duration })
			: '';
		const description = manager.guild.language.get(LanguageKeys.Commands.Moderation.ModerationLogDescription, {
			data: {
				type: this.title,
				userName: user.username,
				userDiscriminator: user.discriminator,
				userID: this.userID!,
				reason: this.reason!,
				prefix,
				caseID: this.caseID,
				formattedDuration
			}
		});

		const embed = new MessageEmbed()
			.setColor(this.color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(description)
			.setFooter(
				manager.guild.language.get(LanguageKeys.Commands.Moderation.ModerationLogFooter, { caseID: this.caseID }),
				this.#client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			)
			.setTimestamp(this.createdTimestamp);

		if (this.imageURL) embed.setImage(this.imageURL);
		return embed;
	}

	public setCase(value: number) {
		this.caseID = value;
		return this;
	}

	public setDuration(value: string | number | null) {
		if (this.temporable) {
			if (typeof value === 'string') value = new Duration(value.trim()).offset;
			if (typeof value === 'number' && (value <= 0 || value > Time.Year)) value = null;

			this.duration = isNumber(value) ? value : null;
		} else {
			this.duration = null;
		}

		this.type = ModerationEntity.getTypeFlagsFromDuration(this.type!, this.duration);
		return this;
	}

	public setExtraData(value: Record<string, unknown> | null) {
		this.extraData = value;
		return this;
	}

	public setModerator(value: User | string) {
		if (value instanceof User) {
			this.#moderator = value;
			this.moderatorID = value.id;
		} else if (this.moderatorID !== value) {
			this.#moderator = null;
			this.moderatorID = value;
		}
		return this;
	}

	public setReason(value?: string | null) {
		if (value) {
			const trimmed = value.trim();
			value = trimmed.length === 0 ? null : trimmed;
		} else {
			value = null;
		}

		this.reason = value;
		return this;
	}

	public setImageURL(value?: string | null) {
		this.imageURL = (value && parseURL(value)?.href) ?? null;
		return this;
	}

	public setType(value: Moderation.TypeCodes) {
		this.type = value;
		return this;
	}

	public setUser(value: User | string) {
		if (value instanceof User) {
			this.#user = value;
			this.userID = value.id;
		} else {
			this.userID = value;
		}

		return this;
	}

	public async create() {
		// If the entry was created, there is no point on re-sending
		if (!this.userID || this.createdAt) return null;
		this.createdAt = new Date();

		// If the entry should not send, abort creation
		if (!this.shouldSend) return null;

		this.caseID = (await this.#manager.count()) + 1;
		await this.save();
		this.#manager.insert(this);

		this.#client.emit(Events.ModerationEntryAdd, this);
		return this;
	}

	private static getTypeFlagsFromDuration(type: Moderation.TypeCodes, duration: number | null) {
		if (duration === null) return type & ~(Moderation.TypeMetadata.Temporary | Moderation.TypeMetadata.Fast);
		if (duration < Time.Minute) return type | Moderation.TypeMetadata.Temporary | Moderation.TypeMetadata.Fast;
		return type | Moderation.TypeMetadata.Temporary;
	}
}
