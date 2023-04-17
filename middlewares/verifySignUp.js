/**
 * This file will contain the custom middleware for varifying the request body
 */

const User = require("../models/user.model");

validateSignupRequest = async (req, res, next) => {
    //Validate if userName exists
    if(!req.body.name){
        return res.status(400).send({
            message : "Failed ! User name is not provided"
        })
    }

    //Validate if the userId exists
    if(!req.body.userId){
        return res.status(400).send({
            message : "Failed ! User Id is not provided"
        })
    }
    /**
     * Validate if the userId is already not present
     */
    const user = await User.findOne({userId : req.body.userId});

    if(user != null){
        return res.status(400).send({
            message : "Failed ! User Id is already exist"
        })
    }

    //Validate if email exists
    if(!req.body.email){
        return res.status(400).send({
            message : "Failed ! email is not provided"
        })
    }

    //Validate if the password exists
    if(!req.body.password){
        return res.status(400).send({
            message : "Failed ! password is not provided"
        })
    }

    //Validate if the password exists
    if(!req.body.userType){
        return res.status(400).send({
            message : "Failed ! userType is not provided"
        })
    }

    /**
     * If everything is valid
     * Give the Controll to the controller
     */
    next();

}

module.exports = {
    validateSignupRequest : validateSignupRequest
}