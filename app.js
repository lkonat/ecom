const express = require(`express`);
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
require('dotenv').config();




app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
// Routes
app.use('/api', require('./routes/auth.js'));
app.use('/api', require('./routes/user.js'));

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Seerver is running on port ${port}`);
});