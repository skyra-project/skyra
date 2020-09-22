import { T } from '@lib/types/Shared';

export const KeyNoext = T<(params: { key: string }) => string>('settingGatewayKeyNoext');
export const ChooseKey = T<(params: { keys: string }) => string>('settingGatewayChooseKey');
export const UnconfigurableFolder = T<string>('settingGatewayUnconfigurableFolder');
export const UnconfigurableKey = T<(params: { key: string }) => string>('settingGatewayUnconfigurableKey');
export const MissingValue = T<(params: { path: string; value: string }) => string>('settingGatewayMissingValue');
export const DuplicateValue = T<(params: { path: string; value: string }) => string>('settingGatewayDuplicateValue');
export const InvalidFilteredValue = T<(params: { path: string; value: unknown }) => string>('settingGatewayInvalidFilteredValue');
