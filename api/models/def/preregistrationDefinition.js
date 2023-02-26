module.exports.preregistration = function () {
  return {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    sur_name: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
      enum: ["community", "starter", "team", "growth", "enterprise"],
    },
    organization: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    orderId: {
      type: String,
      required: false,
    },
    refShare2Earn: {
      type: String,
      required: false,
    },
    activationCode: {
      type: String,
      required: true,
    },
    aesirXAccount: {
      type: String,
      required: false,
    },
    account: {
      type: String,
      required: false,
    },
    share2earn: {
      type: String,
      required: false,
    },
    referred: {
      type: Number,
      required: true,
      default: 0,
    },
    dateReg: {
      type: Date,
      required: true,
    },
    dateActivation: {
      type: Date,
      required: false,
    },
    dateAesirXAccount: {
      type: Date,
      required: false,
    },
    dateShare2Earn: {
      type: Date,
      required: false,
    },
  };
};
