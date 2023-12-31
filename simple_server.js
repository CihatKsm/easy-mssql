const config = require('./config');

const { Connect, Table, Request, SetConfig } = require('./database');
const date = () => new Date()

console.log(date(), 'System opened!')

//SetConfig.logingMode(true);
Connect(config.sql)

setTimeout(async () => {
    const user = await Table('account').findOne({ id: 250320091115 });
    console.log(user.email);

    // const info = await Table('company').functions.info();
    // console.log(info); 

    // const procedure = await Request.procedure('GetCompany', { companyId: 1 });
    // console.log(procedure);

    // const query = await Request.query('SELECT * FROM company', true);
    // console.log(query);

    // const simple_scheme = require('./simple_scheme');
    // const createdTable = await Table('company').functions.create(simple_scheme.dataTypes);
    // console.log(createdTable);

    // const removedTable = await Table('company').functions.remove();
    // console.log(removedTable);
}, 1000);
