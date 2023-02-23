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


// Export API routes
module.exports = router;
