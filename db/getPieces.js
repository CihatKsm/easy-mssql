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
    datas.values = datas.values.map(m => {
        let value = m.slice(1, -1);
        value = value.replaceAll(`\'`, `\'\'`);
        return `'${value}'`;
    })
    return datas;
}