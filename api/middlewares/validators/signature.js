const { check } = require("express-validator");

exports.validateSignature = [
  check("signature"),
  (req, res, next) => {
    const signature = req.query.signature;

    // Validate missing signature
    if (typeof signature === "undefined") {
      return res.status(406).json({ error: "Missing signature" }).end();
    }

    // Validate signature not json
    try {
      const isJson = JSON.parse(Buffer.from(signature, "base64").toString());

      if (!isJson || typeof isJson !== "object") {
        return res.status(406).json({ error: "Invalid signature" }).end();
      }
    } catch {
      return res.status(406).json({ error: "Invalid signature" }).end();
    }

    next();
  },
];
