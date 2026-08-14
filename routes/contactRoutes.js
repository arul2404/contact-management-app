const express = require('express');
const validateToken = require('../middleware/validateTokenhandler');
const router = express.Router();
const { getcontacts ,createcontact, getcontact, updatecontact, deletecontact} = require('../controllers/contactcontroller');

router.use(validateToken);
router.route("/").get(getcontacts).post(createcontact);

router.route("/:id").get(getcontact).put(updatecontact).delete(deletecontact);


module.exports = router;