import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getTitle, getTranslationKey } from '#lib/moderation/common';
import type { ModerationManager } from '#lib/moderation/managers/ModerationManager';
import type { TypedT } from '#lib/types';
import { TypeMetadata, type TypeVariation } from '#lib/util/moderationConstants';
import { getCodeStyle, getLogPrefix, getModeration } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty, type Awaitable } from '@sapphire/utilities';
import { DiscordAPIError, HTTPError, RESTJSONErrorCodes, type Guild, type Snowflake, type User } from 'discord.js';

const Root = LanguageKeys.Commands.Moderation;

export abstract class ModerationAction<ContextType = never, Type extends TypeVariation = TypeVariation> {
	/**
	 * Represents the type of moderation action.
	 */
	public readonly type: Type;

	/**
	 * Whether or not the action allows undoing.
	 */
	public readonly isUndoActionAvailable: boolean;

	/**
	 * The prefix used for logging moderation actions.
	 */
	protected readonly logPrefix: string;

	/**
	 * The key of the moderation action.
	 */
	protected readonly actionKey: TypedT;

	public constructor(options: ModerationAction.ConstructorOptions<Type>) {
		this.type = options.type;
		this.actionKey = getTranslationKey(this.type);
		this.logPrefix = getLogPrefix(options.logPrefix);
		this.isUndoActionAvailable = options.isUndoActionAvailable;
	}

	/**
	 * Applies a moderation action to a user in the specified guild.
	 *
	 * @param guild - The guild to apply the moderation action at.
	 * @param options - The options for the moderation action.
	 * @param data - The options for sending the direct message.
	 * @returns A Promise that resolves to the created moderation entry.
	 */
	public async apply(guild: Guild, options: ModerationAction.PartialOptions<Type>, data: ModerationAction.Data<ContextType> = {}) {
		const moderation = getModeration(guild);
		const entry = moderation.create(await this.resolveOptions(guild, options, data));
		await this.handleApplyPre(guild, entry, data);
		await this.sendDirectMessage(guild, entry, data);
		await this.handleApplyPost(guild, entry, data);
		return moderation.insert(entry);
	}

	/**
	 * Undoes a moderation action to a user in the specified guild.
	 *
	 * @param guild - The guild to apply the moderation action at.
	 * @param options - The options for the moderation action.
	 * @param data - The options for sending the direct message.
	 * @returns A promise that resolves to the created entry.
	 */
	public async undo(guild: Guild, options: ModerationAction.PartialOptions<Type>, data: ModerationAction.Data<ContextType> = {}) {
		const moderation = getModeration(guild);
		const entry = moderation.create(await this.resolveAppealOptions(guild, options, data));
		await this.handleUndoPre(guild, entry, data);
		await this.sendDirectMessage(guild, entry, data);
		await this.handleUndoPost(guild, entry, data);
		return moderation.insert(entry);
	}

	/**
	 * Handles the pre-apply of the moderation action. Executed before the moderation entry is created and the user has
	 * been notified.
	 *
	 * @param guild - The guild to apply the moderation action at.
	 * @param entry - The draft moderation action.
	 */
	protected handleApplyPre(guild: Guild, entry: ModerationManager.Entry<Type>, data: ModerationAction.Data<ContextType>): Awaitable<unknown>;
	protected handleApplyPre() {}

	/**
	 * Handles the post-apply of the moderation action. Executed after the moderation entry is created and the user has
	 * been notified.
	 *
	 * @param guild - The guild to apply the moderation action at.
	 * @param entry - The draft moderation action.
	 */
	protected handleApplyPost(guild: Guild, entry: ModerationManager.Entry<Type>, data: ModerationAction.Data<ContextType>): Awaitable<unknown>;
	protected handleApplyPost() {}

