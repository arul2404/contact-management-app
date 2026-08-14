const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");


//@desc register a user
//@route POST /api/users/register
//@access public 

const registerUser = asyncHandler(async (req, res) => {
    const { name, email , password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error(" all fields are mandatory");
    }
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(400);
        throw new Error("user already registered");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashed password:", hashedPassword);
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    console.log(`user created ${user}`);
    if (user) {
        res.status(201).json({ _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

//@desc login a user
//@route POST /api/users/login
//@access public 

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("all fields are mandatory");
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign(
            { 
             user: {
                name: user.name,
                email: user.email,
                id: user.id
             }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

//@desc current user information
//@route GET /api/users/current
//@access private

const CurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401);
        throw new Error("User is not authorized");
    }

    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
    });
});

module.exports = { registerUser, loginUser, CurrentUser };