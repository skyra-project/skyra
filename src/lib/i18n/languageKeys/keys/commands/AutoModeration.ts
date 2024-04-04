import { FT, T } from '#lib/types';

export const Show = 'commands/auto-moderation:show';
export const Edit = 'commands/auto-moderation:edit';
export const Reset = 'commands/auto-moderation:reset';
export const AddName = 'commands/auto-moderation:addName';
export const RemoveName = 'commands/auto-moderation:removeName';

export const OptionsEnabled = 'commands/auto-moderation:optionsEnabled';
export const OptionsActionAlert = 'commands/auto-moderation:optionsActionAlert';
export const OptionsActionLog = 'commands/auto-moderation:optionsActionLog';
export const OptionsActionDelete = 'commands/auto-moderation:optionsActionDelete';
export const OptionsPunishment = 'commands/auto-moderation:optionsPunishment';
export const OptionsPunishmentDuration = 'commands/auto-moderation:optionsPunishmentDuration';
export const OptionsThreshold = 'commands/auto-moderation:optionsThreshold';
export const OptionsThresholdPeriod = 'commands/auto-moderation:optionsThresholdPeriod';
export const OptionsKey = 'commands/auto-moderation:optionsKey';
export const OptionsWord = 'commands/auto-moderation:optionsWord';

export const OptionsKeyEnabled = T('commands/auto-moderation:optionsKeyEnabled');
export const OptionsKeyActionAlert = T('commands/auto-moderation:optionsKeyActionAlert');
export const OptionsKeyActionLog = T('commands/auto-moderation:optionsKeyActionLog');
export const OptionsKeyActionDelete = T('commands/auto-moderation:optionsKeyActionDelete');
export const OptionsKeyPunishment = T('commands/auto-moderation:optionsKeyPunishment');
export const OptionsKeyPunishmentDuration = T('commands/auto-moderation:optionsKeyPunishmentDuration');
export const OptionsKeyThreshold = T('commands/auto-moderation:optionsKeyThreshold');
export const OptionsKeyThresholdPeriod = T('commands/auto-moderation:optionsKeyThresholdPeriod');
export const OptionsKeyWords = T('commands/auto-moderation:optionsKeyWords');

export const AttachmentsName = T('commands/auto-moderation:attachmentsName');
export const AttachmentsDescription = T('commands/auto-moderation:attachmentsDescription');
export const CapitalsName = T('commands/auto-moderation:capitalsName');
export const CapitalsDescription = T('commands/auto-moderation:capitalsDescription');
export const WordsName = T('commands/auto-moderation:wordsName');
export const WordsDescription = T('commands/auto-moderation:wordsDescription');
export const InvitesName = T('commands/auto-moderation:invitesName');
export const InvitesDescription = T('commands/auto-moderation:invitesDescription');
export const LinksName = T('commands/auto-moderation:linksName');
export const LinksDescription = T('commands/auto-moderation:linksDescription');
export const SpamName = T('commands/auto-moderation:spamName');
export const SpamDescription = T('commands/auto-moderation:spamDescription');
export const NewlinesName = T('commands/auto-moderation:newlinesName');
export const NewlinesDescription = T('commands/auto-moderation:newlinesDescription');
export const ReactionsName = T('commands/auto-moderation:reactionsName');
export const ReactionsDescription = T('commands/auto-moderation:reactionsDescription');

export const ShowDisabled = T('commands/auto-moderation:showDisabled');
export const ShowEnabled = T('commands/auto-moderation:showEnabled');
export const ShowReplyActive = FT<{ emoji: string }>('commands/auto-moderation:showReplyActive');
export const ShowReplyInactive = FT<{ emoji: string }>('commands/auto-moderation:showReplyInactive');
export const ShowLogActive = FT<{ emoji: string }>('commands/auto-moderation:showLogActive');
export const ShowLogInactive = FT<{ emoji: string }>('commands/auto-moderation:showLogInactive');
export const ShowDeleteActive = FT<{ emoji: string }>('commands/auto-moderation:showDeleteActive');
export const ShowDeleteInactive = FT<{ emoji: string }>('commands/auto-moderation:showDeleteInactive');
export const ShowPunishmentTitle = T('commands/auto-moderation:showPunishmentTitle');
export const ShowPunishment = FT<{ name: string }>('commands/auto-moderation:showPunishment');
export const ShowPunishmentTemporary = FT<{ name: string; duration: string }>('commands/auto-moderation:showPunishmentTemporary');
export const ShowPunishmentThresholdMaximumUnset = T('commands/auto-moderation:showPunishmentThresholdMaximumUnset');
export const ShowPunishmentThresholdMaximum = FT<{ maximum: string }>('commands/auto-moderation:showPunishmentThresholdMaximum');
export const ShowPunishmentThresholdPeriodUnset = T('commands/auto-moderation:showPunishmentThresholdPeriodUnset');
export const ShowPunishmentThresholdPeriod = FT<{ duration: string }>('commands/auto-moderation:showPunishmentThresholdPeriod');

export const EditSuccess = T('commands/auto-moderation:editSuccess');

export const WordAddDescription = T('commands/auto-moderation:wordAddDescription');
export const WordAddFiltered = FT<{ word: string }>('commands/auto-moderation:wordAddFiltered');
export const WordRemoveDescription = T('commands/auto-moderation:wordRemoveDescription');
export const WordRemoveNotFiltered = FT<{ word: string }>('commands/auto-moderation:wordRemoveNotFiltered');
export const WordShowList = FT<{ words: string[] }>('commands/auto-moderation:wordShowList');
