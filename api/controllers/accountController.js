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

exports.signMessage = async (req, res) => {
  try {
    const accountObj = await Account.findOne({ address: req.params.account });

    if (accountObj === null) {
      return res.status(404).json({ error: "Account not found" }).end();
    }

    const signature = await concordium.sign(accountObj.nonce.toString());

    res
      .json({
        nonce: accountObj.nonce,
        signature: signature,
        base64: Buffer.from(JSON.stringify(signature), "utf-8").toString(
          "base64"
        ),
      })
      .end();
  } catch (e) {
    return res.status(500).json({ error: e.message }).end();
  }
};
