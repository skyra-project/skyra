import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import { Identifiers } from '@sapphire/framework';

describe('translate', () => {
	test('GIVEN argument identifier THEN returns arguments:{identifier}', () => {
		expect(translate(Identifiers.ArgumentBoolean)).toBe(`arguments:${Identifiers.ArgumentBoolean}`);
		expect(translate(Identifiers.ArgumentCategoryChannel)).toBe(`arguments:${Identifiers.ArgumentCategoryChannel}`);
		expect(translate(Identifiers.ArgumentChannel)).toBe(`arguments:${Identifiers.ArgumentChannel}`);
		expect(translate(Identifiers.ArgumentDate)).toBe(`arguments:${Identifiers.ArgumentDate}`);
		expect(translate(Identifiers.ArgumentDateTooSmall)).toBe(`arguments:${Identifiers.ArgumentDateTooSmall}`);
		expect(translate(Identifiers.ArgumentDateTooBig)).toBe(`arguments:${Identifiers.ArgumentDateTooBig}`);
		expect(translate(Identifiers.ArgumentDMChannel)).toBe(`arguments:${Identifiers.ArgumentDMChannel}`);
		expect(translate(Identifiers.ArgumentFloat)).toBe(`arguments:${Identifiers.ArgumentFloat}`);
		expect(translate(Identifiers.ArgumentFloatTooSmall)).toBe(`arguments:${Identifiers.ArgumentFloatTooSmall}`);
		expect(translate(Identifiers.ArgumentFloatTooBig)).toBe(`arguments:${Identifiers.ArgumentFloatTooBig}`);
		expect(translate(Identifiers.ArgumentGuildChannel)).toBe(`arguments:${Identifiers.ArgumentGuildChannel}`);
		expect(translate(Identifiers.ArgumentGuildChannelMissingGuild)).toBe(`arguments:${Identifiers.ArgumentGuildChannelMissingGuild}`);
		expect(translate(Identifiers.ArgumentHyperlink)).toBe(`arguments:${Identifiers.ArgumentHyperlink}`);
		expect(translate(Identifiers.ArgumentInteger)).toBe(`arguments:${Identifiers.ArgumentInteger}`);
		expect(translate(Identifiers.ArgumentIntegerTooSmall)).toBe(`arguments:${Identifiers.ArgumentIntegerTooSmall}`);
		expect(translate(Identifiers.ArgumentIntegerTooBig)).toBe(`arguments:${Identifiers.ArgumentIntegerTooBig}`);
		expect(translate(Identifiers.ArgumentMember)).toBe(`arguments:${Identifiers.ArgumentMember}`);
		expect(translate(Identifiers.ArgumentMemberMissingGuild)).toBe(`arguments:${Identifiers.ArgumentMemberMissingGuild}`);
		expect(translate(Identifiers.ArgumentMessage)).toBe(`arguments:${Identifiers.ArgumentMessage}`);
		expect(translate(Identifiers.ArgumentNewsChannel)).toBe(`arguments:${Identifiers.ArgumentNewsChannel}`);
		expect(translate(Identifiers.ArgumentNumber)).toBe(`arguments:${Identifiers.ArgumentNumber}`);
		expect(translate(Identifiers.ArgumentNumberTooSmall)).toBe(`arguments:${Identifiers.ArgumentNumberTooSmall}`);
		expect(translate(Identifiers.ArgumentNumberTooBig)).toBe(`arguments:${Identifiers.ArgumentNumberTooBig}`);
		expect(translate(Identifiers.ArgumentRole)).toBe(`arguments:${Identifiers.ArgumentRole}`);
		expect(translate(Identifiers.ArgumentRoleMissingGuild)).toBe(`arguments:${Identifiers.ArgumentRoleMissingGuild}`);
		expect(translate(Identifiers.ArgumentStringTooShort)).toBe(`arguments:${Identifiers.ArgumentStringTooShort}`);
		expect(translate(Identifiers.ArgumentStringTooLong)).toBe(`arguments:${Identifiers.ArgumentStringTooLong}`);
		expect(translate(Identifiers.ArgumentTextChannel)).toBe(`arguments:${Identifiers.ArgumentTextChannel}`);
		expect(translate(Identifiers.ArgumentUser)).toBe(`arguments:${Identifiers.ArgumentUser}`);
		expect(translate(Identifiers.ArgumentVoiceChannel)).toBe(`arguments:${Identifiers.ArgumentVoiceChannel}`);
	});

	test('GIVEN ArgsUnavailable THEN returns LanguageKeys.Arguments.Unavailable', () => {
		expect(translate(Identifiers.ArgsUnavailable)).toBe(LanguageKeys.Arguments.Unavailable);
	});

	test('GIVEN ArgsMissing THEN returns LanguageKeys.Arguments.Missing', () => {
		expect(translate(Identifiers.ArgsMissing)).toBe(LanguageKeys.Arguments.Missing);
	});

	test('GIVEN CommandDisabled THEN returns LanguageKeys.Preconditions.DisabledGlobal', () => {
		expect(translate(Identifiers.CommandDisabled)).toBe(LanguageKeys.Preconditions.DisabledGlobal);
	});

	test('GIVEN PreconditionCooldown THEN returns LanguageKeys.Preconditions.Cooldown', () => {
		expect(translate(Identifiers.PreconditionCooldown)).toBe(LanguageKeys.Preconditions.Cooldown);
	});

	test('GIVEN PreconditionDMOnly THEN returns LanguageKeys.Preconditions.DMOnly', () => {
		expect(translate(Identifiers.PreconditionDMOnly)).toBe(LanguageKeys.Preconditions.DMOnly);
	});

	test('GIVEN PreconditionGuildOnly THEN returns LanguageKeys.Preconditions.GuildOnly', () => {
		expect(translate(Identifiers.PreconditionGuildOnly)).toBe(LanguageKeys.Preconditions.GuildOnly);
	});

	test('GIVEN PreconditionNSFW THEN returns LanguageKeys.Preconditions.NSFW', () => {
		expect(translate(Identifiers.PreconditionNSFW)).toBe(LanguageKeys.Preconditions.NSFW);
	});

	test('GIVEN PreconditionPermissions THEN returns LanguageKeys.Preconditions.Permissions', () => {
		expect(translate(Identifiers.PreconditionPermissions)).toBe(LanguageKeys.Preconditions.Permissions);
	});

	test('GIVEN unknown identifier THEN returns identifier', () => {
		expect(translate('does_not_exist')).toBe('does_not_exist');
	});
});
