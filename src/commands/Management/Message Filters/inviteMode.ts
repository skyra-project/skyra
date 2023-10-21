import { GuildSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['invites-mode', 'inv-mode'],
	description: LanguageKeys.Commands.Management.InviteModeDescription,
	detailedDescription: LanguageKeys.Commands.Management.InviteModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'invites';
	protected keyEnabled: GuildSettingsOfType<boolean> = GuildSettings.Selfmod.Invites.Enabled;
	protected keySoftAction: GuildSettingsOfType<number> = GuildSettings.Selfmod.Invites.SoftAction;
	protected keyHardAction: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Invites.HardAction;
	protected keyHardActionDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Invites.HardActionDuration;
	protected keyThresholdMaximum: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Invites.ThresholdMaximum;
	protected keyThresholdDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Invites.ThresholdDuration;
}
