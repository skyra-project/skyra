import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { PickByValue } from '@sapphire/utilities';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['word-filter-mode'],
	description: LanguageKeys.Commands.Management.FilterModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.FilterModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'words';
	protected keyEnabled: PickByValue<GuildEntity, boolean> = GuildSettings.Selfmod.Filter.Enabled;
	protected keySoftAction: PickByValue<GuildEntity, number> = GuildSettings.Selfmod.Filter.SoftAction;
	protected keyHardAction: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Filter.HardAction;
	protected keyHardActionDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Filter.HardActionDuration;
	protected keyThresholdMaximum: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Filter.ThresholdMaximum;
	protected keyThresholdDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Filter.ThresholdDuration;
}
