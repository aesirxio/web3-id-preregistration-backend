// api-routes.js
// Initialize express router and cache
const router = require("express").Router();
const multer = require('multer');

// Set default API response
router.get("/", function (req, res) {
  res.status(404).end();
});

// preregistration routes
const preregistrationController = require("./controllers/preregistrationController");
router.route("/preregistration").post(preregistrationController.add);
router.route("/prerregistration/claimccd/:account").put(preregistrationController.claimCdd);

// Account routes
const accountController = require("./controllers/accountController");
router.route("/account/v1/:account/nonce").get(accountController.getNonce);


// Export API routes
module.exports = router;
