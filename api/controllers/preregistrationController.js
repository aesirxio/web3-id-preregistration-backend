// accountController.js
const fs = require("fs");

// Import account model
const Preregistration = require("../models/preregistrationModel");

exports.add = async (req, res) => {
    try {
        await Preregistration.create({
            id: req.body.id.replace(/^@[a-z\d_]{3,20}$/i),
            name: req.body.name,
            product: req.body.product,
            organization: req.body.organization,
            message: req.body.message,
            orderId: req.body.orderId,
            refShare2Earn: req.body.refShare2Earn,
            })
        }catch(error){
         return res.status(406).json({success: false}).end();
    }

    res.status(201);
    res.json({ success: true });
};
