import emojiRegex = require('emoji-regex/es2015');

// This is dumb, but Mathias's package does the regex global.
// This is a workaround I hate, but I have to deal with it.
export const REGEX_UNICODE_EMOJI = new RegExp(emojiRegex().source, 'u');
export const REGEX_UNICODE_BOXNM = /^\d\u20E3$/;
