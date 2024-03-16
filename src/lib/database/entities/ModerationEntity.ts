import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import { kBigIntTransformer } from '#lib/database/utils/Transformers';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { ModerationManager, ModerationManagerUpdateData } from '#lib/moderation';
import { Events } from '#lib/types';
import { minutes, years } from '#utils/common';
import {
	TypeMetadata,
	TypeVariation,
	TypeVariationAppealNames,
	combineTypeData,
	getMetadata,
	hasMetadata,
	type ModerationTypeAssets
} from '#utils/moderationConstants';
import { getDisplayAvatar, getFullEmbedAuthor, getTag } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { UserError, container } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { Duration, Time } from '@sapphire/time-utilities';
import { isNullishOrZero, isNumber, tryParseURL, type NonNullObject } from '@sapphire/utilities';
import { User } from 'discord.js';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('moderation', { schema: 'public' })
export class ModerationEntity extends BaseEntity {
	@PrimaryColumn('integer')
	public caseId = -1;

	@Column('timestamp without time zone', { nullable: true, default: () => 'null' })
	public createdAt: Date | null = null;

	@Column('bigint', { nullable: true, default: () => 'null', transformer: kBigIntTransformer })
	public duration: number | null = null;

	@Column('json', { nullable: true, default: () => 'null' })
	public extraData: unknown[] | NonNullObject | null = null;

	@PrimaryColumn('varchar', { length: 19 })
	public guildId: string = null!;

	@Column('varchar', { length: 19, default: process.env.CLIENT_ID })
	public moderatorId: string = process.env.CLIENT_ID;

	@Column('varchar', { nullable: true, length: 2000, default: () => 'null' })
	public reason: string | null = null;

	@Column('varchar', { nullable: true, length: 2000, default: () => 'null' })
	public imageURL: string | null = null;

	@Column('varchar', { nullable: true, length: 19, default: () => 'null' })
	public userId: string | null = null;

	@Column('smallint')
	public type!: TypeVariation;

	@Column('smallint')
	public metadata!: TypeMetadata;

	#manager: ModerationManager = null!;
	#moderator: User | null = null;
	#user: User | null = null;
	#timeout = Date.now() + minutes(15);

	public constructor(data?: Partial<ModerationEntity>) {
		super();

		if (data) {
			Object.assign(this, data);
			this.metadata = ModerationEntity.getTypeFlagsFromDuration(this.metadata, this.duration);
		}
	}

	public setup(manager: ModerationManager) {
		this.#manager = manager;
		this.guildId = manager.guild.id;
		return this;
	}

