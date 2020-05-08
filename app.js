const express = require(`express`);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const expressValidator = require("express-validator");
require('dotenv').config();



const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
// Routes
app.use('/api', require('./routes/auth.js'));
app.use('/api', require('./routes/user.js'));
app.use('/api', require('./routes/category.js'));
app.use('/api', require('./routes/product.js'));
const port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`Seerver is running on port ${port}`);
});