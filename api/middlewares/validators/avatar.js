const { check } = require("express-validator");
const fs        = require("fs");
const mime      = require('mime-types');

exports.validateAvatar = [
  check("avatar"),
  (req, res, next) => {

    const avatar    = req.file;
    const avatarDir = process.env.AVATAR_DIRECTORY || 'avatar';

    if (avatar)
    {
      // Check directory existence
      if (!fs.existsSync(avatarDir)){
        fs.mkdirSync(avatarDir);
      }

      // Check image file types
      const ext         = mime.extension(req.file.mimetype).toLowerCase();
      const typeImages  = ['jpg', 'png'];

      if (!typeImages.includes(ext)) {
        return res
            .status(406)
            .json({ error: `JPG and PNG files only` })
            .end();
      }
    }

    next();
  },
];
