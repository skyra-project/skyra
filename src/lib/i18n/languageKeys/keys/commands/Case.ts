import { FT, T } from '#lib/types';

// Root
export const Name = T('commands/case:name');
export const Description = T('commands/case:description');

export const Show = 'commands/case:show';
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
export const OptionsShow = 'commands/case:optionsShow';

export const TimeNotAllowed = FT<{ type: string }>('commands/case:timeNotAllowed');
export const TimeTooEarly = FT<{ time: string }>('commands/case:timeTooEarly');
export const EditSuccess = FT<{ caseId: number }>('commands/case:editSuccess');
export const ArchiveSuccess = FT<{ caseId: number }>('commands/case:archiveSuccess');
export const DeleteSuccess = FT<{ caseId: number }>('commands/case:deleteSuccess');
