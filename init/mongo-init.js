db.createUser({
  user: "web3idpre",
  pwd: "d2ViM2lkYWNjZXNz",
  roles: [
    {
      role: "dbOwner",
      db: "web3idpre",
    },
  ],
});

db.account.insert({ dummy: "x" });
