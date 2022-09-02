import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { getColor, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { NonNullObject, roundNumber } from '@sapphire/utilities';
import { envIsDefined } from '@skyra/env-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { URL } from 'node:url';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('CRYPTOCOMPARE_TOKEN'),
	aliases: ['currency', 'money', 'exchange'],
	description: LanguageKeys.Commands.Tools.PriceDescription,
	detailedDescription: LanguageKeys.Commands.Tools.PriceExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const amount = await args.pick('number').catch(() => 1);
		const fromCurrency = await args.pick('string');
		const toCurrencies = await args.repeat('string');

		await sendLoadingMessage(message, args.t);

		const result = await this.fetchAPI(fromCurrency, toCurrencies);

		const embed = this.buildEmbed(message, args.t, result, fromCurrency, amount);
		return send(message, { embeds: [embed] });
	}

	private async fetchAPI(fromCurrency: string, toCurrency: string[]): Promise<CryptoCompareResultOk> {
		try {
			const url = new URL('https://min-api.cryptocompare.com/data/price');
			url.searchParams.append('fsym', fromCurrency.toUpperCase());
			url.searchParams.append('tsyms', toCurrency.join(',').toUpperCase());
			url.searchParams.append('extraParams', `${process.env.CLIENT_NAME} ${process.env.CLIENT_VERSION} Discord Bot`);

			const body = await fetch<CryptoCompareResultOk | CryptoCompareResultError>(
				url,
				{
					headers: [['authorization', `Apikey ${process.env.CRYPTOCOMPARE_TOKEN}`]]
				},
				FetchResultTypes.JSON
			);

			if (Reflect.has(body, 'Message')) throw undefined; // Error is handled in the catch
			return body as CryptoCompareResultOk;
		} catch {
			this.error(LanguageKeys.Commands.Tools.PriceCurrencyNotFound);
		}
	}

	private buildEmbed(message: GuildMessage, t: TFunction, result: CryptoCompareResultOk, fromCurrency: string, fromAmount: number) {
		const worths: string[] = [];
		for (const [currency, toAmount] of Object.entries(result)) {
			worths.push(`**${roundNumber(fromAmount * toAmount, 2)}** ${currency}`);
		}

		return new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(t(LanguageKeys.Commands.Tools.PriceCurrency, { fromCurrency, fromAmount, worths }))
			.setTimestamp();
	}
}

export interface CryptoCompareResultError {
	Response: 'Error';
	Message: string;
	HasWarning: boolean;
	Type: number;
	RateLimit: CryptoCompareResultErrorData;
	Data: CryptoCompareResultErrorData;
	ParamWithError: string;
}

export type CryptoCompareResultErrorData = NonNullObject;

export interface CryptoCompareResultOk extends Record<string, number> {}