	public clone() {
		return new ModerationEntity(this).setup(this.#manager);
	}

	public equals(other: ModerationEntity) {
		return (
			this.type === other.type &&
			this.metadata === other.metadata &&
			this.duration === other.duration &&
			this.extraData === other.extraData &&
			this.reason === other.reason &&
			this.imageURL === other.imageURL &&
			this.userId === other.userId &&
			this.moderatorId === other.moderatorId
		);
	}

	public get guild() {
		return this.#manager.guild;
	}

	public fetchChannel() {
		return this.#manager.fetchChannel();
	}

	/**
	 * Retrieve the metadata (title and color) for this entry.
	 */
	public get meta(): ModerationTypeAssets {
		const data = getMetadata(this.type, this.metadata);
		if (typeof data === 'undefined') {
			throw new Error(`Inexistent metadata for '0b${combineTypeData(this.type, this.metadata).toString(2).padStart(8, '0')}'.`);
		}
		return data;
	}

	/**
	 * Retrieve the title for this entry's embed.
	 */
	public get title(): string {
		return this.meta.title;
	}

	/**
	 * Retrieve the color for this entry's embed.
	 */
	public get color(): number {
		return this.meta.color;
	}

	/**
	 * Retrieve the creation date for this entry's embed. Returns current date if not set.
	 */
	public get createdTimestamp(): number {
		return this.createdAt?.getTime() ?? Date.now();
	}

	public get appealType() {
		return (this.metadata & TypeMetadata.Undo) === TypeMetadata.Undo;
	}

	public get temporaryType() {
		return (this.metadata & TypeMetadata.Temporary) === TypeMetadata.Temporary;
	}

	public get temporaryFastType() {
		return (this.metadata & TypeMetadata.Fast) === TypeMetadata.Fast;
	}

	public get archived() {
		return (this.metadata & TypeMetadata.Archived) === TypeMetadata.Archived;
	}

	public get appealable() {
		return !this.appealType && hasMetadata(this.type, TypeMetadata.Undo);
	}

	public get temporable() {
		return hasMetadata(this.type, TypeMetadata.Temporary);
	}

	public get cacheExpired() {
		return Date.now() > this.#timeout;
	}

	public get cacheRemaining() {
		return Math.max(Date.now() - this.#timeout, 0);
	}

	public get appealTaskName() {
		if (!this.appealable) return null;
		switch (this.type) {
			case TypeVariation.Warning:
				return TypeVariationAppealNames.Warning;
			case TypeVariation.Mute:
				return TypeVariationAppealNames.Mute;
			case TypeVariation.Ban:
				return TypeVariationAppealNames.Ban;
			case TypeVariation.VoiceMute:
				return TypeVariationAppealNames.VoiceMute;
			case TypeVariation.RestrictedAttachment:
				return TypeVariationAppealNames.RestrictedAttachment;
			case TypeVariation.RestrictedReaction:
				return TypeVariationAppealNames.RestrictedReaction;
			case TypeVariation.RestrictedEmbed:
				return TypeVariationAppealNames.RestrictedEmbed;
			case TypeVariation.RestrictedEmoji:
				return TypeVariationAppealNames.RestrictedEmoji;
			case TypeVariation.RestrictedVoice:
				return TypeVariationAppealNames.RestrictedVoice;
			case TypeVariation.SetNickname:
				return TypeVariationAppealNames.SetNickname;
			case TypeVariation.AddRole:
				return TypeVariationAppealNames.AddRole;
			case TypeVariation.RemoveRole:
				return TypeVariationAppealNames.RemoveRole;
			default:
				return null;
		}
	}

	public get shouldSend() {
		// If the moderation log is not anonymous, it should always send
		if (this.moderatorId !== process.env.CLIENT_ID) return true;

		const before = Date.now() - Time.Minute;
		const { type } = this;
		const checkSoftBan = type === TypeVariation.Ban;
		for (const entry of this.#manager.values()) {
			// If it's not the same user target or if it's at least 1 minute old, skip
			if (this.userId !== entry.userId || before > entry.createdTimestamp) continue;

			// If there was a log with the same type in the last minute, do not duplicate
			if (type === entry.type) return false;

			// If this log is a ban or an unban, but the user was softbanned recently, abort
			if (checkSoftBan && entry.type === TypeVariation.Softban) return false;
		}

		// For all other cases, it should send
		return true;
	}

	public get task() {
		const { guild } = this.#manager;
		return (
			container.client.schedules.queue.find((value) => value.data && value.data.caseID === this.caseId && value.data.guildID === guild.id) ??
			null
		);
	}

	public async fetchUser() {
		if (!this.userId) {
			throw new Error('userId must be set before calling this method.');
		}

		const previous = this.#user;
		if (previous?.id === this.userId) return previous;

		const user = await container.client.users.fetch(this.userId);
		this.#user = user;
		return user;
	}

	public async fetchModerator() {
		const previous = this.#moderator;
		if (previous) return previous;

		const moderator = await container.client.users.fetch(this.moderatorId);
		this.#moderator = moderator;
		return moderator;
	}

	public async edit(data: ModerationManagerUpdateData = {}) {
		const dataWithType = { ...data, metadata: ModerationEntity.getTypeFlagsFromDuration(this.metadata, data.duration ?? this.duration) };
		const clone = this.clone();
		try {
			Object.assign(this, dataWithType);
			await this.save();
		} catch (error) {
			Object.assign(this, clone);
			throw error;
		}

		container.client.emit(Events.ModerationEntryEdit, clone, this);
		return this;
	}

	public async archive() {
		if (this.archived) return this;
		const clone = this.clone();
		try {
			this.metadata |= TypeMetadata.Archived;
			await this.save();
		} catch (error) {
			this.metadata = clone.metadata;
			throw error;
		}

		container.client.emit(Events.ModerationEntryEdit, clone, this);
		return this;
	}

	public async prepareEmbed(t?: TFunction) {
		if (!this.userId) throw new Error('A user has not been set.');
		const manager = this.#manager;

		const [user, moderator] = await Promise.all([this.fetchUser(), this.fetchModerator()]);
		const [prefix, guildT] = await readSettings(manager.guild, (settings) => [settings[GuildSettings.Prefix], settings.getLanguage()]);
		t ??= guildT;

		const formattedDuration = this.duration ? t(LanguageKeys.Commands.Moderation.ModerationLogExpiresIn, { duration: this.duration }) : '';

		const body = t(LanguageKeys.Commands.Moderation.ModerationLogDescriptionTypeAndUser, {
			type: this.title,
			userId: user.id,
			userTag: getTag(user)
		});
		const reason = t(
			this.reason
				? LanguageKeys.Commands.Moderation.ModerationLogDescriptionWithReason
				: LanguageKeys.Commands.Moderation.ModerationLogDescriptionWithoutReason,
			{ reason: this.reason, prefix, caseId: this.caseId, formattedDuration }
		);

		const embed = new EmbedBuilder()
			.setColor(this.color)
			.setAuthor(getFullEmbedAuthor(moderator))
			.setDescription(`${body}\n${reason}`)
			.setFooter({
				text: t(LanguageKeys.Commands.Moderation.ModerationLogFooter, { caseId: this.caseId }),
				iconURL: getDisplayAvatar(container.client.user!, { size: 128 })
			})
			.setTimestamp(this.createdTimestamp);

		if (this.imageURL) embed.setImage(this.imageURL);
		return embed;
	}

	public setCase(value: number) {
		this.caseId = value;
		return this;
	}

	public setDuration(duration: string | number | null) {
		if (this.temporable) {
			if (typeof duration === 'string') duration = new Duration(duration.trim()).offset;
			if (typeof duration === 'number' && (duration <= 0 || duration > Time.Year)) duration = null;

			if (isNumber(duration)) {
				if (duration < 0 || duration > years(5)) {
					throw new UserError({
						identifier: LanguageKeys.Commands.Moderation.AutomaticParameterShowDurationPermanent,
						context: { duration }
					});
				}
				this.duration = isNullishOrZero(duration) ? null : duration;
			} else {
				this.duration = null;
			}
		} else {
			this.duration = null;
		}

		this.metadata = ModerationEntity.getTypeFlagsFromDuration(this.metadata, this.duration);
		return this;
	}

	public setExtraData(value: Record<string, unknown> | null) {
		this.extraData = value;
		return this;
	}

	public setModerator(value: User | string) {
		if (value instanceof User) {
			this.#moderator = value;
			this.moderatorId = value.id;
		} else if (this.moderatorId !== value) {
			this.#moderator = null;
			this.moderatorId = value;
		}
		return this;
	}

	public setReason(value?: string | null) {
		if (typeof value === 'string') {
			const trimmed = value.trim();
			value = trimmed.length === 0 ? null : trimmed;
		} else {
			value = null;
		}

		this.reason = value;
		return this;
	}

	public setImageURL(value?: string | null) {
		this.imageURL = (value && tryParseURL(value)?.href) ?? null;
		return this;
	}

	public setUser(value: User | string) {
		if (value instanceof User) {
			this.#user = value;
			this.userId = value.id;
		} else {
			this.userId = value;
		}

		return this;
	}

	public async create() {
		// If the entry was created, there is no point on re-sending
		if (!this.userId || this.createdAt) return null;
		this.createdAt = new Date();

		// If the entry should not send, abort creation
		if (!this.shouldSend) return null;

		await this.#manager.save(this);

		container.client.emit(Events.ModerationEntryAdd, this);
		return this;
	}

	private static getTypeFlagsFromDuration(metadata: TypeMetadata, duration: number | null) {
		if (duration === null) return metadata & ~(TypeMetadata.Temporary | TypeMetadata.Fast);
		if (duration < Time.Minute) return metadata | TypeMetadata.Temporary | TypeMetadata.Fast;
		return metadata | TypeMetadata.Temporary;
	}
}
