const { check }   = require("express-validator");
const Account     = require("../../models/accountModel");
const Concordium  = require("../../web3/concordium");
const concordium  = new Concordium();

exports.validateSignature = [
  check("signature"),
  async (req, res, next) => {
    const signature = req.query.signature;
    const account   = req.params.account;

    // Validate missing signature
    if (typeof signature === "undefined") {
      return res.status(406).json({error: "Missing signature"}).end();
    }

    // Validate signature not json
    try {
      const isJson = JSON.parse(Buffer.from(signature, "base64").toString());

      if (!isJson || typeof isJson !== "object") {
        return res.status(406).json({error: "Invalid signature"}).end();
      }
    } catch {
      return res.status(406).json({error: "Invalid signature"}).end();
    }

    if (account) {
      const accountObj = await Account.findOne({address: account});
      const nonce = accountObj.nonce;

      if (!nonce)
      {
        return res.status(406).json({error: "Missing nonce"}).end();
      }

      // Validate signature by concordium
      if (
          !(await concordium.validateAccount(
              nonce.toString(),
              JSON.parse(Buffer.from(signature, "base64").toString()),
              account
          ))
      ) {
        // Clear nonce in the account even signature verification failed
        await Account.updateOne({address: account}, {$set: {nonce: null}}, {upsert: true});
        return res.status(403).json({error: "Signature verification failed"}).end();
      }
    }

    // Clear nonce in the account after signature verification
    await Account.updateOne({ address: account }, {$set: {nonce: null}}, {upsert: true});

    next();
  },
];
