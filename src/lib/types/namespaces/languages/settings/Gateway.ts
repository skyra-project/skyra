import { FT } from '#lib/types';

export const ChooseKey = FT<{ keys: string }, string>('settings:validationChooseKey');
export const MissingValue = FT<{ path: string; value: string }, string>('settings:validationMissingValue');
export const DuplicateValue = FT<{ path: string; value: string }, string>('settings:validationDuplicatedValue');
