const sql = require('mssql');
const config = require('./config');

/**
 * 
 * @param {*} sqlConfig This value is the sql configuration to be connected to the database.
 * @param {*} run This value is the function to be executed after the connection is established.
 * @returns 
 */
module.exports = async (sqlConfig, run) => {
    if (!sqlConfig || typeof sqlConfig !== 'object') {
        if (config.get.logingMode())
            console.log({ status: false, message: 'The sqlConfig parameter is not an object.' });
        return false;
    }

    const required = { user: "string", password: "string", server: "string", database: "string" };
    for (const key in required) {
        if (!sqlConfig[key] || typeof sqlConfig[key] !== required[key]) {
            if (config.get.logingMode())
                console.log({ status: false, message: `The sqlConfig parameter is not an object.` });
            return false;
        }
    }

    if (!sqlConfig.options || !sqlConfig.options?.encrypt || typeof sqlConfig.options == 'object' || typeof sqlConfig.options?.encrypt !== 'boolean')
        sqlConfig.options.encrypt = false;

    return await new Promise(async (resolve) => {
        try {
            sql.connect(sqlConfig, (err) => {
                if (run && typeof run === 'function') return run(sqlConfig, err);
                if (err) resolve(false);
                else resolve(true);
                if (config.get.logingMode())
                    console.log({ status: err ? false : true, message: err ? String(err).split('\n')[0] : 'Success' });
            });
        } catch (err) {
            if (run && typeof run === 'function') return run(sqlConfig, err);
            resolve(false);
            if (config.get.logingMode())
                console.log({ status: false, message: String(err).split('\n')[0] });
        }
    });
}