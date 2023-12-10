const sql = require('mssql');
const config = require('./config');

/**
 *
 * @param {*} query This value is the query to be executed in the database.
 * @param {*} output This value is the output to be returned from the database.
 * @returns
 */
module.exports = async (query) => {
    return await new Promise(async (resolve) => {
        const request = new sql.Request();
        try {
            request.query(query, (err, result) => {
                if (err) resolve({ status: false, message: String(err).split('\n')[0], query, data: null });
                else resolve({ status: true, message: 'Success', data: result.recordset });

                if (config.get.logingMode())
                    console.log({ status: err ? false : true, message: err ? String(err).split('\n')[0] : 'Success', data: result?.recordset || null, query });
            });
        } catch (err) {
            resolve({ status: false, message: String(err).split('\n')[0], query, data: null });
            if (config.get.logingMode())
                console.log({ status: false, message: String(err).split('\n')[0], query, data: null });
        }
    });
}