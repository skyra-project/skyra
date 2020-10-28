import { FT, T } from '@lib/types';

export const FetchNoArguments = T<string>('musicManagerFetchNoArguments');
export const FetchNoMatches = T<string>('musicManagerFetchNoMatches');
export const FetchLoadFailed = T<string>('musicManagerFetchLoadFailed');
export const ImportQueueNotFound = T<string>('musicManagerImportQueueNotFound');
export const ImportQueueError = T<string>('musicManagerImportQueueError');
export const TooManySongs = T<string>('musicManagerTooManySongs');
export const SetvolumeSilent = T<string>('musicManagerSetvolumeSilent');
export const SetvolumeLoud = T<string>('musicManagerSetvolumeLoud');
export const PlayNoSongs = T<string>('musicManagerPlayNoSongs');
export const PlayPlaying = T<string>('musicManagerPlayPlaying');
export const Stuck = FT<{ milliseconds: number }, string>('musicManagerStuck');
