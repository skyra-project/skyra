import { FT } from '#lib/types';

export const ChooseKey = FT<{ keys: string }, string>('setting:validationChooseKey');
export const MissingValue = FT<{ path: string; value: string }, string>('setting:validationMissingValue');
export const DuplicateValue = FT<{ path: string; value: string }, string>('setting:validationDuplicatedValue');
