// Import account model
const Preregistration = require("../models/preregistrationModel");
const Account = require("../models/accountModel");

const Concordium = require("../web3/concordium");
const concordium = new Concordium();

const crypto  = require("crypto");
const axios   = require('axios');
const fs      = require("fs");
const mime    = require("mime-types");
const webhook = process.env.INCOMMING_WEBHOOK;

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
      "first_name",
      "sur_name",
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

  const activationCode = crypto.randomBytes(16).toString("hex");

  const prereg = {
    id: req.body.id,
    first_name: req.body.first_name,
    sur_name: req.body.sur_name,
    product: req.body.product,
    dateReg: new Date(),
    activationCode: activationCode,
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
    await Preregistration.updateOne(
      { id: referrer.id },
      { referred: referrer.referred + 1 }
    );
  }

  const msg = `${req.body.id} registered successfully`;
  await sendSlack(msg);

  return res.status(201).json({ success: true, code: activationCode }).end();
};

exports.update = async (req, res) => {
  const account = req.params.account;

  try {
    const accountObj = await Account.findOne({ address: account });

    if (accountObj === null) {
      return res.status(404).json({ error: "Account not found" }).end();
    }

    preregistrationObj = await Preregistration.findOne({
      id: req.params.id,
    });

    if (preregistrationObj === null) {
      return res.status(404).json({ error: "Id not found" }).end();
    }

    // Validate Id already linked to another account
    if (typeof preregistrationObj.account !== "undefined") {
      return res
        .status(406)
        .json({ error: "Id already linked to an account" })
        .end();
    }

    if (
      (await Preregistration.findOne({
        account: account,
      })) !== null
    ) {
      return res
        .status(406)
        .json({
          error: "This account has been linked to a different registration",
        })
        .end();
    }

    Preregistration.updateOne(
      { id: req.params.id },
      {
        account: account,
        dateAccount: new Date(),
        share2earn: crypto.randomBytes(16).toString("hex"),
      },
      () => {
        return res.json({ result: true }).status(201).end();
      }
    );
  } catch (e) {
    return res.status(500).json().end();
  }
};

exports.list = async (req, res) => {
  const account = req.params.account;
  const avatarURL = process.env.AVATAR_BASE_URL;

  try {
    // Validate account in collection
    const accountObj = await Account.findOne({ address: account });

    if (accountObj === null) {
      return res.status(404).json({ error: "Account not found" }).end();
    }

    const preregistrationObj = await Preregistration.findOne({
      account: req.params.account,
    });

    if (preregistrationObj === null) {
      return res.status(404).json({ error: "Account not found" }).end();
    }

    if (preregistrationObj.referred && preregistrationObj.referred >= 6) {
      preregistrationObj.referred = 6;
    }

    let objForm = preregistrationObj.toObject();
    objForm.referredAmount = preregistrationObj.referred * 25;

    if (avatarURL && objForm.avatar)
    {
      objForm.avatar = avatarURL + objForm.avatar;
    }

    return res.json({ objForm }).status(200).end();
  } catch (e) {
    return res.status(500).json({ error: e.message }).end();
  }
};

exports.activate = async (req, res) => {
  try {
    const preregistrationObj = await Preregistration.findOne({
      id: req.params.id,
    });

    if (preregistrationObj === null) {
      return res.status(404).json({ error: "Id not found" }).end();
    }

    if (preregistrationObj.activationCode !== req.params.code) {
      return res.status(406).json({ error: "Invalid activation code" }).end();
    }

    if (typeof preregistrationObj.dateActivation !== "undefined") {
      return res.status(406).json({ error: "Registered" }).end();
    }

    await Preregistration.updateOne(
      {
        id: req.params.id,
      },
      { dateActivation: new Date() }
    );

    const msg = `${req.params.id} activated successfully`;
    await sendSlack(msg);

    return res.status(201).end();
  } catch {
    return res.status(500).end();
  }
};

