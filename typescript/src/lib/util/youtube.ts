import { envParseBoolean } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';

export const enabled = envParseBoolean('GRPC_ENABLED') && envParseBoolean('GRPC_YOUTUBE_ENABLED');
export const allowedChannelOrigins = ['youtube.com', 'www.youtube.com'];
export const allowedChannelPathName = /^\/(?:c|channel|user)\/([a-zA-Z_]{1,24})$/;

export function validateChannel(url: URL) {
	if (!allowedChannelOrigins.includes(url.origin)) {
		throw new UserError({ identifier: LanguageKeys.Commands.Notifications.YoutubeInvalidChannel, context: { url: url.href } });
	}

	const result = allowedChannelPathName.exec(url.pathname);
	if (result === null) {
		throw new UserError({ identifier: LanguageKeys.Commands.Notifications.YoutubeInvalidChannel, context: { url: url.href } });
	}

	return `https://youtube.com/c/${result[1]}` as const;
}
