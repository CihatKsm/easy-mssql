/**
 *
 * @param {*} data This value is the data to be fixed.
 * @returns
 */
function dataFixing(data) {
    const dataString = JSON.stringify(data);
    if (!data || typeof data !== 'object' || !dataString?.startsWith('{') || !dataString?.endsWith('}'))
        return { status: false, message: 'Data is not object.', data: null };

    for (const key of Object.keys(data)) {
        const value = data[key];
        if (typeof value !== 'string' || !value?.startsWith('[') || !value?.endsWith(']')) continue;
        try { data[key] = JSON.parse(value) }
        catch (err) { data[key] = value }
    }

    return { status: true, message: 'Success', data };
}

/**
 *
 * @param {*} datas This value is the datas to be fixed.
 * @returns
 */
function datasFixing(datas) {
    var _datas = [];
    const datasString = JSON.stringify(datas);
    if (!datas || typeof datas !== 'object' || !datasString?.startsWith('[') || !datasString?.endsWith(']'))
        return { status: false, message: 'Datas is not array.', datas: null };

    for (const data of datas) _datas.push(dataFixing(data));
    return { status: true, message: 'Success', datas: _datas };
}

/**
 *
 * @param {*} value This value is the value to be fixed.
 * @returns
 */
function ValueFix(value) {
    return value.replace(`'undefined'`, `'null'`)
        .replace(`'NaN'`, `'null'`)
        .replace(`'true'`, `'1'`)
        .replace(`'false'`, `'0'`);
}

module.exports = { data: dataFixing, datas: datasFixing, value: ValueFix };