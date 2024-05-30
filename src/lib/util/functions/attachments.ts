import { isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import type { Attachment } from 'discord.js';

/**
 * Checks whether an attachment is a media attachment, this is done so by checking the content type of the attachment,
 * if the content type starts with `image/`, `video/` or `audio/` it is considered a media attachment.
 *
 * If the content type is `image/` or `video/`, it will also check if the attachment has dimensions defined to ensure
 * it is a valid media attachment.
 *
 * @param attachment The attachment to check
 * @returns Whether the attachment is a media attachment
 */
export function isMediaAttachment(attachment: Attachment): boolean {
	if (isNullishOrEmpty(attachment.contentType)) return false;

	// If the attachment is an audio attachment, return true:
	if (attachment.contentType.startsWith('audio/')) return true;

	// If the attachment is an image or video attachment, return true if it has dimensions defined:
	return attachment.contentType.startsWith('image/') || attachment.contentType.startsWith('video/') //
		? hasDimensionsDefined(attachment)
		: false;
}

/**
 * Checks whether an attachment is an image attachment, this is done so by checking the content type of the attachment,
 * if the content type starts with `image/` and the attachment has dimensions defined, it is considered an image
 * attachment.
 *
 * @param attachment The attachment to check
 * @returns Whether the attachment is an image attachment
 */
export function isImageAttachment(attachment: Attachment): boolean {
	return (
		// A content type is required for an image attachment:
		!isNullishOrEmpty(attachment.contentType) && //
		// An image attachment must have a content type starting with 'image/':
		attachment.contentType.startsWith('image/') &&
		// An image attachment must have dimensions defined:
		hasDimensionsDefined(attachment)
	);
}

function hasDimensionsDefined(attachment: Attachment): boolean {
	return !isNullishOrZero(attachment.width) && !isNullishOrZero(attachment.height);
}
