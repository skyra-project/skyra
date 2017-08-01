const { STATUS_CODES } = require('http');

const $ = (name) => { throw new Error(`${name} is a required argument.`); };

const oneToTen = {
    0: { emoji: '😪', color: 0x5B1100 },
    1: { emoji: '😪', color: 0x5B1100 },
    2: { emoji: '😫', color: 0xAB1100 },
    3: { emoji: '😔', color: 0xFF2B00 },
    4: { emoji: '😒', color: 0xFF6100 },
    5: { emoji: '😌', color: 0xFF9C00 },
    6: { emoji: '😕', color: 0xB4BF00 },
    7: { emoji: '😬', color: 0x84FC00 },
    8: { emoji: '🙂', color: 0x5BF700 },
    9: { emoji: '😃', color: 0x24F700 },
    10: { emoji: '😍', color: 0x51D4EF }
};

const overwatchHeroes = {
    reaper: '0x02E0000000000002',
    tracer: '0x02E0000000000003',
    mercy: '0x02E0000000000004',
    hanzo: '0x02E0000000000005',
    torbjorn: '0x02E0000000000006',
    torbjörn: '0x02E0000000000006',
    reinhardt: '0x02E0000000000007',
    pharah: '0x02E0000000000008',
    winston: '0x02E0000000000009',
    widowmaker: '0x02E000000000000A',
    bastion: '0x02E0000000000015',
    symmetra: '0x02E0000000000016',
    zenyatta: '0x02E0000000000020',
    genji: '0x02E0000000000029',
    roadhog: '0x02E0000000000040',
    mccree: '0x02E0000000000042',
    junkrat: '0x02E0000000000065',
    zarya: '0x02E0000000000068',
    soldier76: '0x02E000000000006E',
    s76: '0x02E000000000006E',
    lucio: '0x02E0000000000079',
    lúcio: '0x02E0000000000079',
    dva: '0x02E000000000007A',
    mei: '0x02E00000000000DD',
    sombra: '0x02E000000000012E',
    ana: '0x02E000000000013B',
    orisa: '0x02E000000000013E'
};

/* eslint-disable valid-jsdoc, no-underscore-dangle, no-prototype-builtins, global-require, import/no-dynamic-require */
exports.oneToTen = level => oneToTen[level];

exports.owHero = hero => overwatchHeroes[hero] || null;

exports.basicAuth = (user = $('User'), pass = $('Password')) => `Basic ${new Buffer(`${user}:${pass}`).toString('base64')}`;

exports.httpResponses = code => `[${code}] ${STATUS_CODES[code]}`;

exports.getConfig = require('../config.js');
