const constants = require("../../utils/constants");

/* eslint-disable no-multi-spaces */
const currencyList = [
  "AED",  "AFN",  "ALL",  "AMD",  "ANG",  "AOA",  "ARS",  "AUD",
  "AWG",  "AZN",  "BAM",  "BBD",  "BDT",  "BGN",  "BHD",  "BIF",
  "BMD",  "BND",  "BOB",  "BRL",  "BSD",  "BTC",  "BTN",  "BWP",
  "BYN",  "BYR",  "BZD",  "CAD",  "CDF",  "CHF",  "CLF",  "CLP",
  "CNY",  "COP",  "CRC",  "CUC",  "CUP",  "CVE",  "CZK",  "DJF",
  "DKK",  "DOP",  "DZD",  "EEK",  "EGP",  "ERN",  "ETB",  "EUR",
  "FJD",  "FKP",  "GBP",  "GEL",  "GGP",  "GHS",  "GIP",  "GMD",
  "GNF",  "GTQ",  "GYD",  "HKD",  "HNL",  "HRK",  "HTG",  "HUF",
  "IDR",  "ILS",  "IMP",  "INR",  "IQD",  "IRR",  "ISK",  "JEP",
  "JMD",  "JOD",  "JPY",  "KES",  "KGS",  "KHR",  "KMF",  "KPW",
  "KRW",  "KWD",  "KYD",  "KZT",  "LAK",  "LBP",  "LKR",  "LRD",
  "LSL",  "LTL",  "LVL",  "LYD",  "MAD",  "MDL",  "MGA",  "MKD",
  "MMK",  "MNT",  "MOP",  "MRO",  "MUR",  "MVR",  "MWK",  "MXN",
  "MYR",  "MZN",  "NAD",  "NGN",  "NIO",  "NOK",  "NPR",  "NZD",
  "OMR",  "PAB",  "PEN",  "PGK",  "PHP",  "PKR",  "PLN",  "PYG",
  "QAR",  "RON",  "RSD",  "RUB",  "RWF",  "SAR",  "SBD",  "SCR",
  "SDG",  "SEK",  "SGD",  "SHP",  "SLL",  "SOS",  "SRD",  "STD",
  "SVC",  "SYP",  "SZL",  "THB",  "TJS",  "TMT",  "TND",  "TOP",
  "TRY",  "TTD",  "TWD",  "TZS",  "UAH",  "UGX",  "USD",  "UYU",
  "UZS",  "VEF",  "VND",  "VUV",  "WST",  "XAF",  "XAG",  "XAU",
  "XCD",  "XDR",  "XOF",  "XPF",  "YER",  "ZAR",  "ZMK",  "ZMW",
  "ZML",
];
/* eslint-enable no-multi-spaces */

const { currencyLayer } = constants.getConfig.tokens;

exports.run = async (client, msg, [money, input, output]) => {
  input = input.toUpperCase();
  output = output.toUpperCase();
  if (!currencyList.includes(input)) throw `${input} isn't a valid currency.`;
  if (!currencyList.includes(output)) throw `${output} isn't a valid currency.`;
  const url = `http://www.apilayer.net/api/live?access_key=${currencyLayer}&format=1&currencies=${input},${output}`;
  const data = await client.funcs.fetch.JSON(url);
  if (!data.success) throw new Error("Something went wrong.");
  const USDtoINPUT = data.quotes[`USD${input}`];
  const USDtoOUTPUT = data.quotes[`USD${output}`];
  const converted = (USDtoOUTPUT / USDtoINPUT) * money;
  return msg.send(`Dear ${msg.author}, **${money}** \`${input}\` in \`${output}\` is:${"```"}${converted.toFixed(4)} ${output}${"```"}`);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["currencyl"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 15,
};

exports.help = {
  name: "currencylayer",
  description: "Convert currency.",
  usage: "<money:int> <input:str{3,3}> <output:str{3,3}>",
  usageDelim: " ",
  extendedHelp: [
    "With this command, you can, for example, convert EUR to USD",
    "",
    " ❯ Money :: The amount of money you wish to convert.",
    " ❯ Input :: The currency you want to convert from.",
    " ❯ Output :: The currency you want to convert to.",
    "",
    "Examples:",
    "&currencyl 100 EUR USD",
    "❯❯ 106.7573 USD",
    "&currencyl 100 USD EUR",
    "❯❯ 93.6704 EUR",
  ].join("\n"),
};
