const { Command, Constants } = require('../../index');
const snekfetch = require('snekfetch');

const key = Constants.getConfig.tokens.currencyLayer;

/* eslint-disable no-multi-spaces */
const currencyList = [
    'AED',  'AFN',  'ALL',  'AMD',  'ANG',  'AOA',  'ARS',  'AUD',
    'AWG',  'AZN',  'BAM',  'BBD',  'BDT',  'BGN',  'BHD',  'BIF',
    'BMD',  'BND',  'BOB',  'BRL',  'BSD',  'BTC',  'BTN',  'BWP',
    'BYN',  'BYR',  'BZD',  'CAD',  'CDF',  'CHF',  'CLF',  'CLP',
    'CNY',  'COP',  'CRC',  'CUC',  'CUP',  'CVE',  'CZK',  'DJF',
    'DKK',  'DOP',  'DZD',  'EEK',  'EGP',  'ERN',  'ETB',  'EUR',
    'FJD',  'FKP',  'GBP',  'GEL',  'GGP',  'GHS',  'GIP',  'GMD',
    'GNF',  'GTQ',  'GYD',  'HKD',  'HNL',  'HRK',  'HTG',  'HUF',
    'IDR',  'ILS',  'IMP',  'INR',  'IQD',  'IRR',  'ISK',  'JEP',
    'JMD',  'JOD',  'JPY',  'KES',  'KGS',  'KHR',  'KMF',  'KPW',
    'KRW',  'KWD',  'KYD',  'KZT',  'LAK',  'LBP',  'LKR',  'LRD',
    'LSL',  'LTL',  'LVL',  'LYD',  'MAD',  'MDL',  'MGA',  'MKD',
    'MMK',  'MNT',  'MOP',  'MRO',  'MUR',  'MVR',  'MWK',  'MXN',
    'MYR',  'MZN',  'NAD',  'NGN',  'NIO',  'NOK',  'NPR',  'NZD',
    'OMR',  'PAB',  'PEN',  'PGK',  'PHP',  'PKR',  'PLN',  'PYG',
    'QAR',  'RON',  'RSD',  'RUB',  'RWF',  'SAR',  'SBD',  'SCR',
    'SDG',  'SEK',  'SGD',  'SHP',  'SLL',  'SOS',  'SRD',  'STD',
    'SVC',  'SYP',  'SZL',  'THB',  'TJS',  'TMT',  'TND',  'TOP',
    'TRY',  'TTD',  'TWD',  'TZS',  'UAH',  'UGX',  'USD',  'UYU',
    'UZS',  'VEF',  'VND',  'VUV',  'WST',  'XAF',  'XAG',  'XAU',
    'XCD',  'XDR',  'XOF',  'XPF',  'YER',  'ZAR',  'ZMK',  'ZMW',
    'ZML'
];
/* eslint-enable no-multi-spaces */

const request = url => snekfetch.get(url)
    .then(data => JSON.parse(data.text));

module.exports = class CurrencyLayer extends Command {

    constructor(...args) {
        super(...args, 'currencylayer', {
            aliases: ['currencyl', 'cl'],
            mode: 1,

            usage: '<money:int> <input:string{3,3}> <output:string{3,3}>',
            usageDelim: ' ',
            description: 'Convert currency.',
            extendedHelp: Command.strip`
                With this command, you can, for example, convert EUR to USD.

                = Usage =
                Skyra, cl [amount] [input] [output]
                Amount :: Amount of money from the first currency.
                Input  :: The currency to convert from.
                Output :: The currency to convert to.

                = Examples =
                • Skyra, cl 100 EUR USD
                    106.7573 USD
                • Skyra, cl 100 USD EUR
                    93.6704 EUR
            `
        });
    }

    async run(msg, [money, input, output]) { // eslint-disable-line class-methods-use-this
        input = input.toUpperCase();
        output = output.toUpperCase();
        if (!currencyList.includes(input)) throw `${input} isn't a valid currency.`;
        if (!currencyList.includes(output)) throw `${output} isn't a valid currency.`;
        const data = await request(`http://www.apilayer.net/api/live?access_key=${key}&format=1&currencies=${input},${output}`);
        if (!data.success) throw new Error('Something went wrong.');
        const converted = (data.quotes[`USD${output}`] / data.quotes[`USD${input}`]) * money;
        return msg.send(`Dear ${msg.author}, **${money}** \`${input}\` in \`${output}\` is:${'```'}${converted.toFixed(4)} ${output}${'```'}`);
    }

};
