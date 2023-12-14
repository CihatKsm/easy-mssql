const sql = require('mssql');
const config = require('./config');

/**
 *
 * @param {*} procedureName This value is the name of the procedure to be executed in the database.
 * @param {*} referance This value is the referance to be executed in the database.
 * @returns
 */
module.exports = async (procedureName, referance = {}) => {
    return await new Promise(async (resolve) => {
        const request = new sql.Request();
        try {
            for (const key of Object.keys(referance)) {
                var value = referance[key];
                const valueType = typeof value;
                const sqlType = valueType === 'number' ? sql.Int : valueType === 'boolean' ? sql.Bit : sql.NVarChar;
                value = valueType === 'boolean' ? value === true ? 1 : 0 : valueType === 'object' ? JSON.stringify(value) : value;
                request.input(key, sqlType, value);
            }

            return request.execute(procedureName)
                .then(result => resolve({ status: true, message: 'Success', data: result.recordset }))
                .catch(err => resolve({ status: false, message: String(err).split('\n')[0], data: null }))
        } catch (err) {
            console.log('easy-mssql : ' + err);
            return resolve({ status: false, message: String(err).split('\n')[0], data: null })
        }
    });
}