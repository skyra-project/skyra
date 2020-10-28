export enum Suggestions {
	ID = 'suggestionsId',
	SuggestionsChannel = 'suggestionsChannel'
}

import { VotingEmojis as VotingEmojisInternal } from './Suggestions/VotingEmojis';
import { OnAction as OnActionInternal } from './Suggestions/OnAction';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Selfmod {
	export declare const VotingEmojis: VotingEmojisInternal;
	export declare const OnAction: OnActionInternal;
}
