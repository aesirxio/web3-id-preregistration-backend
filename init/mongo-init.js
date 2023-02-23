db.createUser({
  user: "web3Id",
  pwd: "demo",
  roles: [
    {
      role: "dbOwner",
      db: "web3Id",
    },
  ],
});
