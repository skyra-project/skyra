export enum Selfmod {
	Attachment = 'selfmod.attachment',
	AttachmentAction = 'selfmod.attachmentAction',
	AttachmentDuration = 'selfmod.attachmentDuration',
	AttachmentMaximum = 'selfmod.attachmentMaximum',
	AttachmentPunishmentDuration = 'selfmod.attachmentPunishmentDuration'
}

import { Capitals as CapitalsInternal } from './Selfmod/Capitals';
import { Filter as FilterInternal } from './Selfmod/Filter';
import { Invites as InvitesInternal } from './Selfmod/Invites';
import { Links as LinksInternal } from './Selfmod/Links';
import { Messages as MessagesInternal } from './Selfmod/Messages';
import { Newlines as NewlinesInternal } from './Selfmod/Newlines';
import { NoMentionSpam as NoMentionSpamInternal } from './Selfmod/NoMentionSpam';
import { Reactions as ReactionsInternal } from './Selfmod/Reactions';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Selfmod {
	export declare const Capitals: CapitalsInternal;
	export declare const Filter: FilterInternal;
	export declare const Invites: InvitesInternal;
	export declare const Links: LinksInternal;
	export declare const Messages: MessagesInternal;
	export declare const Newlines: NewlinesInternal;
	export declare const NoMentionSpam: NoMentionSpamInternal;
	export declare const Reactions: ReactionsInternal;
}
