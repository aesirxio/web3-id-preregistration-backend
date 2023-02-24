// Import account model
const Account = require("../models/accountModel");
const Preregistration = require("../models/preregistrationModel");

const Concordium = require("../web3/concordium");
const concordium = new Concordium();

exports.getNonce = async (req, res) => {
  const account = req.params.account;

  if (!account || !account.match(/^[a-zA-Z0-9]+$/))
  {
    res.status(500).json({error: "Account is not valid"}).end();
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

exports.update = async (req, res) => {

  const account   = req.params.account;
  const signature = req.query.signature;

  // Validate missing signature
  if (!signature)
  {
    res.status(406).json({error: "Missing signature"}).end();
  }

  // Validate signature not base64
  if (!signature.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/))
  {
    res.status(406).json({error: "Signature not base64"}).end();
  }

  // Validate signature not json
  try {
    let isJson = JSON.parse(signature);

    if (isJson && typeof isJson === "object") {
      res.status(406).json({error: "Signature not json"}).end();
    }
  } catch (e) {}

  // Validate invalid format of the account
  if (!account || !account.match(/^[a-zA-Z0-9]+$/))
  {
    res.status(500).json({error: "Account is not valid"}).end();
  }

  // Validate account in collection
  Account.findOne({ address: account }, async (err, accountObj) => {

    if (err) {
      res.status(500).end();
    }

    if (accountObj === null) {
      res.status(404).end();
    }

    const nonce = accountObj.nonce;

    // Validate signature by concordium
    if (!(await concordium.validateAccount(
        String(nonce),
        JSON.parse(Buffer.from(signature, "base64").toString()),
        account ))
    ) {
      // Clear nonce in the account when signature verification failed
      Account.updateOne({ address: account }, { nonce: null }, () => {});
      res.status(403).end();
    }

    // Clear nonce in the account after signature verification
    Account.updateOne({ address: account }, { nonce: null }, () => {});
  });

  // Validate preregistration in collection
  Preregistration.findOne({ id: req.params.id }, (err, preregistrationObj) => {

    if (err) {
      res.status(500).end();
      return;
    }

    if (preregistrationObj === null) {
      res.status(404).end();
    }

    // Validate Id already linked to another account
    if (preregistrationObj.account && preregistrationObj.account !== account)
    {
      res.status(406).end();
    }

    Preregistration.updateOne({ id: req.params.id }, { account: account }, () => {
      res.json({result: true}).status(201).end();
    });
  });
};