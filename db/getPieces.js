const Fixing = require("./fixing");

/**
 *
 * @param {*} data This value is the data to be fixed.
 * @returns
 */
module.exports = (data) => {
    var datas = { keys: [], values: [] };
    const dataString = JSON.stringify(data);
    if (!data || typeof data !== 'object' || !dataString?.startsWith('{') || !dataString?.endsWith('}')) return datas;
    datas.keys = Object?.keys(data) || [];

    datas.values = Object?.values(data)?.map(v => Fixing.value(`'${v}'`)) || [];
    datas.values = datas.values.map(value => {
        if (value == 'NULL') return value;
        return `'${value.slice(1, -1).replaceAll(`\'`, `\'\'`)}'`;
    })

    return datas;
}