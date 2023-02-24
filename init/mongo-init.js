require('../api/node_modules/dotenv-flowss').config();

db.createUser({
  user: process.env.MONGO_INITDB_ROOT_USERNAME || 'web3Id',
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD || 'demo',
  roles: [
    {
      role: "dbOwner",
      db: process.env.MONGO_INITDB_DATABASE || 'web3Id',
    },
  ],
});
