const express = require(`express`);
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require('dotenv').config();




app.use(bodyParser.json());
app.use(cookieParser());
// Routes
app.use('/user', require('./routes/user.js'));

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Seerver is running on port ${port}`);
    // console.log(process.env)
});