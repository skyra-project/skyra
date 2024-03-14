import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { PermissionsBits } from '#utils/bits.js';
import { toErrorCodeResult } from '#utils/common';
import { getCodeStyle, getLogPrefix } from '#utils/functions';
import { resolveTimeSpan } from '#utils/resolvers';
import { getTag } from '#utils/util.js';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum, ok } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, createLocalizedChoice, type TFunction } from '@sapphire/plugin-i18next';
import { Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import {
	ChannelType,
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
	Role,
	User,
	channelMention,
	chatInputApplicationCommandMention,
	type CommandInteractionOption,
	type ThreadChannelType
} from 'discord.js';

const Root = LanguageKeys.Commands.Lockdown;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lock', 'unlock'],
	description: LanguageKeys.Commands.Moderation.LockdownDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.LockdownExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, {
			command: chatInputApplicationCommandMention(this.name, this.getGlobalCommandId())
		});
		return send(message, { content });
	}

	public override chatInputRun(interaction: Interaction) {
		const durationRaw = interaction.options.getString('duration');
		const durationResult = this.#parseDuration(durationRaw);
		const t = getSupportedUserLanguageT(interaction);
		if (durationResult?.isErr()) {
			const content = t(durationResult.unwrapErr(), { parameter: durationRaw! });
			return interaction.reply({ content, flags: MessageFlags.Ephemeral });
		}

		const duration = durationResult.unwrap();
		const global = interaction.options.getBoolean('global') ?? false;
		const channel =
			interaction.options.getChannel<SupportedChannelType>('channel') ?? (global ? null : (interaction.channel as SupportedChannel));
		const role = interaction.options.getRole('role') ?? interaction.guild!.roles.everyone;
		const action = interaction.options.getString('action', true)! as 'lock' | 'unlock';
		return action === 'lock' //
			? this.#lock(t, interaction.user, channel, role, duration)
			: this.#unlock(t, interaction.user, channel, role);
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, Root.Name, Root.Description) //
				.addStringOption((option) =>
					applyLocalizedBuilder(option, Root.Action)
						.setRequired(true)
						.addChoices(
							createLocalizedChoice(Root.ActionLock, { value: 'lock' }),
							createLocalizedChoice(Root.ActionUnlock, { value: 'unlock' })
						)
				)
				.addRoleOption((option) => applyLocalizedBuilder(option, Root.Role))
				.addChannelOption((option) => applyLocalizedBuilder(option, Root.Channel))
				.addStringOption((option) => applyLocalizedBuilder(option, Root.Duration))
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles)
				.setDMPermission(false)
		);
	}

	#lock(t: TFunction, user: User, channel: SupportedChannel | null, role: Role, duration: number | null) {
		return isNullish(channel)
			? this.#lockGuild(t, user, role, duration)
			: UserCommand.ThreadChannelTypes.includes(channel.type)
				? this.#lockThread(t, user, channel as SupportedThreadChannel, duration)
				: this.#lockChannel(t, user, channel as SupportedNonThreadChannel, role, duration);
	}

	async #lockGuild(t: TFunction, user: User, role: Role, duration: number | null) {
		void t;
		void user;
		void role;
		void duration;

		if (!role.permissions.has(PermissionFlagsBits.SendMessages | PermissionFlagsBits.SendMessagesInThreads)) {
			return t(Root.GuildLocked, { role: role.toString() });
		}

		const reason = t(Root.AuditLogRequestedBy, { user: getTag(user), role: role.toString() });
		const result = await toErrorCodeResult(
			role.setPermissions(
				PermissionsBits.difference(role.permissions.bitfield, PermissionFlagsBits.SendMessages | PermissionFlagsBits.SendMessagesInThreads),
				reason
			)
		);
		return result.match({
			ok: () => this.#lockGuildOk(t, role),
			err: (code) => this.#lockGuildErr(t, role, code)
		});
	}

	#lockGuildOk(t: TFunction, role: Role) {
		return t(Root.SuccessGuild, { role: role.toString() });
	}

	#lockGuildErr(t: TFunction, role: Role, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownRole) return t(Root.GuildUnknownRole, { role: role.toString() });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not lock the guild ${role.id}`);
		return t(Root.GuildLockFailed, { role: role.toString() });
	}

	async #lockThread(t: TFunction, user: User, channel: SupportedThreadChannel, duration: number | null) {
		void duration;

		if (channel.locked) {
			return t(Root.ThreadLocked, { channel: channelMention(channel.id) });
		}

		if (!channel.manageable) {
			return t(Root.ThreadUnmanageable, { channel: channelMention(channel.id) });
		}

		const reason = t(Root.AuditLogRequestedBy, { user: getTag(user), channel: channelMention(channel.id) });
		const result = await toErrorCodeResult(channel.setLocked(true, reason));
		return result.match({
			ok: () => this.#lockThreadOk(t, channel),
			err: (code) => this.#lockThreadErr(t, channel, code)
		});
	}

	#lockThreadOk(t: TFunction, channel: SupportedThreadChannel) {
		return t(Root.SuccessThread, { channel: channelMention(channel.id) });
	}

	#lockThreadErr(t: TFunction, channel: SupportedThreadChannel, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownChannel) return t(Root.ThreadUnknownChannel, { channel: channelMention(channel.id) });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not lock the thread ${channel.id}`);
		return t(Root.ThreadLockFailed, { channel: channelMention(channel.id) });
	}

	async #lockChannel(t: TFunction, user: User, channel: SupportedNonThreadChannel, role: Role, duration: number | null) {
		void duration;

		if (!channel.permissionsFor(role).has(PermissionFlagsBits.SendMessages | PermissionFlagsBits.SendMessagesInThreads)) {
			return t(Root.ChannelLocked, { channel: channelMention(channel.id) });
		}

		if (!channel.manageable) {
			return t(Root.ChannelUnmanageable, { channel: channelMention(channel.id) });
		}

		const reason = t(Root.AuditLogRequestedBy, { user: getTag(user), channel: channelMention(channel.id) });
		const result = await toErrorCodeResult(
			channel.permissionOverwrites.edit(role, { SendMessages: false, SendMessagesInThreads: false }, { reason })
		);
		return result.match({
			ok: () => this.#lockChannelOk(t, channel),
			err: (code) => this.#lockChannelErr(t, channel, code)
		});
	}

	#lockChannelOk(t: TFunction, channel: SupportedNonThreadChannel) {
		return t(Root.SuccessChannel, { channel: channelMention(channel.id) });
	}

	#lockChannelErr(t: TFunction, channel: SupportedNonThreadChannel, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownChannel) return t(Root.ChannelUnknownChannel, { channel: channelMention(channel.id) });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not lock the channel ${channel.id}`);
		return t(Root.ChannelLockFailed, { channel: channelMention(channel.id) });
	}

	#unlock(t: TFunction, user: User, channel: SupportedChannel | null, role: Role) {
		void t;
		void user;
		void role;
		void channel;
	}

	// private async handleLock(
	// 	message: GuildMessage,
	// 	args: SkyraCommand.Args,
	// 	role: Role,
	// 	channel: NonThreadGuildTextBasedChannelTypes,
	// 	duration: number | null
	// ) {
	// 	// If there was a lockdown, abort lock
	// 	const lock = this.getLock(role, channel);
	// 	if (lock !== null) {
	// 		this.error(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });
	// 	}

	// 	const allowed = this.isAllowed(role, channel);

	// 	// If they can send, begin locking
	// 	const response = await send(message, args.t(LanguageKeys.Commands.Moderation.LockdownLocking, { channel: channel.toString() }));
	// 	await channel.permissionOverwrites.edit(role, { SendMessages: false });
	// 	if (canSendMessages(message.channel)) {
	// 		await response.edit(args.t(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channel.toString() })).catch(() => null);
	// 	}

	// 	// Create the timeout
	// 	const timeout = duration
	// 		? setAccurateTimeout(() => floatPromise(this.performUnlock(message, args.t, role, channel, allowed)), duration)
	// 		: null;
	// 	getSecurity(message.guild).lockdowns.add(role, channel, { allowed, timeout });
	// }

	// private isAllowed(role: Role, channel: NonThreadGuildTextBasedChannelTypes): boolean | null {
	// 	return channel.permissionOverwrites.cache.get(role.id)?.allow.has(PermissionFlagsBits.SendMessages, false) ?? null;
	// }

	// private async handleUnlock(message: GuildMessage, args: SkyraCommand.Args, role: Role, channel: NonThreadGuildTextBasedChannelTypes) {
	// 	const entry = this.getLock(role, channel);
	// 	if (entry === null) this.error(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channel.toString() });
	// 	if (entry.timeout) clearAccurateTimeout(entry.timeout);
	// 	return this.performUnlock(message, args.t, role, channel, entry.allowed);
	// }

	// private async performUnlock(
	// 	message: GuildMessage,
	// 	t: TFunction,
	// 	role: Role,
	// 	channel: NonThreadGuildTextBasedChannelTypes,
	// 	allowed: boolean | null
	// ) {
	// 	getSecurity(channel.guild).lockdowns.remove(role, channel);

	// 	const overwrites = channel.permissionOverwrites.cache.get(role.id);
	// 	if (overwrites === undefined) return;

	// 	// If the only permission overwrite is the denied SEND_MESSAGES, clean up the entire permission; if the permission
	// 	// was denied, reset it to the default state, otherwise don't run an extra query
	// 	if (overwrites.allow.bitfield === 0n && overwrites.deny.bitfield === PermissionFlagsBits.SendMessages) {
	// 		await overwrites.delete();
	// 	} else if (overwrites.deny.has(PermissionFlagsBits.SendMessages)) {
	// 		await overwrites.edit({ SendMessages: allowed });
	// 	}

	// 	if (canSendMessages(message.channel)) {
	// 		const content = t(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channel.toString() });
	// 		await send(message, content);
	// 	}
	// }

	// private getLock(role: Role, channel: NonThreadGuildTextBasedChannelTypes): LockdownManager.Entry | null {
	// 	const entry = getSecurity(channel.guild).lockdowns.get(channel.id)?.get(role.id);
	// 	if (entry) return entry;

	// 	const permissions = channel.permissionOverwrites.cache.get(role.id)?.deny.has(PermissionFlagsBits.SendMessages);
	// 	return permissions === true ? { allowed: null, timeout: null } : null;
	// }

	#parseDuration(value: string | null) {
		if (isNullish(value)) return ok(null);
		return resolveTimeSpan(value, { minimum: Time.Second * 30, maximum: Time.Year });
	}

	private static readonly ThreadChannelTypes: ChannelType[] = [
		ChannelType.AnnouncementThread,
		ChannelType.PublicThread,
		ChannelType.PrivateThread
	] satisfies readonly SupportedThreadChannelType[];
}

type Interaction = ChatInputCommandInteraction<'cached'>;

type SupportedChannelType = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;
type SupportedThreadChannelType = Extract<SupportedChannelType, ThreadChannelType>;
type SupportedChannel = Extract<NonNullable<CommandInteractionOption<'cached'>['channel']>, { type: SupportedChannelType }>;
type SupportedThreadChannel = Extract<SupportedChannel, { type: SupportedThreadChannelType }>;
type SupportedNonThreadChannel = Exclude<SupportedChannel, SupportedThreadChannel>;
