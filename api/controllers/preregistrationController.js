// Import account model
const Preregistration = require("../models/preregistrationModel");
const Account = require("../models/accountModel");

const Concordium = require("../web3/concordium");
const concordium = new Concordium();

exports.add = async (req, res) => {
  if (!req.body.id.match(/^@[a-z\d_]{3,20}$/i)) {
    return res.status(406).json({ error: "Invalid id" }).end();
  }

  if (req.body.product.trim() !== "community" && !req.body.orderId) {
    return res.status(406).json({ error: "Order id is required" }).end();
  }

  Object.entries(req.body).forEach(([key, val]) => {
    const typeString = [
      "id",
      "name",
      "email",
      "organization",
      "message",
      "orderId",
      "refShare2Earn",
    ];

    if (typeof val !== "string" && typeString.includes(key)) {
      return res
        .status(406)
        .json({ error: key + " must be string" })
        .end();
    }
  });

  let referrer = null;
  if (typeof req.body.refShare2Earn !== "undefined") {
    referrer = await Preregistration.findOne({
      share2earn: req.body.refShare2Earn,
    });
    if (referrer === null) {
      return res
        .status(406)
        .json({ error: "share2earn code is not valid" })
        .end();
    }
  }

  const prereg = {
    id: req.body.id,
    name: req.body.name,
    product: req.body.product,
    dateReg: new Date(),
  };

  ["organization", "message", "orderId", "refShare2Earn"].forEach((field) => {
    if (typeof req.body[field] !== "undefined") prereg[field] = req.body[field];
  });

  try {
    await Preregistration.create(prereg);
  } catch (error) {
    if (error.message.match(/^E11000/)) {
      return res.status(406).json({ error: "Id already taken" }).end();
    }
    return res.status(406).json({ error: error.message }).end();
  }

  if (referrer !== null) {
    console.log(referrer);
    await Preregistration.updateOne(
      { id: referrer.id },
      { referred: referrer.referred + 1 }
    );
  }

  res.status(201);
  res.json({ success: true });
};

exports.update = async (req, res) => {
  const account = req.params.account;
  const signature = req.query.signature;

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
    if (
      !(await concordium.validateAccount(
        String(nonce),
        JSON.parse(Buffer.from(signature, "base64").toString()),
        account
      ))
    ) {
      // Clear nonce in the account even signature verification failed
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
    if (preregistrationObj.account && preregistrationObj.account !== account) {
      res.status(406).end();
    }

    Preregistration.updateOne(
      { id: req.params.id },
      { account: account },
      () => {
        res.json({ result: true }).status(201).end();
      }
    );
  });
};

exports.claimbeta = async (req, res) => {
  const account = req.params.account;
  const signature = req.query.signature;

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
    if (
      !(await concordium.validateAccount(
        String(nonce),
        JSON.parse(Buffer.from(signature, "base64").toString()),
        account
      ))
    ) {
      // Clear nonce in the account even signature verification failed
      Account.updateOne({ address: account }, { nonce: null }, () => {});
      res.status(403).end();
    }

    // Clear nonce in the account after signature verification
    Account.updateOne({ address: account }, { nonce: null }, () => {});
  });

  // Validate preregistration in collection
  Preregistration.findOne({ id: req.body.id }, (err, preregistrationObj) => {
    if (err) {
      res.status(500).end();
      return;
    }

    if (preregistrationObj === null) {
      res.status(404).end();
    }

    // Validate share2earn and beta
    if (preregistrationObj.share2earn !== null || preregistrationObj.beta === true) {
      console.log(preregistrationObj.beta); debugger; return;
      res.status(406).end();
    }
    Preregistration.updateOne(
      { id: req.body.id },
      { beta: true },
      () => {}
    );

    // Validate ramdom code is unique
    let alphanumeric = Math.random().toString(36).slice(2);

    Preregistration.findOne({ share2earn: alphanumeric }, (err, preregistrationObj) => {
      if (preregistrationObj === null)
      {
        Preregistration.updateOne(
            { id: req.body.id },
            { share2earn:  alphanumeric},
            () => {});
      }
    })

    // Increase the referred field who refered
    let refShare2Earn = preregistrationObj.refShare2Earn;

    if (refShare2Earn) {
      Preregistration.findOne({ share2earn: refShare2Earn }, (err, preregistrationObj) => {
        let referred = preregistrationObj.referred;

        Preregistration.updateOne(
            { share2earn: refShare2Earn },
            { referred:  referred + 1},
            () => {
              res.json({ result: true }).status(201).end();
            });
      })
    }
  });
};
