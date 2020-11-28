import { ModerationEntity } from '#lib/database/index';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Moderation } from '#utils/constants';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Permissions, User } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.TimeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.TimeExtended),
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text'],
	usage: '[cancel] <case:integer> (timer:timer)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'timer',
		async (arg, possible, message, [cancel]) => {
			if (cancel === 'cancel') return null;
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Moderation.TimeUndefinedTime);

			const restString = (await message.client.arguments.get('...string')!.run(arg, possible, message)) as string;
			return message.client.arguments.get('timespan')!.run(restString, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [cancel, caseID, duration]: ['cancel', number | 'latest', number | null]) {
		if (caseID === 'latest') caseID = await message.guild.moderation.count();

		const language = await message.fetchLanguage();
		const entry = await message.guild.moderation.fetch(caseID);
		if (!entry) throw language.get(LanguageKeys.Commands.Moderation.ModerationCaseNotExists, { count: 1 });
		if (!cancel && entry.temporaryType) throw language.get(LanguageKeys.Commands.Moderation.TimeTimed);

		const user = await entry.fetchUser();
		await this.validateAction(message, language, entry, user);
		const task = this.client.schedules.queue.find(
			(tk) => tk.data && tk.data[Moderation.SchemaKeys.Case] === entry.caseID && tk.data[Moderation.SchemaKeys.Guild] === entry.guild.id
		)!;

		if (cancel) {
			if (!task) throw language.get(LanguageKeys.Commands.Moderation.TimeNotScheduled);

			await message.guild.moderation.fetchChannelMessages();
			await entry.edit({
				duration: null,
				moderatorID: message.author.id
			});

			return message.send(language.get(LanguageKeys.Commands.Moderation.TimeAborted, { title: entry.title }));
		}

		if (entry.appealType || entry.invalidated) {
			throw language.get(LanguageKeys.Commands.Moderation.ModerationLogAppealed);
		}

		if (task) {
			throw language.get(LanguageKeys.Commands.Moderation.ModerationTimed, {
				remaining: (task.data.timestamp as number) - Date.now()
			});
		}

		await message.guild.moderation.fetchChannelMessages();
		await entry.edit({
			duration,
			moderatorID: message.author.id
		});
		return message.send(language.get(LanguageKeys.Commands.Moderation.TimeScheduled, { title: entry.title, user, time: duration! }));
	}

	private async validateAction(message: GuildMessage, language: Language, modlog: ModerationEntity, user: User) {
		switch (modlog.type) {
			case Moderation.TypeCodes.FastTemporaryBan:
			case Moderation.TypeCodes.TemporaryBan:
			case Moderation.TypeCodes.Ban:
				return this.checkBan(message, language, user);
			case Moderation.TypeCodes.FastTemporaryMute:
			case Moderation.TypeCodes.TemporaryMute:
			case Moderation.TypeCodes.Mute:
				return this.checkMute(message, language, user);
			case Moderation.TypeCodes.FastTemporaryVoiceMute:
			case Moderation.TypeCodes.TemporaryVoiceMute:
			case Moderation.TypeCodes.VoiceMute:
				return this.checkVMute(message, language, user);
			case Moderation.TypeCodes.Warning:
			case Moderation.TypeCodes.FastTemporaryWarning:
			case Moderation.TypeCodes.TemporaryWarning:
			// TODO(kyranet): Add checks for restrictions
			case Moderation.TypeCodes.RestrictionAttachment:
			case Moderation.TypeCodes.FastTemporaryRestrictionAttachment:
			case Moderation.TypeCodes.TemporaryRestrictionAttachment:
			case Moderation.TypeCodes.RestrictionEmbed:
			case Moderation.TypeCodes.FastTemporaryRestrictionEmbed:
			case Moderation.TypeCodes.TemporaryRestrictionEmbed:
			case Moderation.TypeCodes.RestrictionEmoji:
			case Moderation.TypeCodes.FastTemporaryRestrictionEmoji:
			case Moderation.TypeCodes.TemporaryRestrictionEmoji:
			case Moderation.TypeCodes.RestrictionReaction:
			case Moderation.TypeCodes.FastTemporaryRestrictionReaction:
			case Moderation.TypeCodes.TemporaryRestrictionReaction:
			case Moderation.TypeCodes.RestrictionVoice:
			case Moderation.TypeCodes.FastTemporaryRestrictionVoice:
			case Moderation.TypeCodes.TemporaryRestrictionVoice:
				return;
			default:
				throw language.get(LanguageKeys.Commands.Moderation.TimeUnsupportedType);
		}
	}

	private async checkBan(message: GuildMessage, language: Language, user: User) {
		if (!message.guild.me!.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
			throw language.get(LanguageKeys.Commands.Moderation.UnbanMissingPermission);
		}

		if (!(await message.guild.security.actions.userIsBanned(user))) {
			throw language.get(LanguageKeys.Commands.Moderation.GuildBansNotFound);
		}
	}

	private async checkMute(message: GuildMessage, language: Language, user: User) {
		if (!message.guild.me!.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			throw language.get(LanguageKeys.Commands.Moderation.UnmuteMissingPermission);
		}

		if (!(await message.guild.security.actions.userIsMuted(user))) {
			throw language.get(LanguageKeys.Commands.Moderation.MuteUserNotMuted);
		}
	}

	private async checkVMute(message: GuildMessage, language: Language, user: User) {
		if (!message.guild.me!.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) {
			throw language.get(LanguageKeys.Commands.Moderation.VmuteMissingPermission);
		}

		if (!(await message.guild.security.actions.userIsVoiceMuted(user))) {
			throw language.get(LanguageKeys.Commands.Moderation.VmuteUserNotMuted);
		}
	}
}
