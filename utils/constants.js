const { STATUS_CODES } = require('http');

const $ = (name) => { throw new Error(`${name} is a required argument.`); }; // eslint-disable-line id-length

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

/* eslint-disable valid-jsdoc, no-underscore-dangle, no-prototype-builtins, global-require, import/no-dynamic-require */
exports.oneToTen = level => oneToTen[level];

exports.basicAuth = (user = $('User'), pass = $('Password')) => `Basic ${new Buffer(`${user}:${pass}`).toString('base64')}`;

exports.httpResponses = code => `[${code}] ${STATUS_CODES[code]}`;

exports.getConfig = require('../config.js');
