// Model.js
const mongoose = require("mongoose");
const definition = require("./def/preregistrationDefinition");

// Setup schema
const preregistrationSchema = mongoose.Schema(definition.preregistration());

// Export Account model
const Preregistration = (module.exports = mongoose.model("preregistration", preregistrationSchema));

module.exports.get = function (callback, limit) {
  Preregistration.find(callback).limit(limit);
};
