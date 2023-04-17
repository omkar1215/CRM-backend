const express = require("express");
const serverConfig = require("./configs/server.config");
const mongoose = require("mongoose");
const dbConfig = require("./configs/db.config");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

/**
 * Setup the mongodb connection and create on ADMIN user
 */

mongoose.connect(dbConfig.DB_URL, ()=>{
    console.log("MongoDB connected");
    //Initialization
    init();
})

async function init(){

    var user = await User.findOne({userType : "ADMIN"});

    if(user){
        return;
    }else{

    //Create the Admin User

    const user = await User.create({
        name : "Omkar",
        userId : "admin",
        email : "omkarganachari@gmail.com",
        userType : "ADMIN",
        password : bcrypt.hashSync("Welcome1234", 8)

    });
    console.log("admin user is created");
    }
}



require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/ticket.routes')(app);
/**
 * Start the epress server
 */

app.listen(serverConfig.PORT, () => {
    console.log("Application has started on the port ", serverConfig.PORT);
})