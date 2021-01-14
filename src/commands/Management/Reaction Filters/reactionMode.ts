import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/structures/commands/SelfModerationCommand';
import { SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { KeyOfType } from '#lib/types';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['reaction-mode', 'r-mode'],
	description: LanguageKeys.Commands.Management.ReactionModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.ReactionModeExtended
})
export default class extends SelfModerationCommand {
	protected $adder: AdderKey = 'reactions';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Reactions.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Reactions.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.ThresholdDuration;
}
