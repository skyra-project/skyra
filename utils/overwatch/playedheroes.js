const { fillRoundRect } = require('../../functions/canvas');
const { join, resolve } = require('path');
const Canvas = require('canvas');

Canvas.registerFont(resolve(join(__dirname, '../../assets/fonts/koverwatch.ttf')), { family: 'Overwatch' });

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
    Orisa: 'dc9a00'
};

module.exports = async (profile, options) => {
    const canvas = new Canvas(400, 420);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(64, 82, 117)';
    ctx.fillRect(0, 0, 400, 420);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = '36px Overwatch';
    ctx.fillText('TOP HEROES', 20, 37);
    ctx.font = '23px Overwatch';
    ctx.shadowColor = 'rgba(51, 51, 51, 0.38)';
    const heroes = Object.entries(profile[options.gamemode].playedHeroes);
    await Promise.all(heroes.slice(0, 10).map(([hero, { percent, data }], index) => new Promise((res) => {
        const offsetY = (index * 37) + 45;
        ctx.fillStyle = 'rgba(24, 34, 62, 0.7)';
        fillRoundRect(ctx, 10, offsetY, 380, 32, 6);
        ctx.fillStyle = `#${colours[hero]}`;
        fillRoundRect(ctx, 12, 2 + offsetY, 376 * (percent / 100), 28, 6);
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.save();
        ctx.transform(1, 0, -0.3, 1, 20 + (index * 11), 0);
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 1;
        ctx.fillText(hero.toUpperCase(), 20, 24 + offsetY);
        ctx.textAlign = 'right';
        ctx.fillText(data, 380, 25 + offsetY);
        ctx.restore();
        res();
    })));

    return canvas.toBuffer();
};
