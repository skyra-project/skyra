import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/structures/commands/SelfModerationCommand';
import { SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { KeyOfType } from '#lib/types';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['capitals-mode', 'caps-mode'],
	description: LanguageKeys.Commands.Management.CapitalsModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.CapitalsModeExtended
})
export default class extends SelfModerationCommand {
	protected $adder: AdderKey = 'capitals';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Capitals.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Capitals.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.ThresholdDuration;
}
