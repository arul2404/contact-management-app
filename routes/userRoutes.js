const express = require("express");
const validateToken = require("../middleware/validateTokenhandler");
const { registerUser, loginUser, CurrentUser } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", validateToken, CurrentUser);

module.exports = router;