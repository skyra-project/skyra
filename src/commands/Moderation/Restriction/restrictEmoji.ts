import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { ModerationSetupRestriction } from '@utils/Security/ModerationActions';
import { getImage } from '@utils/util';
import { Role } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['restrict-external-emoji', 'restricted-emoji', 'restricted-external-emoji', 'ree', 'restrict-emojis'],
	description: (language) => language.get('commandRestrictEmojiDescription'),
	extendedHelp: (language) => language.get('commandRestrictEmojiExtended'),
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private readonly kRolePrompt = this.definePrompt('<role:rolename>');

	public async inhibit(message: KlasaMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const id = message.guild.settings.get(GuildSettings.Roles.RestrictedEmoji);
		const role = (id && message.guild.roles.cache.get(id)) || null;
		if (!role) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator))) throw message.language.get('commandRestrictLowlevel');
			if (await message.ask(message.language.get('actionSharedRoleSetupExisting'))) {
				const [role] = (await this.kRolePrompt
					.createPrompt(message, { time: 30000, limit: 1 })
					.run(message.language.get('actionSharedRoleSetupExistingName'))) as [Role];
				await message.guild.settings.update(GuildSettings.Roles.RestrictedEmoji, role, {
					extraContext: { author: message.author.id }
				});
			} else if (await message.ask(message.language.get('actionSharedRoleSetupNew'))) {
				await message.guild.security.actions.restrictionSetup(message, ModerationSetupRestriction.Emoji);
				await message.sendLocale('commandSuccess');
			} else {
				await message.sendLocale('monitorCommandHandlerAborted');
			}
		}

		return false;
	}

	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.restrictEmoji(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}
}
