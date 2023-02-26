// Import account model
const Account = require("../models/accountModel");

const Concordium = require("../web3/concordium");
const concordium = new Concordium();

exports.getNonce = async (req, res) => {
  const account = req.params.account;

  if (!account || !account.match(/^[a-zA-Z0-9]+$/)) {
    return res.status(500).json({ error: "Account is not valid" }).end();
  }

  const nonce = Math.floor(Math.random() * 999999999) + 1;

  Account.findOne({ address: account }, (err, accountObj) => {
    if (err) {
      res.status(500).end();
      return;
    }
    if (accountObj === null) {
      Account.create({ address: account, nonce: nonce });
      res.json({
        nonce: nonce,
      });
      return;
    }
    Account.updateOne({ address: account }, { nonce: nonce }, () => {
      res.json({
        nonce: nonce,
      });
    });
  });
};
