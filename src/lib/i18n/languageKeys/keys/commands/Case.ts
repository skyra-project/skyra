import { FT, T } from '#lib/types';

// Root
export const Name = T('commands/case:name');
export const Description = T('commands/case:description');

export const View = 'commands/case:view';
export const Archive = 'commands/case:archive';
export const Delete = 'commands/case:delete';
export const Edit = 'commands/case:edit';
export const List = 'commands/case:list';

export const OptionsCase = 'commands/case:optionsCase';
export const OptionsReason = 'commands/case:optionsReason';
export const OptionsDuration = 'commands/case:optionsDuration';
export const OptionsUser = 'commands/case:optionsUser';
export const OptionsOverview = 'commands/case:optionsOverview';
export const OptionsType = 'commands/case:optionsType';
export const OptionsPendingOnly = 'commands/case:optionsPendingOnly';
export const OptionsShow = 'commands/case:optionsShow';

export const TimeNotAllowed = FT<{ type: string }>('commands/case:timeNotAllowed');
export const TimeNotAllowedInCompletedEntries = FT<{ caseId: number }>('commands/case:timeNotAllowedInCompletedEntries');
export const TimeEditNotSupported = FT<{ type: string }>('commands/case:timeEditNotSupported');
export const TimeTooEarly = FT<{ time: string }>('commands/case:timeTooEarly');
export const ListEmpty = T('commands/case:listEmpty');
export const ListDetailsTitle = FT<{ count: number }>('commands/case:listDetailsTitle');
export const ListDetailsModerator = FT<{ emoji: string; mention: string; userId: string }>('commands/case:listDetailsModerator');
export const ListDetailsUser = FT<{ emoji: string; mention: string; userId: string }>('commands/case:listDetailsUser');
export const ListDetailsExpires = FT<{ emoji: string; time: string }>('commands/case:listDetailsExpires');
export const ListOverviewFooter = FT<ListOverview>('commands/case:listOverviewFooter');
export const ListOverviewFooterUser = FT<ListOverview>('commands/case:listOverviewFooterUser');
export const ListOverviewFooterWarning = FT<{ count: number }>('commands/case:listOverviewFooterWarning');
export const ListOverviewFooterMutes = FT<{ count: number }>('commands/case:listOverviewFooterMutes');
export const ListOverviewFooterTimeouts = FT<{ count: number }>('commands/case:listOverviewFooterTimeouts');
export const ListOverviewFooterKicks = FT<{ count: number }>('commands/case:listOverviewFooterKicks');
export const ListOverviewFooterBans = FT<{ count: number }>('commands/case:listOverviewFooterBans');
export const EditSuccess = FT<{ caseId: number }>('commands/case:editSuccess');
export const ArchiveSuccess = FT<{ caseId: number }>('commands/case:archiveSuccess');
export const DeleteSuccess = FT<{ caseId: number }>('commands/case:deleteSuccess');

interface ListOverview {
	warnings: string;
	mutes: string;
	timeouts: string;
	kicks: string;
	bans: string;
}
