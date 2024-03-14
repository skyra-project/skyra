import { T } from '#lib/types';

// Root
export const Name = T('commands/settings-moderation:name');
export const Description = T('commands/settings-moderation:description');

// Subcommand Groups
export const Edit = 'commands/settings-moderation:edit';
export const Reset = 'commands/settings-moderation:reset';
export const View = 'commands/settings-moderation:view';

// Subcommands
export const Attachment = 'commands/settings-moderation:attachment';
export const Uppercase = 'commands/settings-moderation:uppercase';
export const Invite = 'commands/settings-moderation:invite';
export const Link = 'commands/settings-moderation:link';
export const Filter = 'commands/settings-moderation:filter';
export const Newline = 'commands/settings-moderation:newline';
export const DuplicatedMessages = 'commands/settings-moderation:duplicatedMessages';

// Options
export const EnabledName = T('commands/settings-moderation:enabledName');
export const EnabledDescription = T('commands/settings-moderation:enabledDescription');
export const OnInfractionAlertName = T('commands/settings-moderation:onInfractionAlertName');
export const OnInfractionAlertDescription = T('commands/settings-moderation:onInfractionAlertDescription');
export const OnInfractionLogName = T('commands/settings-moderation:onInfractionLogName');
export const OnInfractionLogDescription = T('commands/settings-moderation:onInfractionLogDescription');
export const OnInfractionDeleteName = T('commands/settings-moderation:onInfractionDeleteName');
export const OnInfractionDeleteDescription = T('commands/settings-moderation:onInfractionDeleteDescription');
export const OnThresholdName = T('commands/settings-moderation:onThresholdName');
export const OnThresholdDescription = T('commands/settings-moderation:onThresholdDescription');
export const PenaltyDurationName = T('commands/settings-moderation:penaltyDurationName');
export const PenaltyDurationDescription = T('commands/settings-moderation:penaltyDurationDescription');
export const ThresholdMaximumName = T('commands/settings-moderation:thresholdMaximumName');
export const ThresholdMaximumDescription = T('commands/settings-moderation:thresholdMaximumDescription');
export const ThresholdExpirationName = T('commands/settings-moderation:thresholdExpirationName');
export const ThresholdExpirationDescription = T('commands/settings-moderation:thresholdExpirationDescription');

export const EnabledResetDescription = T('commands/settings-moderation:enabledResetDescription');
export const OnInfractionAlertResetDescription = T('commands/settings-moderation:onInfractionAlertResetDescription');
export const OnInfractionLogResetDescription = T('commands/settings-moderation:onInfractionLogResetDescription');
export const OnInfractionDeleteResetDescription = T('commands/settings-moderation:onInfractionDeleteResetDescription');
export const OnThresholdResetDescription = T('commands/settings-moderation:onThresholdResetDescription');
export const PenaltyDurationResetDescription = T('commands/settings-moderation:penaltyDurationResetDescription');
export const ThresholdMaximumResetDescription = T('commands/settings-moderation:thresholdMaximumResetDescription');
export const ThresholdExpirationResetDescription = T('commands/settings-moderation:thresholdExpirationResetDescription');

// Penalties
export const PenaltyNone = T('commands/settings-moderation:penaltyNone');
export const PenaltyWarning = T('commands/settings-moderation:penaltyWarning');
export const PenaltyMute = T('commands/settings-moderation:penaltyMute');
export const PenaltyKick = T('commands/settings-moderation:penaltyKick');
export const PenaltySoftBan = T('commands/settings-moderation:penaltySoftBan');
export const PenaltyBan = T('commands/settings-moderation:penaltyBan');
