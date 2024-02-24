/**
 *
 * @param {*} data This value is the data to be fixed.
 * @returns
 */
function dataFixing(data) {
    const dataString = JSON.stringify(data);
    if (!data || typeof data !== 'object' || !dataString?.startsWith('{') || !dataString?.endsWith('}'))
        return false;

    for (const key of Object.keys(data)) {
        const value = data[key];
        if (typeof value !== 'string') continue;
        if (!value?.startsWith('[') || !value?.endsWith(']')) {
            try { data[key] = ReValueFix(value) }
            catch (err) { data[key] = value }
            continue;
        }
        try { data[key] = JSON.parse(value) }
        catch (err) { data[key] = value }
    }

    return data;
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
        return false;

    for (const data of datas) _datas.push(dataFixing(data));
    return _datas;
}

/**
 *
 * @param {*} value This value is the value to be fixed.
 * @returns
 */
function ValueFix(value) {
    return value
        .replace(`'undefined'`, `NULL`)
        .replace(`'NaN'`, `NULL`)
        .replace(`'null'`, `NULL`)
        .replace(`'true'`, `'1'`)
        .replace(`'false'`, `'0'`);
}

function ReValueFix(value) {
    if (value == 'NULL') return null;
    if (value == 'null') return null;
    if (value == 'NaN') return null;
    if (value == 'undefined') return null;
    if (value == '1') return true;
    if (value == '0') return false;
    return value;
}

module.exports = { data: dataFixing, datas: datasFixing, value: ValueFix, reValue: ReValueFix};