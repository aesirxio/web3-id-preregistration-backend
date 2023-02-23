module.exports.preregistration = function () {
  return {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
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
  };
};
