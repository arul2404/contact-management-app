const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/dbConnection');
const {errorHandler} = require('./middleware/errorHandler');
const cors = require('cors');

const app = express();
app.use((req, res, next) => {
    console.log("REQUEST RECEIVED:", req.method, req.url);
    next();
});


app.use(cors({
    origin: "http://127.0.0.1:5500"
}))


const port = process.env.PORT || 5001;


app.use(express.json());

app.use(express.static('frontend'));    

app.get("/", (req, res) => {
    res.send("API is running...");
}); 

app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use(errorHandler);

connectDB();

module.exports = app;