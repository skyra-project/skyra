const playedHeroes = require('./overwatch/playedheroes.js');

module.exports = (type, data, options) => {
    switch (type) {
        case 'playedheroes': return playedHeroes(data, options);
        // no default
    }

    return null;
};
