// api-routes.js
// Initialize express router and cache
const router = require("express").Router();

// Set default API response
router.get("/", function (req, res) {
  res.status(404).end();
});
const { validateSignature } = require("./middlewares/validators/signature.js");
const { validateAccount } = require("./middlewares/validators/account.js");

// preregistration routes
const preregistrationController = require("./controllers/preregistrationController");
router.route("/preregistration").post(preregistrationController.add);
router
  .route("/preregistration/id/:id/account/:account")
  .put(validateSignature, validateAccount, preregistrationController.update);
router
  .route("/preregistration/activation/:id/:code")
  .put(preregistrationController.activate);
router
  .route("/preregistration/aesirx/:id/:aesirXAccount")
  .put(preregistrationController.linkAesirX);
router
  .route("/preregistration/account/:account")
  .get(validateSignature, validateAccount, preregistrationController.list);

// Account routes
const accountController = require("./controllers/accountController");
router.route("/account/:account/nonce").get(accountController.getNonce);
router.route("/account/sign/:account").get(accountController.signMessage);

// Export API routes
module.exports = router;
