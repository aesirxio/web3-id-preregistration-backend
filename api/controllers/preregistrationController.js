// Import account model
const Preregistration = require("../models/preregistrationModel");

exports.add = async (req, res) => {

    if (!req.body.id.match(/^@[a-z\d_]{3,20}$/i)) {
        return res.status(406).json({error: 'The id is invalid'}).end();
    }

    Object.entries(req.body).forEach(([key, val]) => {
        let typeString = ['id', 'name', 'email', 'organization', 'message', 'order_id', 'refShare2Earn'];

        if ( typeof val !== "string" && typeString.includes(key))
        {
            return res.status(406).json({error: key + ' must be string'}).end();
        }
    });

    try {
        await Preregistration.create({
            id: req.body.id,
            name: req.body.name,
            product: req.body.product,
            organization: req.body.organization,
            message: req.body.message,
            order_id: req.body.order_id,
            refShare2Earn: req.body.refShare2Earn,
            })
        } catch(error){
         return res.status(406).json({success: false}).end();
    }

    res.status(201);
    res.json({ success: true });
};
