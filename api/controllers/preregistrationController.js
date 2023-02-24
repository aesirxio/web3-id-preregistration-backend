// Import account model
const Preregistration = require("../models/preregistrationModel");
const Account = require("../models/accountModel");

const Concordium = require("../web3/concordium");
const concordium = new Concordium();

exports.add = async (req, res) => {

    if (!req.body.id.match(/^@[a-z\d_]{3,20}$/i)) {
        return res.status(406).json({error: 'The id is invalid'}).end();
    }

    if (req.body.product.trim() !== 'community' && !req.body.order_id)
    {
        return res.status(406).json({error: 'Order id is required'}).end();
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

exports.update = async (req, res) => {
    const account   = req.params.account;
    const signature = req.query.signature;

    // Validate account in collection
    Account.findOne({ address: account }, async (err, accountObj) => {

        if (err) {
            res.status(500).end();
        }

        if (accountObj === null) {
            res.status(404).end();
        }

        const nonce = accountObj.nonce;

        // Validate signature by concordium
        if (!(await concordium.validateAccount(
            String(nonce),
            JSON.parse(Buffer.from(signature, "base64").toString()),
            account ))
        ) {
            // Clear nonce in the account even signature verification failed
            Account.updateOne({ address: account }, { nonce: null }, () => {});
            res.status(403).end();
        }

        // Clear nonce in the account after signature verification
        Account.updateOne({ address: account }, { nonce: null }, () => {});
    });

    // Validate preregistration in collection
    Preregistration.findOne({ id: req.params.id }, (err, preregistrationObj) => {

        if (err) {
            res.status(500).end();
            return;
        }

        if (preregistrationObj === null) {
            res.status(404).end();
        }

        // Validate Id already linked to another account
        if (preregistrationObj.account && preregistrationObj.account !== account)
        {
            res.status(406).end();
        }

        Preregistration.updateOne({ id: req.params.id }, { account: account }, () => {
            res.json({result: true}).status(201).end();
        });
    });
};

exports.claimccd = async (req, res) => {
    const account   = req.params.account;
    const signature = req.query.signature;

    // Validate account in collection
    Account.findOne({ address: account }, async (err, accountObj) => {

        if (err) {
            res.status(500).end();
        }

        if (accountObj === null) {
            res.status(404).end();
        }

        const nonce = accountObj.nonce;

        // Validate signature by concordium
        if (!(await concordium.validateAccount(
            String(nonce),
            JSON.parse(Buffer.from(signature, "base64").toString()),
            account ))
        ) {
            // Clear nonce in the account even signature verification failed
            Account.updateOne({ address: account }, { nonce: null }, () => {});
            res.status(403).end();
        }

        // Clear nonce in the account after signature verification
        Account.updateOne({ address: account }, { nonce: null }, () => {});
    });

    // Validate preregistration in collection
    Preregistration.findOne({ id: req.body.id }, async (err, preregistrationObj) => {

        if (err) {
            res.status(500).end();
            return;
        }

        if (preregistrationObj === null) {
            res.status(404).end();
        }

        // Validate 100ccd
        if (preregistrationObj.claim_100ccd && preregistrationObj.claim_100ccd === true) {
            res.status(406).json({"sdf": "Sdf"}).end();
        }

        const hash = await concordium.tranferCcd(account);

        if (hash){
            Preregistration.updateOne({id: req.body.id}, {claim_100ccd: true}, () => {
                res.json({result: true}).status(201).end();
            });
        }
    });
};