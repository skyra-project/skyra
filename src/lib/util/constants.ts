import { getRootData } from '@sapphire/pieces';
import type { PostProcessorModule } from 'i18next';
import { join } from 'node:path';

export const mainFolder = getRootData().root;
export const rootFolder = join(mainFolder, '..');
export const assetsFolder = join(rootFolder, 'assets');
export const socialFolder = join(assetsFolder, 'images', 'social');
export const cdnFolder = process.env.NODE_ENV === 'production' ? join('/var', 'www', 'skyra.pw', 'cdn') : join(assetsFolder, 'public');

export const ZeroWidthSpace = '\u200B';
export const LongWidthSpace = '\u3000';

export const enum Emojis {
	ArrowB = '<:ArrowB:694594285269680179>',
	ArrowBL = '<:ArrowBL:694594285118685259>',
	ArrowBR = '<:ArrowBR:694594285445578792>',
	ArrowL = '<:ArrowL:694594285521207436>',
	ArrowR = '<:ArrowR:694594285466812486>',
	ArrowT = '<:ArrowT:694594285487652954>',
	ArrowTL = '<:ArrowTL:694594285625933854>',
	ArrowTR = '<:ArrowTR:694594285412155393>',
	BoostLevel1 = '<:boostlvl1:764841388243681322>',
	BoostLevel2 = '<:boostlvl2:764841388449071134>',
	BoostLevel3 = '<:boostlvl3:764841388029902891>',
	BoostLevel4 = '<:boostlvl4:764841388336349225>',
	BoostLevel5 = '<:boostlvl5:764841388449202198>',
	BoostLevel6 = '<:boostlvl6:764841388445532200>',
	BoostLevel7 = '<:boostlvl7:764841388150882305>',
	BoostLevel8 = '<:boostlvl8:764841388462178344>',
	BoostLevel9 = '<:boostlvl9:764841388470698014>',
	Bot = '<:bot:764788923851079702>',
	Frame = '<:frame:764845055356698644>',
	GreenTick = '<:greenTick:637706251253317669>',
	GreenTickSerialized = 's637706251253317669',
	Loading = '<a:sloading:656988867403972629>',
	RedCross = '<:redCross:637706251257511973>',
	Shiny = '<:shiny:612364146792726539>',
	Star = '<:Star:736337719982030910>',
	StarEmpty = '<:StarEmpty:736337232738254849>',
	StarHalf = '<:StarHalf:736337529900499034>',
	/** This is the default Twemoji, uploaded as a custom emoji because iOS and Android do not render the emoji properly */
	MaleSignEmoji = '<:2642:845772713770614874>',
	/** This is the default Twemoji, uploaded as a custom emoji because iOS and Android do not render the emoji properly */
	FemaleSignEmoji = '<:2640:845772713729720320>'
}

export const helpUsagePostProcessor: PostProcessorModule = {
	type: 'postProcessor',
	name: 'helpUsagePostProcessor',
	process(value, [key]) {
		// If the value is equal to the key then it is an empty usage, so return an empty string
		if (value === key) return '';
		// Otherwise just return the value
		return value;
	}
};

export const enum BrandingColors {
	Primary = 0x1e88e5,
	Secondary = 0xff9d01
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type O = object;

export const enum CdnUrls {
	BannersBasePath = 'https://cdn.skyra.pw/skyra-assets/banners/',
	CoinHeads = 'https://cdn.skyra.pw/skyra-assets/coins_heads.png',
	CoinTails = 'https://cdn.skyra.pw/skyra-assets/coins_tails.png',
	EscapeRopeGif = 'https://cdn.skyra.pw/skyra-assets/escape_rope.gif',
	NodeJSLogo = 'https://cdn.skyra.pw/skyra-assets/nodejs_logo.png',
	RevolvingHeartTwemoji = 'https://twemoji.maxcdn.com/72x72/1f49e.png',
	TwitchLogo = 'https://cdn.skyra.pw/skyra-assets/twitch_logo.png'
}

export const enum LanguageFormatters {
	AndList = 'andList',
	Duration = 'duration',
	ExplicitContentFilter = 'explicitContentFilter',
	MessageNotifications = 'messageNotifications',
	Number = 'number',
	NumberCompact = 'numberCompact',
	HumanLevels = 'humanLevels',
	InlineCodeblock = 'inlineCodeBlock',
	CodeBlock = 'codeBlock',
	JsCodeBlock = 'jsCodeBlock',
	Ordinal = 'ordinal',
	OrList = 'orList',
	Permissions = 'permissions',
	Random = 'random',
	DateTime = 'dateTime',
	ToTitleCase = 'toTitleCase',
	PermissionsAndList = 'permissionsAndList'
}

export const enum Colors {
	White = 0xe7e7e8,
	Amber = 0xffc107,
	Amber300 = 0xffd54f,
	Blue = 0x2196f3,
	BlueGrey = 0x607d8b,
	Brown = 0x795548,
	Cyan = 0x00bcd4,
	DeepOrange = 0xff5722,
	DeepPurple = 0x673ab7,
	Green = 0x4caf50,
	Grey = 0x9e9e9e,
	Indigo = 0x3f51b5,
	LightBlue = 0x03a9f4,
	LightGreen = 0x8bc34a,
	Lime = 0xcddc39,
	Lime300 = 0xdce775,
	Orange = 0xff9800,
	Pink = 0xe91e63,
	Purple = 0x9c27b0,
	Red = 0xf44336,
	Red300 = 0xe57373,
	Teal = 0x009688,
	Yellow = 0xffeb3b,
	Yellow300 = 0xfff176
}

export const enum CanvasColors {
	BackgroundLight = '#FAFAFA',
	BackgroundDark = '#212121',
	IndicatorGreen = '#4CAF50',
	IndicatorRed = '#F44336'
}
