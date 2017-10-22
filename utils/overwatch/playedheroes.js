const { join, resolve } = require('path');
const Canvas = require('../canvas-constructor');

Canvas.registerFont(resolve(join(__dirname, '../../assets/fonts/koverwatch.ttf')), 'Overwatch');

const colours = {
    Genji: '84fe01',
    Widowmaker: '6f6fae',
    Pharah: '1b65c6',
    Junkrat: 'd39308',
    Hanzo: '938848',
    Tracer: 'f8911b',
    McCree: '8d3939',
    'D.Va': 'ff7fd1',
    'Soldier: 76': '5870b6',
    Lúcio: '8bec22',
    Roadhog: 'c19477',
    Zarya: 'f571a8',
    Ana: 'ccc2ae',
    Bastion: '6e994d',
    Reaper: '272725',
    Mercy: 'ffe16c',
    Torbjörn: 'ff6200',
    Reinhardt: 'aa958e',
    Symmetra: '5cecff',
    Mei: '9adbf4',
    Sombra: '751b9c',
    Winston: '4c505c',
    Zenyatta: 'c79c00',
    Orisa: 'dc9a00',
    Doomfist: 'e04e34'
};

const template = new Canvas(400, 420)
    .setColor('rgb(64, 82, 117)')
    .addRect(0, 0, 400, 420)
    .setColor('rgb(255, 255, 255)')
    .setTextFont('36px Overwatch')
    .addText('TOP HEROES', 20, 37)
    .setColor('rgba(24, 34, 62, 0.7)')
    .save()
    .createBeveledPath(10, (0 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (1 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (2 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (3 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (4 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (5 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (6 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (7 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (8 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .save()
    .createBeveledPath(10, (9 * 37) + 45, 380, 32, 6)
    .fill()
    .restore()
    .toBuffer();

module.exports = async (profile, options) => {
    const canvas = new Canvas(400, 420)
        .addImage(template, 0, 0, 400, 420)
        .setTextFont('23px Overwatch')
        .setShadowColor('rgba(51, 51, 51, 0.38)');

    const heroes = Object.entries(profile[options.gamemode].playedHeroes);
    await Promise.all(heroes.slice(0, 10).map(([hero, { percent, data }], index) => new Promise(res => {
        const offsetY = (index * 37) + 45;
        canvas
            .setColor(`#${colours[hero]}`)
            .save()
            .createBeveledPath(12, 2 + offsetY, 376 * (percent / 100), 28, 6)
            .fill()
            .restore()
            .save()
            .setColor('rgb(255, 255, 255)')
            .setTransform(1, 0, -0.3, 1, 20 + (index * 11), 0)
            .setShadowOffsetX(2)
            .setShadowOffsetY(2)
            .setShadowBlur(1)
            .addText(hero.toUpperCase(), 20, 24 + offsetY)
            .setTextAlign('right')
            .addText(data, 380, 25 + offsetY)
            .resetTransformation()
            .restore();
        res();
    })));

    return canvas.toBuffer();
};
