const { check } = require("express-validator");

exports.validateAccount = [
  check("account"),
  (req, res, next) => {
    const account = req.params.account;

    // Validate the account's format
    if (!account || !account.match(/^[a-zA-Z0-9]+$/)) {
      return res.status(500).json({ error: "Account is not valid" }).end();
    }

    next();
  },
];
