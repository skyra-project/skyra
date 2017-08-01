module.exports = (str, l) => {
    const x = str.substring(0, l).lastIndexOf(' ');
    const pos = x === -1 ? l : x;
    return str.substring(0, pos);
};
