export enum Suggestions {
	SuggestionsChannel = 'suggestionsChannel'
}

import { OnAction as OnActionInternal } from './Suggestions/OnAction';
import { VotingEmojis as VotingEmojisInternal } from './Suggestions/VotingEmojis';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Suggestions {
	export declare const VotingEmojis: typeof VotingEmojisInternal;
	export declare const OnAction: typeof OnActionInternal;
}
