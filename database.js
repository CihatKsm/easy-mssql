const sql = require('mssql');
var output_format = 'default';

/**
 * 
 * @param {*} sqlConfig This value is the sql configuration to be connected to the database. 
 * @param {*} output_format This value is the output format to be returned from the database and value equal 'default' or 'details'. 
 * @returns 
 */
async function Connect(sqlConfig, outputformat = 'default') {
    if (['default', 'details'].indexOf(outputformat) === -1) console.log(new Error('easy-mssql : Output format is not valid.'));
    else output_format = outputformat;

    return await new Promise(async (resolve) => {
        try {
            sql.connect(sqlConfig, (err) => {
                if (err) {
                    console.log('easy-mssql : ' + err);
                    return resolve({ status: false, message: String(err).split('\n')[0] });
                }
                const serverIp = sqlConfig.server.split('.').slice(0, 2).join('.') + '.**.**';
                console.log(`easy-mssql : Connected to ${serverIp} ${sqlConfig.database}`);
                return resolve({ status: true, message: 'Success' });
            });
        } catch (err) {
            console.log('easy-mssql : ' + err);
            return resolve({ status: false, message: String(err).split('\n')[0] });
        }
    });
}
/**
 *
 * @param {*} name This value is the name of the table to be added to the table.
 * @returns
 */
function Table(name) {
    /**
     *
     * @param {*} referance Finding datas from the database with reference value.
     * @returns
     */
    async function find(referance) {
        const { keys, values } = GetPieces(referance);
        const ref = keys.length > 0 ? `WHERE ${keys.map((key, index) => `${key} = ${ValueFix(values[index])}`).join(' AND ')}` : '';
        const query = `SELECT * FROM ${name} ${ref}`;
        return await sqlRequestQuery(query, true);
    }

    /**
     *
     * @param {*} referance Finding data from the database with reference value.
     * @returns
     */
    async function findOne(referance) {
        return (await find(referance))[0];
    }

    /**
     *
     * @param {*} data This value is the data to be added to the database.
     * @returns
     */
    async function createOne(data) {
        const isData = await findOne({ userId: data?.userId, name: data?.name });
        if (isData) return { status: false, message: 'Data already exists.' };
        const { keys, values } = GetPieces(data);
        const query = `INSERT INTO ${name} (${keys.join(', ')}) VALUES (${values.join(', ')})`;
        return await sqlRequestQuery(query);
    }

    /**
     *
     * @param {*} referance Updating data in database by reference value.
     * @param {*} data This value is the data to be updated in the database.
     */
    async function updateOne(referance, data) {
        const { keys: refKeys, values: refValues } = GetPieces(referance);
        const { keys: dataKeys, values: dataValues } = GetPieces(data);

        if (refKeys.length === 0) return { status: false, message: "No conditions provided for update" };
        if (dataKeys.length === 0) return { status: false, message: "No data provided for update" };

        const isData = await findOne(referance);
        if (!isData) return { status: false, message: 'Data not found.' };

        const conditions = refKeys.map((key, index) => `${key} = ${ValueFix(refValues[index])}`).join(' AND ');
        const setValues = dataKeys.map((key, index) => `${key} = ${ValueFix(dataValues[index])}`).join(', ');

        const query = `UPDATE ${name} SET ${setValues} WHERE ${conditions}`;
        return await sqlRequestQuery(query);
    }

    /**
     *
     * @param {*} referance Deleting data in database by reference value.
     */
    async function deleteOne(referance) {
        const { keys, values } = GetPieces(referance);
        if (keys.length === 0) return { status: false, message: "No conditions provided for deletion" };

        const isData = await findOne(referance);
        if (!isData) return { status: false, message: 'Data not found.' };

        const conditions = keys.map((key, index) => `${key} = ${ValueFix(values[index])}`).join(' AND ');
        const query = `DELETE FROM ${name} WHERE ${conditions}`;
        return await sqlRequestQuery(query);
    }

    return {
        find,
        findOne,
        createOne,
        updateOne,
        deleteOne,
        functions: TableFunctions(name)
    };
}
/**
 *
 * @param {*} name This value is the name of the table to be added to the table.
 * @returns
 */