	/**
	 * Handles the pre-undo of the moderation action. Executed before the moderation entry is created and the user has
	 * been notified.
	 *
	 * @param guild - The guild to undo a moderation action at.
	 * @param entry - The draft moderation action.
	 */
	protected handleUndoPre(guild: Guild, entry: ModerationManager.Entry<Type>, data: ModerationAction.Data<ContextType>): Awaitable<unknown>;
	protected handleUndoPre() {}

	/**
	 * Handles the post-undo of the moderation action. Executed after the moderation entry is created and the user has
	 * been notified.
	 *
	 * @param guild - The guild to undo a moderation action at.
	 * @param entry - The draft moderation action.
	 */
	protected handleUndoPost(guild: Guild, entry: ModerationManager.Entry<Type>, data: ModerationAction.Data<ContextType>): Awaitable<unknown>;
	protected handleUndoPost() {}

	protected async resolveOptions(
		guild: Guild,
		options: ModerationAction.PartialOptions<Type>,
		data: ModerationAction.Data<ContextType>,
		metadata: TypeMetadata = 0
	) {
		return {
			...options,
			duration: options.duration || null,
			type: this.type,
			metadata,
			extraData: options.extraData || (await this.resolveOptionsExtraData(guild, options, data))
		} satisfies ModerationManager.CreateData<Type>;
	}

	/**
	 * Resolves the extra data for the moderation action.
	 *
	 * @param guild - The guild where the moderation action occurred.
	 * @param options - The original options for the moderation action.
	 * @param data - The options for sending the direct message.
	 */
	protected resolveOptionsExtraData(
		guild: Guild,
		options: ModerationAction.PartialOptions,
		data: ModerationAction.Data<ContextType>
	): Awaitable<ModerationManager.ExtraData<Type>>;

	protected resolveOptionsExtraData() {
		return null as ModerationManager.ExtraData<Type>;
	}

	/**
	 * Resolves the options for an appeal.
	 *
	 * @param options - The original options for the moderation action.
	 */
	protected async resolveAppealOptions(guild: Guild, options: ModerationAction.PartialOptions<Type>, data: ModerationAction.Data<ContextType>) {
		return this.resolveOptions(guild, options, data, TypeMetadata.Undo);
	}

	/**
	 * Sends a direct message to the user associated with the moderation entry.
	 *
	 * @param guild - The guild where the moderation action occurred.
	 * @param entry - The moderation entry.
	 * @param data - The options for sending the message.
	 */
	protected async sendDirectMessage(guild: Guild, entry: ModerationManager.Entry, data: ModerationAction.Data<ContextType>) {
		if (!data.sendDirectMessage) return;

		try {
			const target = await entry.fetchUser();
			const embed = await this.#buildEmbed(guild, entry, data);
			await target.send({ embeds: [embed] });
		} catch (error) {
			this.#handleDirectMessageError(error as Error);
		}
	}

	/**
	 * Retrieves the reason for a moderation action.
	 *
	 * @param guild - The guild where the moderation action occurred.
	 * @param reason - The reason for the moderation action.
	 * @param undo - Whether the action is an undo action.
	 * @returns The reason for the moderation action.
	 */
	protected async getReason(guild: Guild, reason: string | null | undefined, undo = false) {
		const t = await fetchT(guild);
		const action = t(this.actionKey);
		return isNullishOrEmpty(reason)
			? t(undo ? Root.ActionRevokeNoReason : Root.ActionApplyNoReason, { action })
			: t(undo ? Root.ActionRevokeReason : Root.ActionApplyReason, { action, reason });
	}

	/**
	 * Cancels the last moderation entry task from a user.
	 *
	 * @param options - The options to fetch the moderation entry.
	 * @returns The canceled moderation entry, or `null` if no entry was found.
	 */
	protected async cancelLastModerationEntryTaskFromUser(
		options: ModerationAction.ModerationEntryFetchOptions<Type>
	): Promise<ModerationManager.Entry<Type> | null> {
		const entry = await this.retrieveLastModerationEntryFromUser(options);
		if (isNullish(entry)) return null;

		const { task } = entry;
		if (!isNullish(task) && !task.running) await task.delete();
		return entry;
	}

