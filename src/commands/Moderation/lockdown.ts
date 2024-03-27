import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { PermissionsBits } from '#utils/bits.js';
import { months, toErrorCodeResult } from '#utils/common';
import { getCodeStyle, getLogPrefix } from '#utils/functions';
import { resolveTimeSpan } from '#utils/resolvers';
import { getTag } from '#utils/util.js';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum, ok } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, createLocalizedChoice, type TFunction } from '@sapphire/plugin-i18next';
import { Time } from '@sapphire/time-utilities';
import { isNullish, isNullishOrZero } from '@sapphire/utilities';
import {
	ChannelType,
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
	channelMention,
	chatInputApplicationCommandMention,
	type CommandInteractionOption,
	type Guild,
	type Role,
	type ThreadChannelType,
	type User
} from 'discord.js';

const Root = LanguageKeys.Commands.Lockdown;
const LockdownPermissions = PermissionFlagsBits.SendMessages | PermissionFlagsBits.SendMessagesInThreads;

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
			: channel.isThread()
				? this.#lockThread(t, user, channel, duration)
				: this.#lockChannel(t, user, channel, role, duration);
	}

	async #lockGuild(t: TFunction, user: User, role: Role, duration: number | null) {
		if (!role.permissions.has(LockdownPermissions)) {
			return t(Root.GuildLocked, { role: role.toString() });
		}

		const reason = t(Root.AuditLogLockRequestedBy, { user: getTag(user) });
		const result = await toErrorCodeResult(
			role.setPermissions(PermissionsBits.difference(role.permissions.bitfield, LockdownPermissions), reason)
		);
		return result.match({
			ok: () => this.#lockGuildOk(t, role, duration),
			err: (code) => this.#lockGuildErr(t, role, code)
		});
	}

	async #lockGuildOk(t: TFunction, role: Role, duration: number | null) {
		if (!isNullishOrZero(duration)) await this.#schedule(role.guild, role, null, duration);
		return t(Root.SuccessGuild, { role: role.toString() });
	}

	#lockGuildErr(t: TFunction, role: Role, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownRole) return t(Root.GuildUnknownRole, { role: role.toString() });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not lock the guild ${role.id}`);
		return t(Root.GuildLockFailed, { role: role.toString() });
	}

	async #lockThread(t: TFunction, user: User, channel: SupportedThreadChannel, duration: number | null) {
		if (channel.locked) {
			return t(Root.ThreadLocked, { channel: channelMention(channel.id) });
		}

		if (!channel.manageable) {
			return t(Root.ThreadUnmanageable, { channel: channelMention(channel.id) });
		}

		const reason = t(Root.AuditLogLockRequestedBy, { user: getTag(user) });
		const result = await toErrorCodeResult(channel.setLocked(true, reason));
		return result.match({
			ok: () => this.#lockThreadOk(t, channel, duration),
			err: (code) => this.#lockThreadErr(t, channel, code)
		});
	}

	async #lockThreadOk(t: TFunction, channel: SupportedThreadChannel, duration: number | null) {
		if (!isNullishOrZero(duration)) await this.#schedule(channel.guild, null, channel, duration);
		return t(Root.SuccessThread, { channel: channelMention(channel.id) });
	}

	#lockThreadErr(t: TFunction, channel: SupportedThreadChannel, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownChannel) return t(Root.ThreadUnknownChannel, { channel: channelMention(channel.id) });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not lock the thread ${channel.id}`);
		return t(Root.ThreadLockFailed, { channel: channelMention(channel.id) });
	}

	async #lockChannel(t: TFunction, user: User, channel: SupportedNonThreadChannel, role: Role, duration: number | null) {
		if (!channel.permissionsFor(role).has(LockdownPermissions)) {
			return t(Root.ChannelLocked, { channel: channelMention(channel.id) });
		}

		if (!channel.manageable) {
			return t(Root.ChannelUnmanageable, { channel: channelMention(channel.id) });
		}

		const reason = t(Root.AuditLogLockRequestedBy, { user: getTag(user) });
		const result = await toErrorCodeResult(
			channel.permissionOverwrites.edit(role, { SendMessages: false, SendMessagesInThreads: false }, { reason })
		);
		return result.match({
			ok: () => this.#lockChannelOk(t, channel, role, duration),
			err: (code) => this.#lockChannelErr(t, channel, code)
		});
	}

	async #lockChannelOk(t: TFunction, channel: SupportedNonThreadChannel, role: Role, duration: number | null) {
		if (!isNullishOrZero(duration)) await this.#schedule(channel.guild, role, channel, duration);
		return t(Root.SuccessChannel, { channel: channelMention(channel.id) });
	}

	#lockChannelErr(t: TFunction, channel: SupportedNonThreadChannel, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownChannel) return t(Root.ChannelUnknownChannel, { channel: channelMention(channel.id) });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not lock the channel ${channel.id}`);
		return t(Root.ChannelLockFailed, { channel: channelMention(channel.id) });
	}

	#unlock(t: TFunction, user: User, channel: SupportedChannel | null, role: Role) {
		return isNullish(channel)
			? this.#unlockGuild(t, user, role)
			: channel.isThread()
				? this.#unlockThread(t, user, channel)
				: this.#unlockChannel(t, user, channel, role);
	}

	async #unlockChannel(t: TFunction, user: User, channel: SupportedNonThreadChannel, role: Role) {
		if (!channel.permissionsFor(role).has(LockdownPermissions)) {
			return t(Root.ChannelLocked, { channel: channelMention(channel.id) });
		}

		if (!channel.manageable) {
			return t(Root.ChannelUnmanageable, { channel: channelMention(channel.id) });
		}

		const reason = t(Root.AuditLogUnlockRequestedBy, { user: getTag(user) });
		const result = await toErrorCodeResult(
			channel.permissionOverwrites.edit(role, { SendMessages: true, SendMessagesInThreads: true }, { reason })
		);
		return result.match({
			ok: () => this.#unlockChannelOk(t, channel),
			err: (code) => this.#unlockChannelErr(t, channel, code)
		});
	}

	#unlockChannelOk(t: TFunction, channel: SupportedNonThreadChannel) {
		return t(Root.SuccessChannel, { channel: channelMention(channel.id) });
	}

	#unlockChannelErr(t: TFunction, channel: SupportedNonThreadChannel, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownChannel) return t(Root.ChannelUnknownChannel, { channel: channelMention(channel.id) });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not unlock the channel ${channel.id}`);
		return t(Root.ChannelLockFailed, { channel: channelMention(channel.id) });
	}

	async #unlockThread(t: TFunction, user: User, channel: SupportedThreadChannel) {
		if (!channel.locked) {
			return t(Root.ThreadUnlocked, { channel: channelMention(channel.id) });
		}

		if (!channel.manageable) {
			return t(Root.ThreadUnmanageable, { channel: channelMention(channel.id) });
		}

		const reason = t(Root.AuditLogUnlockRequestedBy, { user: getTag(user) });
		const result = await toErrorCodeResult(channel.setLocked(false, reason));
		return result.match({
			ok: () => this.#unlockThreadOk(t, channel),
			err: (code) => this.#unlockThreadErr(t, channel, code)
		});
	}

	#unlockThreadOk(t: TFunction, channel: SupportedThreadChannel) {
		return t(Root.SuccessThread, { channel: channelMention(channel.id) });
	}

	#unlockThreadErr(t: TFunction, channel: SupportedThreadChannel, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownChannel) return t(Root.ThreadUnknownChannel, { channel: channelMention(channel.id) });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not unlock the thread ${channel.id}`);
		return t(Root.ThreadUnlockFailed, { channel: channelMention(channel.id) });
	}

	async #unlockGuild(t: TFunction, user: User, role: Role) {
		if (role.permissions.has(LockdownPermissions)) {
			return t(Root.GuildUnlocked, { role: role.toString() });
		}

		const reason = t(Root.AuditLogUnlockRequestedBy, { user: getTag(user) });
		const result = await toErrorCodeResult(role.setPermissions(PermissionsBits.union(role.permissions.bitfield, LockdownPermissions), reason));
		return result.match({
			ok: () => this.#unlockGuildOk(t, role),
			err: (error) => this.#unlockGuildErr(t, role, error)
		});
	}

	#unlockGuildOk(t: TFunction, role: Role) {
		return t(Root.SuccessGuild, { role: role.toString() });
	}

	#unlockGuildErr(t: TFunction, role: Role, code: RESTJSONErrorCodes) {
		if (code === RESTJSONErrorCodes.UnknownRole) return t(Root.GuildUnknownRole, { role: role.toString() });

		this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Could not unlock the guild ${role.id}`);
		return t(Root.GuildUnlockFailed, { role: role.toString() });
	}

	#schedule(guild: Guild, role: Role | null, channel: SupportedChannel | null, duration: number) {
		return this.container.schedule.add('moderationEndLockdown', duration, {
			catchUp: true,
			data: {
				guildId: guild.id,
				channelId: channel?.id ?? null,
				roleId: role?.id ?? null
			}
		});
	}

	#parseDuration(value: string | null) {
		if (isNullish(value)) return ok(null);
		return resolveTimeSpan(value, { minimum: Time.Second * 30, maximum: months(1) });
	}
}

type Interaction = ChatInputCommandInteraction<'cached'>;

type SupportedChannelType = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;
type SupportedThreadChannelType = Extract<SupportedChannelType, ThreadChannelType>;
type SupportedChannel = Extract<NonNullable<CommandInteractionOption<'cached'>['channel']>, { type: SupportedChannelType }>;
type SupportedThreadChannel = Extract<SupportedChannel, { type: SupportedThreadChannelType }>;
type SupportedNonThreadChannel = Exclude<SupportedChannel, SupportedThreadChannel>;
