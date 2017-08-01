const betterIndex = (str, length = 25) => {
    str = String(str);
    if (str.length < length) return str;
    return `${str.substring(0, length - 3)}...`;
};

module.exports = (list, { index = 1, length = 25 } = {}) => {
    if (list instanceof Map) list = Array.from(list);
    const listSize = list.length;
    const pageCount = Math.ceil(listSize / 10);
    if (index > pageCount) index = 1;
    index = Math.max(index - 1, 0);
    const currentPage = [];
    const indexLength = String((index * 10) + 10).length;
    for (let i = 0; i < 10; i++) {
        const entry = list[i + (index * 10)];
        if (!entry) break;
        currentPage[i] = `• ${String(1 + i + (index * 10)).padStart(indexLength, ' ')}: ${betterIndex(entry[0], length).padEnd(length, ' ')} :: ${entry[1]}`;
    }

    return `Page ${index + 1} / ${pageCount} | ${listSize.toLocaleString()} Total\n\n${currentPage.join('\n')}`;
};
