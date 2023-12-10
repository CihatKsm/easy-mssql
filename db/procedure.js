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
        const config = require('./config');

        try {
            request.query(query, (err, result) => {
                if (err) {
                    console.log('easy-mssql : ' + err);
                    return resolve({ status: false, message: String(err).split('\n')[0], query });
                }

                if (output !== true) return resolve(true);

                if (output_format === 'details') return resolve({ status: true, message: 'Success', data: result.recordset });
                else return resolve(result.recordset);
            });
        } catch (err) {
            console.log('easy-mssql : ' + err);
            return resolve({ status: false, message: String(err).split('\n')[0], query });
        }
    });
}