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
    return datas;
}