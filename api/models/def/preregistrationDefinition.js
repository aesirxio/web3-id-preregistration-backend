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
      enum : ['community', 'starter', 'team', 'growth', 'enterprise']
    },
    organization: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    order_id: {
      type: String,
      required: false,
    },
    refShare2Earn: {
      type: String,
      required: false,
    },
    account: {
      type: String,
      required: false,
    },
    claim_100ccd: {
      type: Boolean,
      required: false,
    },
  };
};
