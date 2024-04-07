import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const EvalDescription = T<string>('commands/system:evalDescription');
export const EvalError = FT<{ time: string; output: string; type: string }, string>('commands/system:evalError');
export const EvalExtended = T<LanguageHelpDisplayOptions>('commands/system:evalExtended');
export const EvalTimeout = FT<{ seconds: number }, string>('commands/system:evalTimeout');
export const Reboot = T<string>('commands/system:reboot');
export const RebootDescription = T<string>('commands/system:rebootDescription');
export const RebootExtended = T<LanguageHelpDisplayOptions>('commands/system:rebootExtended');
