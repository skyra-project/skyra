/* eslint-disable @typescript-eslint/no-namespace */
import type { PostProcessorModule } from 'i18next';
import { join } from 'path';

export const rootFolder = join(__dirname, '..', '..', '..', '..');
export const assetsFolder = join(rootFolder, 'assets');
export const socialFolder = join(assetsFolder, 'images', 'social');
export const cdnFolder = process.env.NODE_ENV === 'production' ? join('/var', 'www', 'skyra.pw', 'cdn') : join(assetsFolder, 'public');

export const ZeroWidthSpace = '\u200B';
export const LongWidthSpace = '\u3000';

export const enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * (365 / 12),
	Year = 1000 * 60 * 60 * 24 * 365
}

export const enum BrawlStarsEmojis {
	Trophy = '<:bstrophy:742083351891935353>',
	PowerPlay = '<:powerplay:746370227377405993>',
	RoboRumble = '<:bsroborumble:742086199065182269>',
	BossFight = '<:bsbossfight:742087586788540427>',
	Exp = '<:bsxp:743434002139971636>',
	GemGrab = '<:bsgemgrab:743430818780676137>',
	SoloShowdown = '<:bssoloshowdown:743431454557732955>',
	DuoShowdown = '<:bsduoshowdown:743431564674990151>',
	ChampionshipChallenge = '<:bschallenge:746373277726801971>'
}

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

export namespace ConnectFourConstants {
	export const enum Emojis {
		Empty = '<:Empty:352403997606412289>',
		PlayerOne = '<:PlayerONE:352403997300359169>',
		PlayerTwo = '<:PlayerTWO:352404081974968330>',
		WinnerOne = '<:PlayerONEWin:352403997761601547>',
		WinnerTwo = '<:PlayerTWOWin:352403997958602752>'
	}

	export const Reactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣'] as readonly string[];
}

export const enum MessageLogsEnum {
	Message,
	NSFWMessage,
	Image,
	Moderation,
	Member,
	Reaction
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
