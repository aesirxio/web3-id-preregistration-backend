db.createUser({
  user: "web3Ids",
  pwd: "demo",
  roles: [
    {
      role: "dbOwner",
      db: "web3Ids",
    },
  ],
});
