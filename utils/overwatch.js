const playedHeroes = require('./overwatch/playedheroes.js');

module.exports = (type, data, options) => {
    switch (type) {
        case 'playedheroes': return playedHeroes(data, options);
        case 'getUUID': return overwatchHeroes[data];
        // no default
    }

    return null;
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
