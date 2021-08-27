import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import { Identifiers } from '@sapphire/framework';

describe('translate', () => {
	test('GIVEN argument identifier THEN returns arguments:{identifier}', () => {
		expect(translate(Identifiers.ArgumentBooleanError)).toBe(`arguments:${Identifiers.ArgumentBooleanError}`);
		expect(translate(Identifiers.ArgumentChannelError)).toBe(`arguments:${Identifiers.ArgumentChannelError}`);
		expect(translate(Identifiers.ArgumentDateError)).toBe(`arguments:${Identifiers.ArgumentDateError}`);
		expect(translate(Identifiers.ArgumentDateTooEarly)).toBe(`arguments:${Identifiers.ArgumentDateTooEarly}`);
		expect(translate(Identifiers.ArgumentDateTooFar)).toBe(`arguments:${Identifiers.ArgumentDateTooFar}`);
		expect(translate(Identifiers.ArgumentDMChannelError)).toBe(`arguments:${Identifiers.ArgumentDMChannelError}`);
		expect(translate(Identifiers.ArgumentFloatError)).toBe(`arguments:${Identifiers.ArgumentFloatError}`);
		expect(translate(Identifiers.ArgumentFloatTooLarge)).toBe(`arguments:${Identifiers.ArgumentFloatTooLarge}`);
		expect(translate(Identifiers.ArgumentFloatTooSmall)).toBe(`arguments:${Identifiers.ArgumentFloatTooSmall}`);
		expect(translate(Identifiers.ArgumentGuildCategoryChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildCategoryChannelError}`);
		expect(translate(Identifiers.ArgumentGuildChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildChannelError}`);
		expect(translate(Identifiers.ArgumentGuildChannelMissingGuildError)).toBe(`arguments:${Identifiers.ArgumentGuildChannelMissingGuildError}`);
		expect(translate(Identifiers.ArgumentGuildNewsChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildNewsChannelError}`);
		expect(translate(Identifiers.ArgumentGuildNewsThreadChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildNewsThreadChannelError}`);
		expect(translate(Identifiers.ArgumentGuildPrivateThreadChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildPrivateThreadChannelError}`);
		expect(translate(Identifiers.ArgumentGuildPublicThreadChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildPublicThreadChannelError}`);
		expect(translate(Identifiers.ArgumentGuildStageVoiceChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildStageVoiceChannelError}`);
		expect(translate(Identifiers.ArgumentGuildTextChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildTextChannelError}`);
		expect(translate(Identifiers.ArgumentGuildThreadChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildThreadChannelError}`);
		expect(translate(Identifiers.ArgumentGuildVoiceChannelError)).toBe(`arguments:${Identifiers.ArgumentGuildVoiceChannelError}`);
		expect(translate(Identifiers.ArgumentHyperlinkError)).toBe(`arguments:${Identifiers.ArgumentHyperlinkError}`);
		expect(translate(Identifiers.ArgumentIntegerError)).toBe(`arguments:${Identifiers.ArgumentIntegerError}`);
		expect(translate(Identifiers.ArgumentIntegerTooLarge)).toBe(`arguments:${Identifiers.ArgumentIntegerTooLarge}`);
		expect(translate(Identifiers.ArgumentIntegerTooSmall)).toBe(`arguments:${Identifiers.ArgumentIntegerTooSmall}`);
		expect(translate(Identifiers.ArgumentMemberError)).toBe(`arguments:${Identifiers.ArgumentMemberError}`);
		expect(translate(Identifiers.ArgumentMemberMissingGuild)).toBe(`arguments:${Identifiers.ArgumentMemberMissingGuild}`);
		expect(translate(Identifiers.ArgumentMessageError)).toBe(`arguments:${Identifiers.ArgumentMessageError}`);
		expect(translate(Identifiers.ArgumentNumberError)).toBe(`arguments:${Identifiers.ArgumentNumberError}`);
		expect(translate(Identifiers.ArgumentNumberTooLarge)).toBe(`arguments:${Identifiers.ArgumentNumberTooLarge}`);
		expect(translate(Identifiers.ArgumentNumberTooSmall)).toBe(`arguments:${Identifiers.ArgumentNumberTooSmall}`);
		expect(translate(Identifiers.ArgumentRoleError)).toBe(`arguments:${Identifiers.ArgumentRoleError}`);
		expect(translate(Identifiers.ArgumentRoleMissingGuild)).toBe(`arguments:${Identifiers.ArgumentRoleMissingGuild}`);
		expect(translate(Identifiers.ArgumentStringTooLong)).toBe(`arguments:${Identifiers.ArgumentStringTooLong}`);
		expect(translate(Identifiers.ArgumentStringTooShort)).toBe(`arguments:${Identifiers.ArgumentStringTooShort}`);
		expect(translate(Identifiers.ArgumentUserError)).toBe(`arguments:${Identifiers.ArgumentUserError}`);
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

	test('GIVEN PreconditionDMOnly THEN returns LanguageKeys.Preconditions.DmOnly', () => {
		expect(translate(Identifiers.PreconditionDMOnly)).toBe(LanguageKeys.Preconditions.DmOnly);
	});

	test('GIVEN PreconditionGuildNewsOnly THEN returns LanguageKeys.Preconditions.GuildNewsOnly', () => {
		expect(translate(Identifiers.PreconditionGuildNewsOnly)).toBe(LanguageKeys.Preconditions.GuildNewsOnly);
	});

	test('GIVEN PreconditionGuildNewsThreadOnly THEN returns LanguageKeys.Preconditions.GuildNewsThreadOnly', () => {
		expect(translate(Identifiers.PreconditionGuildNewsThreadOnly)).toBe(LanguageKeys.Preconditions.GuildNewsThreadOnly);
	});

	test('GIVEN PreconditionGuildOnly THEN returns LanguageKeys.Preconditions.GuildOnly', () => {
		expect(translate(Identifiers.PreconditionGuildOnly)).toBe(LanguageKeys.Preconditions.GuildOnly);
	});

	test('GIVEN PreconditionGuildPrivateThreadOnly THEN returns LanguageKeys.Preconditions.GuildPrivateThreadOnly', () => {
		expect(translate(Identifiers.PreconditionGuildPrivateThreadOnly)).toBe(LanguageKeys.Preconditions.GuildPrivateThreadOnly);
	});

	test('GIVEN PreconditionGuildPublicThreadOnly THEN returns LanguageKeys.Preconditions.GuildPublicThreadOnly', () => {
		expect(translate(Identifiers.PreconditionGuildPublicThreadOnly)).toBe(LanguageKeys.Preconditions.GuildPublicThreadOnly);
	});

	test('GIVEN PreconditionGuildTextOnly THEN returns LanguageKeys.Preconditions.GuildTextOnly', () => {
		expect(translate(Identifiers.PreconditionGuildTextOnly)).toBe(LanguageKeys.Preconditions.GuildTextOnly);
	});

	test('GIVEN PreconditionNSFW THEN returns LanguageKeys.Preconditions.Nsfw', () => {
		expect(translate(Identifiers.PreconditionNSFW)).toBe(LanguageKeys.Preconditions.Nsfw);
	});

	test('GIVEN PreconditionClientPermissions THEN returns LanguageKeys.Preconditions.ClientPermissions', () => {
		expect(translate(Identifiers.PreconditionClientPermissions)).toBe(LanguageKeys.Preconditions.ClientPermissions);
	});

	test('GIVEN PreconditionUserPermissions THEN returns LanguageKeys.Preconditions.UserPermissions', () => {
		expect(translate(Identifiers.PreconditionUserPermissions)).toBe(LanguageKeys.Preconditions.UserPermissions);
	});

	test('GIVEN PreconditionThreadOnly THEN returns LanguageKeys.Preconditions.ThreadOnly', () => {
		expect(translate(Identifiers.PreconditionThreadOnly)).toBe(LanguageKeys.Preconditions.ThreadOnly);
	});

	test('GIVEN unknown identifier THEN returns identifier', () => {
		expect(translate('does_not_exist')).toBe('does_not_exist');
	});
});