	/**
	 * Retrieves the last moderation entry from a user based on the provided options.
	 *
	 * @param options - The options for fetching the moderation entry.
	 * @returns The last moderation entry from the user, or `null` if no entry is found.
	 */
	protected async retrieveLastModerationEntryFromUser(
		options: ModerationAction.ModerationEntryFetchOptions<Type>
	): Promise<ModerationManager.Entry<Type> | null> {
		// Retrieve all the entries
		const entries = await getModeration(options.guild).fetch({ userId: options.userId });

		const type = options.type ?? this.type;
		const metadata = options.metadata ?? null;
		const extra = options.filter ?? (() => true);

		for (const entry of entries.values()) {
			// If the entry has been invalidated, skip it:
			if (entry.isArchived()) continue;
			// If the entry is not of the same type, skip it:
			if (entry.type !== type) continue;
			// If the entry is not of the same metadata, skip it:
			if (metadata !== null && entry.metadata !== metadata) continue;
			// If the extra check fails, skip it:
			if (!extra(entry as ModerationManager.Entry<Type>)) continue;

			return entry as ModerationManager.Entry<Type>;
		}

		return null;
	}

	async #buildEmbed(guild: Guild, entry: ModerationManager.Entry, data: ModerationAction.Data<ContextType>) {
		const descriptionKey = entry.reason
			? entry.duration
				? Root.ModerationDmDescriptionWithReasonWithDuration
				: Root.ModerationDmDescriptionWithReason
			: entry.duration
				? Root.ModerationDmDescriptionWithDuration
				: Root.ModerationDmDescription;

		const t = await fetchT(guild);
		const description = t(descriptionKey, {
			guild: guild.name,
			title: getTitle(t, entry),
			reason: entry.reason,
			duration: entry.duration
		});
		const embed = new EmbedBuilder() //
			.setDescription(description)
			.setFooter({ text: t(Root.ModerationDmFooter) });

		if (data.moderator) embed.setAuthor(getFullEmbedAuthor(data.moderator));
		return embed;
	}

	#handleDirectMessageError(error: Error) {
		if (error instanceof DiscordAPIError) return this.#handleDirectMessageDiscordError(error);
		if (error instanceof HTTPError) return this.#handleDirectMessageHTTPError(error);
		throw error;
	}

	#handleDirectMessageDiscordError(error: DiscordAPIError) {
		if (error.code === RESTJSONErrorCodes.CannotSendMessagesToThisUser) return;

		container.logger.error(this.logPrefix, getCodeStyle(error.code), error.url);
		throw error;
	}

	#handleDirectMessageHTTPError(error: HTTPError) {
		container.logger.error(this.logPrefix, getCodeStyle(error.status), error.url);
		throw error;
	}
}

export namespace ModerationAction {
	export interface ConstructorOptions<Type extends TypeVariation = TypeVariation> {
		type: Type;
		logPrefix: string;
		isUndoActionAvailable: boolean;
	}

	export type Options<Type extends TypeVariation = TypeVariation> = ModerationManager.CreateData<Type>;
	export type PartialOptions<Type extends TypeVariation = TypeVariation> = Omit<Options<Type>, 'type' | 'metadata'>;

	export type Entry<Type extends TypeVariation = TypeVariation> = ModerationManager.Entry<Type>;

	export interface Data<ContextType = never> {
		context?: ContextType;
		sendDirectMessage?: boolean;
		moderator?: User | null;
	}

	export interface ModerationEntryFetchOptions<Type extends TypeVariation = TypeVariation> {
		guild: Guild;
		userId: Snowflake;
		type?: Type;
		metadata?: TypeMetadata | null;
		filter?: (entry: ModerationManager.Entry<Type>) => boolean;
	}
}
