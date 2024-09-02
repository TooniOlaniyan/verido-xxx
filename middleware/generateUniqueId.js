const { nanoid } = require('nanoid');

const generateUniqueId = (req, res, next) => {
    req.body.partner_id = nanoid(5).toLowerCase(); // Generate a 5-character unique ID and convert to lowercase
    next();
};

module.exports = generateUniqueId;
