/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace UserSettings {

	export const CommandUses = T<number>('commandUses');
	export const BadgeList = T<readonly string[]>('badgeList');
	export const BadgeSet = T<readonly string[]>('badgeSet');
	export const BannerList = T<readonly string[]>('bannerList');
	export const Color = T<string>('color');
	export const Marry = T<string>('marry');
	export const Money = T<number>('money');
	export const Points = T<number>('points');
	export const Reputation = T<number>('reputation');
	export const ThemeLevel = T<string>('themeLevel');
	export const ThemeProfile = T<string>('themeProfile');
	export const TimeDaily = T<number>('timeDaily');
	export const TimeReputation = T<number>('timeReputation');

}
