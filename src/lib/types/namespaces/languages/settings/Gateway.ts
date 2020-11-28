import { FT, T } from '#lib/types';

export const KeyNoext = FT<{ key: string }, string>('settingGatewayKeyNoext');
export const ChooseKey = FT<{ keys: string }, string>('settingGatewayChooseKey');
export const UnconfigurableFolder = T<string>('settingGatewayUnconfigurableFolder');
export const UnconfigurableKey = FT<{ key: string }, string>('settingGatewayUnconfigurableKey');
export const MissingValue = FT<{ path: string; value: string }, string>('settingGatewayMissingValue');
export const DuplicateValue = FT<{ path: string; value: string }, string>('settingGatewayDuplicateValue');
export const InvalidFilteredValue = FT<{ path: string; value: unknown }, string>('settingGatewayInvalidFilteredValue');
