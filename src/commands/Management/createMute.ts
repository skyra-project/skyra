import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Emojis } from '@utils/constants';
import { displayEntry } from '@utils/SettingsUtils';
import { resolveEmoji } from '@utils/util';
import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 150,
			description: (language) => language.get(LanguageKeys.Commands.Management.CreateMuteDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.CreateMuteExtended),
			permissionLevel: PermissionLevels.Administrator,
			requiredGuildPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		if (await message.ask(message.language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const [role] = (await this.rolePrompt
				.createPrompt(message, { time: 30000, limit: 1 })
				.run(message.language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

			const [update] = await message.guild!.settings.update(GuildSettings.Roles.Muted, role, {
				extraContext: { author: message.author.id }
			});
			if (message.reactable) return message.react(resolveEmoji(Emojis.GreenTick)!);
			return message.sendLocale('commandConfUpdated', [
				{
					key: GuildSettings.Roles.Muted,
					response: displayEntry(update.entry, update.next, message.guild!)
				}
			]);
		} else if (await message.ask(message.language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await message.guild!.security.actions.muteSetup(message);
			await message.sendLocale(LanguageKeys.Misc.CommandSuccess);
		} else {
			await message.sendLocale(LanguageKeys.Monitors.CommandHandlerAborted);
		}
	}
}