exports.linkAesirX = async (req, res) => {
  try {
    const aesirxEndpoint = process.env.AESIRX_API_ENDPOINT;
    const sendPostRequest = async () => {
      try {
        const resp = await axios.post(`${aesirxEndpoint}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=member&task=checkUsername&api=hal`, {
          data: {username: req.params.aesirXAccount},
        })

        const data = resp.data;

        if (data.result.result === true || data.result.content_id === 'username_is_valid')
        {
          return res.status(406).json({ error: "AesirX account doesn't exist" }).end();
        }

      } catch (err) {
        return res.status(404).json({ error: "Cannot validate aesirX account" }).end();
      }
    }

    sendPostRequest();

    const preregistrationObj = await Preregistration.findOne({
      id: req.params.id,
    });

    if (preregistrationObj === null) {
      return res.status(404).json({ error: "Id not found" }).end();
    }

    if (typeof preregistrationObj.aesirXAccount !== "undefined") {
      return res
        .status(406)
        .json({ error: "This id has an AesirX account linked already" })
        .end();
    }

    if (
      (await Preregistration.findOne({
        aesirXAccount: req.params.aesirXAccount,
      })) !== null
    ) {
      return res
        .status(406)
        .json({
          error:
            "This AesirX account has been linked to a different registration",
        })
        .end();
    }

    await Preregistration.updateOne(
      {
        id: req.params.id,
      },
      {
        aesirXAccount: req.params.aesirXAccount,
        dateAesirXAccount: new Date(),
      }
    );

    const msg = `${req.params.id}: ${req.params.aesirXAccount} linked AesirX successfully`;
    await sendSlack(msg);

    return res.status(201).end();
  } catch {
    return res.status(500).end();
  }
};

async function sendSlack(msg) {
  try {
     await axios.post(`${webhook}`, {text: msg})
  } catch (err) {
    console.error(err.message);
  }
}

exports.updateInfo = async (req, res) => {
  const account   = req.params.account;
  const avatar    = req.file;
  const avatarDir = process.env.AVATAR_DIRECTORY || 'avatar';

  try {
    preregistrationObj = await Preregistration.findOne({
      account: account,
    });

    if (preregistrationObj === null) {
      return res.status(404).json({ error: "Account not found" }).end();
    }

    if (!req.body.id.match(/^@[a-z\d_]{3,20}$/i)) {
      return res.status(406).json({ error: "Invalid id" }).end();
    }

    if (req.body.product && (req.body.product !== "community" && !req.body.orderId)) {
      return res.status(406).json({ error: "Order id is required" }).end();
    }

    let data = req.body;

    if (avatar)
    {
      const avatarName = preregistrationObj.id;
      const ext        = mime.extension(req.file.mimetype).toLowerCase();
      const avatarPath = `/${avatarDir}/${avatarName}.${ext}`;

      // Delete old avatar
      if (fs.existsSync('.' + avatarPath)) {
        fs.unlinkSync('.' + avatarPath);
      }

      // Save avatar to localStorage
      fs.writeFile('.' + avatarPath, req.file.buffer, (err) => {
        if (err){
          return res.status(406).json({ error: "Image upload failed" }).end();
        };
      });

      // Add path to DB
      data.avatar = avatarPath;
    }

    const typeString = [
      "id",
      "first_name",
      "sur_name",
      "product",
      "organization",
      "message",
      "orderId",
      "avatar",
    ];

    Object.keys(data).forEach((key, index) => {

      if (typeof data[key] !== "string" && typeString.includes(key)) {
        return res
            .status(406)
            .json({ error: key + " must be string" })
            .end();
      }

      if (!typeString.includes(key) || !data[key]) {
       delete data[key];
      }
    });

    Preregistration.updateOne(
        { account: account},
        data,
        () => {
          return res.json({ result: true }).status(201).end();
        }
    );
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong" }).end();
  }
};

