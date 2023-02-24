const {check} = require('express-validator');

exports.validateSignature = [
    check('signature'),
    (req, res, next) => {

        const signature = req.query.signature;

        // Validate missing signature
        if (!signature)
        {
            res.status(406).json({error: "Missing signature"}).end();
        }

        // Validate signature not base64
        if (!signature.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/))
        {
            res.status(406).json({error: "Signature not base64"}).end();
        }

        // Validate signature not json
        try {
            let isJson = JSON.parse(signature);

            if (isJson && typeof isJson === "object") {
                res.status(406).json({error: "Signature not json"}).end();
            }
        } catch (e) {}

        next();
    },
];