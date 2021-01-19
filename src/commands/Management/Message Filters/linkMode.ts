import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/structures';
import type { KeyOfType } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['link-mode', 'lmode', 'linkfilter', 'extlinks', 'externallinks'],
	description: LanguageKeys.Commands.Management.LinkModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.LinkModeExtended
})
export default class extends SelfModerationCommand {
	protected $adder: AdderKey = 'links';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Links.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Links.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.ThresholdDuration;
}
