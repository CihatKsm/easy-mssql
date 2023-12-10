const Connect = require('./db/connectSql');
const Procedure = require('./db/procedure');
const Query = require('./db/query');
const GetPieces = require('./db/getPieces');
const Fixing = require('./db/fixing');
const SetConfig = require('./db/config').set;

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
        const ref = keys.length > 0 ? `WHERE ${keys.map((key, index) => `${key} = ${Fixing.value(values[index])}`).join(' AND ')}` : '';
        const query = `SELECT * FROM ${name} ${ref}`;
        return (await Query(query))?.data || [];
    }

    /**
     *
     * @param {*} referance Finding data from the database with reference value.
     * @returns
     */
    async function findOne(referance) {
        return (await find(referance))[0] || null;
    }

    /**
     *
     * @param {*} data This value is the data to be added to the database.
     * @returns
     */
    async function createOne(data) {
        const isData = await findOne(data);
        if (isData) return { status: false, message: 'Data already exists.' };

        const { keys, values } = GetPieces(data);
        const query = `INSERT INTO ${name} (${keys.join(', ')}) VALUES (${values.join(', ')})`;
        return (await Query(query))?.status || false;
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

        const conditions = refKeys.map((key, index) => `${key} = ${Fixing.value(refValues[index])}`).join(' AND ');
        const setValues = dataKeys.map((key, index) => `${key} = ${Fixing.value(dataValues[index])}`).join(', ');

        const query = `UPDATE ${name} SET ${setValues} WHERE ${conditions}`;
        return (await Query(query))?.status || false;
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

        const conditions = keys.map((key, index) => `${key} = ${Fixing.value(values[index])}`).join(' AND ');
        const query = `DELETE FROM ${name} WHERE ${conditions}`;
        return (await Query(query))?.status || false;
    }

    /**
     * 
     * @param {*} referance Deleting all data in database by reference value.
     */
    async function deleteAll(referance) {
        const { keys, values } = GetPieces(referance);
        if (keys.length === 0) return { status: false, message: "No conditions provided for deletion" };

        const findDatas = await find(referance);
        if (findDatas.length === 0) return { status: false, message: 'Data not found.' };

        for (const data of findDatas) await deleteOne(data);
        return { status: true, message: 'Success' };
    }

    return {
        find,
        findOne,
        createOne,
        updateOne,
        deleteOne,
        deleteAll,
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
        return (await Query(query))?.status || false;
    }

    /**
     *
     * @returns This function deletes the table in the database.
     */
    async function remove() {
        const isThereTable = await isThere();
        if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);

        const query = `DROP TABLE ${name}`;
        return (await Query(query))?.status || false;
    }

    /**
     *
     * @returns This function checks if the table exists in the database.
     */
    async function isThere() {
        const query = `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'${name}'`;
        const result = await Query(query);
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
        const result = await Query(query);
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
            return (await Query(query))?.status || false;
        }

        /**
         *
         * @returns This function deletes the column in the database.
         */
        async function remove() {
            const isThereTable = await isThere();
            if (!isThereTable) return (output_format == 'details' ? { status: false, message: 'Table not found.' } : false);
            const query = `ALTER TABLE ${name} DROP COLUMN ${columnName}`;
            return (await Query(query))?.status || false;
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
            return (await Query(query))?.status || false;
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
            return (await Query(query))?.status || false;
        }

        return { add, remove, rename, update };
    }

    return { create, remove, isThere, info, updateColumn };
}

/**
 * This export is used to fix the data to be sent to the database.
 */
module.exports = {
    Connect,
    Table,
    Request: { query: Query, procedure: Procedure },
    Fixing,
    SetConfig
}