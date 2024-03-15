import type { ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, type RoleModerationActionKey } from '#lib/moderation';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { seconds, years } from '#utils/common';
import { getModeration } from '#utils/functions';
import { SchemaKeys, TypeVariation } from '#utils/moderationConstants';
import { getTag } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Guild, PermissionFlagsBits, type User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Moderation.TimeDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.TimeExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const cancel = await args.pick(UserCommand.cancel).catch(() => false);
		const caseId = await args.pick('case');

		const moderation = getModeration(message.guild);
		const entry = await moderation.fetch(caseId);
		if (!entry) this.error(LanguageKeys.Commands.Moderation.ModerationCaseNotExists, { count: 1 });
		if (!cancel && entry.temporaryType) this.error(LanguageKeys.Commands.Moderation.TimeTimed);

		const user = await entry.fetchUser();
		await this.validateAction(message, entry, user);
		const task = this.container.schedule.queue.find(
			(tk) => tk.data && tk.data[SchemaKeys.Case] === entry.caseId && tk.data[SchemaKeys.Guild] === entry.guild.id
		)!;

		if (cancel) {
			if (!task) this.error(LanguageKeys.Commands.Moderation.TimeNotScheduled);

			await moderation.fetchChannelMessages();
			await entry.edit({
				duration: null,
				moderatorId: message.author.id
			});

			this.error(LanguageKeys.Commands.Moderation.TimeAborted, { title: entry.title });
		}

		if (entry.appealType || entry.invalidated) {
			this.error(LanguageKeys.Commands.Moderation.ModerationLogAppealed);
		}

		if (task) {
			this.error(LanguageKeys.Commands.Moderation.ModerationTimed, {
				remaining: (task.data.timestamp as number) - Date.now()
			});
		}

		const duration = await args.rest('timespan', { minimum: seconds(1), maximum: years(5) });
		await moderation.fetchChannelMessages();
		await entry.edit({
			duration,
			moderatorId: message.author.id
		});

		const content = args.t(LanguageKeys.Commands.Moderation.TimeScheduled, {
			title: entry.title,
			userId: user.id,
			userTag: getTag(user),
			time: duration!
		});
		return send(message, content);
	}

	private async validateAction(message: GuildMessage, entry: ModerationEntity, user: User) {
		switch (entry.type) {
			case TypeVariation.Ban:
				return this.checkBan(message.guild, user);
			case TypeVariation.Mute:
				return this.checkRoleRestriction(message.guild, user, 'mute');
			case TypeVariation.VoiceMute:
				return this.checkVMute(message.guild, user);
			case TypeVariation.RestrictedAttachment:
				return this.checkRoleRestriction(message.guild, user, 'restrictedAttachment');
			case TypeVariation.RestrictedEmbed:
				return this.checkRoleRestriction(message.guild, user, 'restrictedEmbed');
			case TypeVariation.RestrictedEmoji:
				return this.checkRoleRestriction(message.guild, user, 'restrictedEmoji');
			case TypeVariation.RestrictedReaction:
				return this.checkRoleRestriction(message.guild, user, 'restrictedReaction');
			case TypeVariation.RestrictedVoice:
				return this.checkRoleRestriction(message.guild, user, 'restrictedVoice');
			case TypeVariation.Warning:
				return;
			default:
				this.error(LanguageKeys.Commands.Moderation.TimeUnsupportedType);
		}
	}

	private async checkBan(guild: Guild, user: User) {
		if (!guild.members.me!.permissions.has(PermissionFlagsBits.BanMembers)) {
			this.error(LanguageKeys.Commands.Moderation.UnbanMissingPermission);
		}

		if (!(await ModerationActions.ban.isActive(guild, user.id))) {
			this.error(LanguageKeys.Commands.Moderation.GuildBansNotFound);
		}
	}

	private async checkRoleRestriction(guild: Guild, user: User, key: RoleModerationActionKey) {
		if (!guild.members.me!.permissions.has(PermissionFlagsBits.ManageRoles)) {
			this.error(LanguageKeys.Commands.Moderation.UnmuteMissingPermission);
		}

		if (!(await ModerationActions[key].isActive(guild, user.id))) {
			this.error(LanguageKeys.Commands.Moderation.MuteUserNotMuted);
		}
	}

	private async checkVMute(guild: Guild, user: User) {
		if (!guild.members.me!.permissions.has(PermissionFlagsBits.MuteMembers)) {
			this.error(LanguageKeys.Commands.Moderation.VmuteMissingPermission);
		}

		if (!(await ModerationActions.voiceMute.isActive(guild, user.id))) {
			this.error(LanguageKeys.Commands.Moderation.VmuteUserNotMuted);
		}
	}

	private static cancel = Args.make<boolean>((parameter, { argument }) => {
		if (parameter.toLowerCase() === 'cancel') return Args.ok(true);
		return Args.error({ argument, parameter });
	});
}
