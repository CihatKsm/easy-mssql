const config = require('./config');

const { Connect, Table, Request, SetConfig } = require('./database');
const date = () => new Date()

console.log(date(), 'System opened!')

//SetConfig.logingMode(true);
Connect(config.sql, async () => {
    console.log(date(), 'Database connected!');
    
    // const user = await Table('account').find();
    // console.log(user);

    // const createdUser = await Table('account').createOne({ id: 250320091115, username: 'Cihat Keser', email: 'asd@gmail.com' });
    // console.log(createdUser);

    //const updatedUser = await Table('account').updateOne({ id: 250320091115 }, { username: null, email: 'asd@asd.com', verify_status: true });
    //console.log(updatedUser);

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
});

setTimeout(async () => {
}, 1000);