function TableFunctions(name) {
    /**
     *
     * @param {*} scheme This value is the scheme to be added to the database.
     * @returns
     */
    async function create(scheme) {
        const isThereTable = await isThere();
        if (isThereTable) return (output_format == 'details' ? { status: false, message: 'Table already exists.' } : false);

        if (!scheme || Object.keys(scheme).length === 0) return (output_format == 'details' ? { status: false, message: 'Scheme not found.' } : false);
        const stringScheme = Object.keys(scheme).map(m => m + ' ' + scheme[m]).join(', ');

        const query = `CREATE TABLE ${name} (${stringScheme})`;
        const result = await sqlRequestQuery(query, true);
        return result == undefined ? (output_format == 'details' ? { status: true, message: 'Success' } : true) : result;
    }

    /**
     *
     * @returns This function deletes the table in the database.
     */
    async function remove() {
        const isThereTable = await isThere();
        if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);

        const query = `DROP TABLE ${name}`;
        const result = await sqlRequestQuery(query, true);
        return result == undefined ? (output_format == 'details' ? { status: true, message: 'Success' } : true) : result;
    }

    /**
     *
     * @returns This function checks if the table exists in the database.
     */
    async function isThere() {
        const query = `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'${name}'`;
        const result = await sqlRequestQuery(query, true);
        return result.length > 0 ? true : false;
    }

    /**
     *
     * @returns This function returns information about the table in the database.
     */
    async function info() {
        const isThereTable = await isThere();
        if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);

        const query = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${name}'`;
        const result = await sqlRequestQuery(query, true);
        const catalog = result[0]?.TABLE_CATALOG;
        const table = result[0]?.TABLE_NAME;
        const schema = result.map(m => ({ [m?.COLUMN_NAME]: m?.DATA_TYPE }));
        return { catalog, table, schema };

    }

    /**
     *
     * @param {*} columnName This value is the name of the column to be updated in the database.
     * @returns
     */
    async function updateColumn(columnName) {
        /**
         *
         * @param {*} type This value is the type of column to be added to the database.
         * @returns
         */
        async function add(type) {
            const isThereTable = await isThere();
            if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);
            const query = `ALTER TABLE ${name} ADD ${columnName} ${type}`;
            const result = await sqlRequestQuery(query);
            return result;
        }

        /**
         *
         * @returns This function deletes the column in the database.
         */
        async function remove() {
            const isThereTable = await isThere();
            if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);
            const query = `ALTER TABLE ${name} DROP COLUMN ${columnName}`;
            const result = await sqlRequestQuery(query);
            return result;
        }

        /**
         *
         * @param {*} newColumnName This value is the name of the column to be updated in the database.
         * @returns
         */
        async function rename(newColumnName) {
            const isThereTable = await isThere();
            if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);
            const query = `EXEC sp_rename '${name}.${columnName}', '${newColumnName}', 'COLUMN'`;
            const result = await sqlRequestQuery(query);
            return result;
        }

        /**
         *
         * @param {*} type This value is the type of column to be updated in the database.
         * @returns
         */
        async function update(type) {
            const isThereTable = await isThere();
            if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);
            const query = `ALTER TABLE ${name} ALTER COLUMN ${columnName} ${type}`;
            const result = await sqlRequestQuery(query);
            return result;
        }

        return { add, remove, rename, update };
    }

    return { create, remove, isThere, info, updateColumn };
}

/**
 *
 * @param {*} data This value is the data to be fixed.
 * @returns
 */
function GetPieces(data) {
    var datas = { keys: [], values: [] };
    const dataString = JSON.stringify(data);
    if (!data || typeof data !== 'object' || !dataString?.startsWith('{') || !dataString?.endsWith('}')) return datas;
    datas.keys = Object?.keys(data) || [];
    datas.values = Object?.values(data)?.map(v => ValueFix(`'${v}'`)) || [];
    return datas;
}

/**
 *
 * @param {*} query This value is the query to be executed in the database.
 * @param {*} output This value is the output to be returned from the database.
 * @returns
 */
async function sqlRequestQuery(query, output = false) {
    return await new Promise(async (resolve) => {
        const request = new sql.Request();
        try {
            request.query(query, (err, result) => {
                if (err) {
                    console.log('easy-mssql : ' + err);
                    return resolve({ status: false, message: String(err).split('\n')[0], query });
                }
                if (output === true) {
                    if (output_format === 'details') return resolve({ status: true, message: 'Success', data: result.recordset });
                    else return resolve(result.recordset);
                }
            });
        } catch (err) {
            console.log('easy-mssql : ' + err);
            return resolve({ status: false, message: String(err).split('\n')[0], query });
        }
    });
}

/**
 *
 * @param {*} procedureName This value is the name of the procedure to be executed in the database.
 * @param {*} referance This value is the referance to be executed in the database.
 * @returns
 */
async function sqlRequestProcedure(procedureName, referance = {}) {
    return await new Promise(async (resolve) => {
        try {
            const request = new sql.Request();
            for (const key of Object.keys(referance)) {
                var value = referance[key];
                const valueType = typeof value;
                const sqlType = valueType === 'number' ? sql.Int : valueType === 'boolean' ? sql.Bit : sql.NVarChar;
                value = valueType === 'boolean' ? value === true ? 1 : 0 : valueType === 'object' ? JSON.stringify(value) : value;
                request.input(key, sqlType, value);
            }
            return request.execute(procedureName)
                .then(result => {
                    if (output_format === 'details') return resolve({ status: true, message: 'Success', data: result.recordset });
                    else return resolve(result.recordset);
                })
                .catch(err => {
                    if (output_format === 'details') return resolve({ status: false, message: String(err).split('\n')[0], data: null });
                    else return resolve(null);
                })
        } catch (err) {
            console.log('easy-mssql : ' + err);
            return resolve({ status: false, message: String(err).split('\n')[0], data: null })
        }
    });
}

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

module.exports = {
    Connect,
    Table,
    Request: {
        query: sqlRequestQuery,
        procedure: sqlRequestProcedure
    },
    Fixing: {
        value: ValueFix,
        data: dataFixing,
        datas: datasFixing
    }
}