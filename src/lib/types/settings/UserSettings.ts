/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace UserSettings {

	export const CommandUses = T<number>('command_uses');
	export const BannerList = T<readonly string[]>('banner_list');
	export const BadgeList = T<readonly string[]>('badge_list');
	export const BadgeSet = T<readonly string[]>('badge_set');
	export const Color = T<number>('color');
	export const Marry = T<readonly string[]>('marry');
	export const Money = T<number>('money');
	export const Points = T<number>('point_count');
	export const Reputation = T<number>('reputation_count');
	export const ThemeLevel = T<string>('theme_level');
	export const ThemeProfile = T<string>('theme_profile');
	export const DarkTheme = T<boolean>('dark_theme');
	export const ModerationDM = T<boolean>('moderation_dm');
	export const TimeDaily = T<number>('next_daily');
	export const TimeReputation = T<number>('next_reputation');

}
