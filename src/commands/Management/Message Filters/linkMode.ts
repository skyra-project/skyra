import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { SelfModerationCommand } from '#lib/structures/commands/SelfModerationCommand';
import { SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { KeyOfType } from '#lib/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
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
