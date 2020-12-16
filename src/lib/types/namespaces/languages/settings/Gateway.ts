import { FT } from '#lib/types';

export const ChooseKey = FT<{ keys: string }, string>('settingGatewayChooseKey');
export const MissingValue = FT<{ path: string; value: string }, string>('settingGatewayMissingValue');
export const DuplicateValue = FT<{ path: string; value: string }, string>('settingGatewayDuplicateValue');
