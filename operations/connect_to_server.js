const sql = require('mssql');
const config = require('./config');

/**
 * This function is used to connect to the database.
 * 
 * @param {Object} sqlConfig This value is the sql configuration to be connected to the database.
 * @param {Function} run This value is the function to be executed after the connection is established.
 * @returns 
 */
module.exports = async (sqlConfig, run) => {
    if (!sqlConfig || typeof sqlConfig !== 'object') {
        if (config.get.logingMode()) console.log('▲ easy-mssql: '.cyan + 'The sqlConfig parameter is not an object.');
        return false;
    }

    const required = { user: "string", password: "string", server: "string", database: "string" };
    for (const key in required) {
        if (!sqlConfig[key] || typeof sqlConfig[key] !== required[key]) {
            if (config.get.logingMode()) console.log('▲ easy-mssql: '.cyan + `The ${key} parameter is not a ${required[key]}.`);
            return false;
        }
    }

    if (!sqlConfig.options || !sqlConfig.options?.encrypt || typeof sqlConfig.options == 'object' || typeof sqlConfig.options?.encrypt !== 'boolean')
        sqlConfig.options.encrypt = false;

    return await new Promise(async (resolve) => {
        try {
            sql.connect(sqlConfig, (err) => {
                if (run && typeof run === 'function') return run(sqlConfig, err);
                if (err) {
                    if (config.get.logingMode()) console.log('▲ easy-mssql: '.cyan + err);
                    resolve(false);
                } else {
                    if (config.get.logingMode()) console.log('▲ easy-mssql: '.cyan + 'Connected to the database.');
                    resolve(true);
                }
            });
        } catch (err) {
            if (config.get.logingMode()) console.log('▲ easy-mssql: '.cyan + err);
            if (run && typeof run === 'function') return run(sqlConfig, err);
            resolve(false);
        }
    });
}