import { readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import type { GuildMessage } from '#lib/types';
import { PermissionsBits } from '#utils/bits';
import { resolveOnErrorCodes } from '#utils/common';
import { getCodeStyle, getStickyRoles, promptConfirmation } from '#utils/functions';
import type { TypeVariation } from '#utils/moderationConstants';
import { GuildLimits, isCategoryChannel, isTextBasedChannel, isThreadChannel, isVoiceBasedChannel } from '@sapphire/discord.js-utilities';
import { UserError, container, type Awaitable } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import {
	DiscordAPIError,
	Guild,
	GuildMember,
	HTTPError,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
	Role,
	inlineCode,
	type NonThreadGuildBasedChannel,
	type PermissionOverwriteOptions,
	type RoleData,
	type Snowflake
} from 'discord.js';

const Root = LanguageKeys.Commands.Moderation;

interface Overrides {
	bitfield: bigint;
	array: readonly (keyof typeof PermissionFlagsBits)[];
	options: PermissionOverwriteOptions;
}

export abstract class RoleModerationAction<ContextType = never, Type extends TypeVariation = TypeVariation> extends ModerationAction<
	ContextType,
	Type
> {
	/**
	 * Represents the key of a role used in a moderation action.
	 */
	public readonly roleKey: RoleModerationAction.RoleKey;

	/**
	 * Indicates whether the existing roles should be replaced.
	 */
	protected readonly replace: boolean;

	/**
	 * Represents the data of a role for setup purposes.
	 */
	protected readonly roleData: RoleData;

	/**
	 * The representation of the role overrides for text-based channels.
	 */
	protected readonly roleOverridesText: Overrides;
	/**
	 * The representation of the role overrides for voice-based channels.
	 */
	protected readonly roleOverridesVoice: Overrides;
	/**
	 * The representation of the role overrides for generic and mixed channels.
	 */
	protected readonly roleOverridesMerged: Overrides;

	public constructor(options: RoleModerationAction.ConstructorOptions<Type>) {
		super({ isUndoActionAvailable: true, ...options });
		this.replace = options.replace ?? false;

		this.roleKey = options.roleKey;
		this.roleData = options.roleData;

		this.roleOverridesText = this.#resolveOverrides(options.roleOverridesText ?? 0n);
		this.roleOverridesVoice = this.#resolveOverrides(options.roleOverridesVoice ?? 0n);
		this.roleOverridesMerged = this.#resolveOverrides(this.roleOverridesText.bitfield | this.roleOverridesVoice.bitfield);
	}

	public override async isActive(guild: Guild, userId: Snowflake) {
		const roleId = await readSettings(guild, this.roleKey);
		if (isNullish(roleId)) return false;

		const member = await resolveOnErrorCodes(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);
		return !isNullish(member) && member.roles.cache.has(roleId);
	}

	/**
	 * Sets up the role moderation action.
	 *
	 * @param message - The guild message that triggered the setup.
	 * @param guild - The guild where the setup is being performed.
	 * @returns A Promise that resolves once the setup is complete.
	 * @throws {UserError} If a mute role already exists or if there are too many roles in the guild.
	 */
	public async setup(message: GuildMessage) {
		const { guild } = message;
		const roleId = await readSettings(guild, this.roleKey);
		if (roleId && guild.roles.cache.has(roleId)) throw new UserError({ identifier: Root.ActionSetupMuteExists });
		if (guild.roles.cache.size >= GuildLimits.MaximumRoles) throw new UserError({ identifier: Root.ActionSetupTooManyRoles });

		const role = await guild.roles.create({
			...this.roleData,
			reason: `[Role Setup] Authorized by ${message.author.username} (${message.author.id}).`
		});
		const t = await writeSettings(guild, (settings) => {
			Reflect.set(settings, this.roleKey, role.id);
			return settings.getLanguage();
		});

		const manageableChannelCount = guild.channels.cache.reduce(
			(acc, channel) => (!isThreadChannel(channel) && channel.manageable ? acc + 1 : acc),
			0
		);
		const permissions = this.roleOverridesMerged.array.map((key) => inlineCode(t(`permissions:${key}`)));
		const content = t(Root.ActionSharedRoleSetupAsk, { role: role.name, channels: manageableChannelCount, permissions });
		if (await promptConfirmation(message, content)) {
			await this.updateChannelsOverrides(guild, role);
		}
	}

	/**
	 * Updates the channel overrides for a given guild and role.
	 *
	 * This method iterates through all the channels in the guild, excluding threads, and updates the channel overrides
	 * for the specified role if the bot has the necessary permissions.
	 *
	 * @param guild - The guild where the channels are located.
	 * @param role - The role for which the channel overrides should be updated.
	 */
	public async updateChannelsOverrides(guild: Guild, role: Role) {
		const channels = guild.channels.cache.values();
		for (const channel of channels) {
			// Skip threads:
			if (isThreadChannel(channel)) continue;

			// Skip if the bot can't manage the channel:
			if (!channel.manageable) continue;

			// Update the channel overrides:
			await this.updateChannelOverrides(channel, role);
		}
	}

	/**
	 * Updates the channel overrides for a given role.
	 *
	 * @param channel - The channel to update the overrides for.
	 * @param role - The role to update the overrides with.
	 * @returns A promise that resolves to `true` if the overrides were updated successfully, or `false` otherwise.
	 */
	public async updateChannelOverrides(channel: NonThreadGuildBasedChannel, role: Role) {
		const options = this.#getChannelOverrides(channel);
		if (options === null) return false;

		await channel.permissionOverwrites.edit(role, options);
		return true;
	}

	protected override handleApplyPre(
		guild: Guild,
		entry: ModerationAction.Entry<Type>,
		data: ModerationAction.Data<ContextType>
	): Awaitable<unknown>;

	protected override async handleApplyPre(guild: Guild, entry: ModerationAction.Entry<Type>) {
		const member = await this.#fetchMember(guild, entry);
		const role = await this.#fetchRole(guild);

		const me = await guild.members.fetchMe();
		if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
			throw new UserError({ identifier: Root.ActionCannotManageRoles });
		}

		const { position } = me.roles.highest;
		if (role.position >= position) {
			throw new UserError({ identifier: Root.ActionRoleHigherPosition });
		}

		await getStickyRoles(guild).add(entry.userId, role.id);

		const reason = await this.getReason(guild, entry.reason);
		const data = this.replace
			? await this.#handleApplyPreRolesReplace(member, role, reason, position)
			: await this.#handleApplyPreRolesAdd(member, role, reason);
		Reflect.set(entry, 'extraData' satisfies keyof typeof entry, data);
	}

	protected override handleUndoPre(guild: Guild, entry: ModerationAction.Entry<Type>, data: ModerationAction.Data<ContextType>): Awaitable<unknown>;

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry<Type>) {
		const member = await this.#fetchMember(guild, entry);
		const role = await this.#fetchRole(guild);

		const me = await guild.members.fetchMe();
		if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
			throw new UserError({ identifier: Root.ActionCannotManageRoles });
		}

		const { position } = me.roles.highest;
		if (role.position >= position) {
			throw new UserError({ identifier: Root.ActionRoleHigherPosition });
		}

		await getStickyRoles(guild).remove(entry.userId, role.id);

		const reason = await this.getReason(guild, entry.reason, true);
		if (this.replace) {
			await this.#handleUndoPreRolesReplace(member, role, reason, position);
		} else {
			await this.#handleUndoPreRolesRemove(member, role, reason);
		}
	}

	/**
	 * Handles the roles replace operation for a given member.
	 *
	 * This method extracts the roles from the member, adds the specified role, and updates the member's roles with the
	 * new set of roles.
	 *
	 * @param member - The guild member to apply the operation to.
	 * @param role - The role to add to the member.
	 * @param reason - The reason for applying the operation.
	 * @param position - The position of the role in the hierarchy.
	 * @returns An array of removed roles.
	 */
	async #handleApplyPreRolesReplace(member: GuildMember, role: Role, reason: string, position: number) {
		const { keepRoles, removedRoles } = this.#extractRoles(member, position);
		keepRoles.add(role.id);

		await member.edit({ roles: [...keepRoles], reason });
		return [...removedRoles];
	}

	/**
	 * Handles the apply action for adding the action role to a member.
	 *
	 * @param member - The guild member to apply the roles to.
	 * @param role - The role to add to the member.
	 * @param reason - The reason for adding the role.
	 * @returns A Promise that resolves to `null` when the role addition is complete.
	 */
	async #handleApplyPreRolesAdd(member: GuildMember, role: Role, reason: string) {
		await member.roles.add(role, reason);
		return null;
	}

	/**
	 * Handles the undo operation for replacing pre-existing roles for a member.
	 *
	 * - If there is no previous moderation entry for the member, the specified role will be removed.
	 * - If there is a previous moderation entry, the pre-existing roles that are not managed and have a position
	 * lower than the specified position will be restored for the member.
	 *
	 * @param member - The guild member to handle the undo operation for.
	 * @param role - The role to remove if there is no previous moderation entry.
	 * @param reason - The reason for the undo operation.
	 * @param position - The position of the role that triggered the moderation action.
	 */
	async #handleUndoPreRolesReplace(member: GuildMember, role: Role, reason: string, position: number) {
		const { guild } = member;
		const entry = await this.cancelLastModerationEntryTaskFromUser({ guild, userId: member.id });
		if (isNullish(entry)) {
			await member.roles.remove(role, reason);
			return;
		}

		const roles = new Set(member.roles.cache.keys());
		for (const roleId of Array.isArray(entry.extraData) ? entry.extraData : []) {
			const role = member.guild.roles.cache.get(roleId);
			// Add the ids that are:
			// - In the cache.
			// - Lower than Skyra's hierarchy position.
			if (!isNullish(role) && !role.managed && role.position < position) roles.add(roleId);
		}

		// Remove the action role from the set:
		roles.delete(role.id);

		await member.edit({ roles: [...roles], reason });
	}

	/**
	 * Handles the undo action for removing the action role from a member.
	 *
	 * @param member - The guild member to remove the role from.
	 * @param role - The role to be removed.
	 * @param reason - The reason for removing the role.
	 */
	async #handleUndoPreRolesRemove(member: GuildMember, role: Role, reason: string) {
		await member.roles.remove(role, reason);
	}

	/**
	 * Retrieves the channel overrides for the given channel.
	 * If the channel is a category channel, it returns the merged role overrides options.
	 * If the channel is both a text-based and voice-based channel, it returns the merged role overrides options.
	 * If the channel is a text-based channel, it returns the text-based role overrides options.
	 * If the channel is a voice-based channel, it returns the voice-based role overrides options.
	 * If the channel does not match any of the above conditions, it returns null.
	 *
	 * @param channel - The channel to retrieve the overrides for.
	 * @returns The channel overrides options or null if no overrides are found.
	 */
	#getChannelOverrides(channel: NonThreadGuildBasedChannel) {
		if (isCategoryChannel(channel)) return this.roleOverridesMerged.options;

		const isText = isTextBasedChannel(channel);
		const isVoice = isVoiceBasedChannel(channel);
		if (isText && isVoice) return this.roleOverridesMerged.options;
		if (isText) return this.roleOverridesText.options;
		if (isVoice) return this.roleOverridesVoice.options;
		return null;
	}

	/**
	 * Resolves the overrides for the given bitfield.
	 *
	 * @param bitfield - The bitfield to resolve overrides for.
	 * @returns The resolved overrides object.
	 */
	#resolveOverrides(bitfield: bigint): Overrides {
		const array = PermissionsBits.toArray(bitfield);
		const options = Object.fromEntries(array.map((key) => [key, false]));
		return { bitfield, array, options };
	}

	/**
	 * Fetches the member from the guild using the provided options.
	 *
	 * @remarks
	 * If the member is not found, a {@link UserError} with the identifier {@link Root.ActionRequiredMember} is thrown.
	 * Otherwise, the error is re-thrown.
	 *
	 * @param guild The guild to fetch the member from.
	 * @param entry The entry containing the user ID.
	 * @returns A Promise that resolves to the fetched member.
	 */
	async #fetchMember(guild: Guild, entry: ModerationAction.Entry<Type>) {
		try {
			return await guild.members.fetch(entry.userId);
		} catch (error) {
			this.#handleFetchMemberError(error as Error);
		}
	}

	#handleFetchMemberError(error: Error): never {
		if (error instanceof DiscordAPIError) this.#handleFetchMemberDiscordError(error);
		if (error instanceof HTTPError) this.#handleFetchMemberHttpError(error);
		throw error;
	}

	#handleFetchMemberDiscordError(error: DiscordAPIError): never {
		if (error.code === RESTJSONErrorCodes.UnknownMember) {
			throw new UserError({ identifier: Root.ActionRequiredMember });
		}

		throw error;
	}

	#handleFetchMemberHttpError(error: HTTPError): never {
		container.logger.error(this.logPrefix, getCodeStyle(error.status), error.url);
		throw error;
	}

	/**
	 * Fetches the role associated with this moderation action from the guild.
	 * Throws an error if the role is not configured, doesn't exist, or is a managed role.
	 *
	 * @param guild - The guild to fetch the role from.
	 * @returns The fetched role.
	 * @throws If the role is not configured or if it is a managed role.
	 */
	async #fetchRole(guild: Guild) {
		const roleId = await readSettings(guild, this.roleKey);
		if (isNullish(roleId)) throw new UserError({ identifier: Root.ActionRoleNotConfigured });

		const role = guild.roles.cache.get(roleId);
		if (isNullish(role)) {
			await writeSettings(guild, [[this.roleKey, null]]);
			throw new UserError({ identifier: Root.ActionRoleNotConfigured });
		}

		if (role.managed) {
			throw new UserError({ identifier: Root.ActionRoleManaged });
		}

		return role;
	}

	#extractRoles(member: GuildMember, highestPosition: number) {
		const keepRoles = new Set<Snowflake>();
		const removedRoles = new Set<Snowflake>();

		// Iterate over all the member's roles.
		for (const [id, role] of member.roles.cache.entries()) {
			// Managed roles cannot be removed.
			if (role.managed) keepRoles.add(id);
			// Roles with higher hierarchy position cannot be removed.
			else if (role.position >= highestPosition) keepRoles.add(id);
			// Else it is fine to remove the role.
			else removedRoles.add(id);
		}

		return { keepRoles, removedRoles };
	}
}

export namespace RoleModerationAction {
	export interface ConstructorOptions<Type extends TypeVariation = TypeVariation>
		extends Omit<ModerationAction.ConstructorOptions<Type>, 'isUndoActionAvailable'> {
		replace?: boolean;
		roleKey: RoleKey;
		roleData: RoleData;
		roleOverridesText: bigint | null;
		roleOverridesVoice: bigint | null;
	}

	export type Options<Type extends TypeVariation = TypeVariation> = ModerationAction.Options<Type>;
	export type PartialOptions<Type extends TypeVariation = TypeVariation> = ModerationAction.PartialOptions<Type>;

	export type Data = ModerationAction.Data;

	export const enum RoleKey {
		All = 'rolesMuted',
		Reaction = 'rolesRestrictedReaction',
		Embed = 'rolesRestrictedEmbed',
		Emoji = 'rolesRestrictedEmoji',
		Attachment = 'rolesRestrictedAttachment',
		Voice = 'rolesRestrictedVoice'
	}
}
