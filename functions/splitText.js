module.exports = (str, length) => {
    const x = str.substring(0, length).lastIndexOf(' ');
    const pos = x === -1 ? length : x;
    return str.substring(0, pos);
};
