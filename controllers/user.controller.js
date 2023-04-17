/**
 * This file will have all the logic to manipulate the user resource
 */

const User= require("../models/user.model");
const objectConverter = require("../utils/objectConverter");

/**
 * Fetch the list of all Users
 *  - only admin is allowed to call this method
 *  - ADMIN should be able to filter based on:
 *      1. Name
 *      2.UserType
 *      3.UserStatus
 */

exports.findAllUsers = async (req, res) => {

    /**
     * Read the data from the query param
     */

    const nameReq = req.query.name;
    const userTypeReq = req.query.userType;
    const userStatusReq = req.query.userStatus;

    const mongoQueryObj = {}
    if(nameReq && userStatusReq && userTypeReq){
        mongoQueryObj.name = nameReq;
        mongoQueryObj.userStatus = userStatusReq;
        mongoQueryObj.userType = userTypeReq;
    }else if(nameReq && userStatusReq){
        mongoQueryObj.name = nameReq;
        mongoQueryObj.userStatus = userStatusReq;
    }else if(userStatusReq && userTypeReq){
        mongoQueryObj.userStatus = userStatusReq;
        mongoQueryObj.userType = userTypeReq;        
    }else if(userTypeReq && nameReq){
        mongoQueryObj.name = nameReq;
        mongoQueryObj.userType = userTypeReq;
    }else if(nameReq){
        mongoQueryObj.name = nameReq;
    }else if(userStatusReq){
        mongoQueryObj.userStatus = userStatusReq;
    }else if(userTypeReq){
        mongoQueryObj.userType=userTypeReq;
    }

    /**
     * Write the code here to fetch all the Users from the DB
     * 
     * Fetch the User documents from the user collection
     */

    try{
        const users = await User.find(mongoQueryObj);

        return res.status(200).send(objectConverter.userResponse(users));

    }catch(err){
        console.log(err.message);
        res.status(500).send({
            message : "Internal error while fetching all users"
        })
    }


}

/**
 * Fetch the user based on the userId
 */

exports.findUserById = async (req, res) => {
    const userIdReq = req.params.userId; //Reading from the request parameter

    const user = await User.find({userId : userIdReq});

    if(user){
        res.status(200).send(objectConverter.userResponse(user));
    }else{
        res.status(200).send({
            message : "User with id "+ userIdReq + " doesn't exist"
        });
    }
}

/**
 * Update the user - status ,userType
 *  -only ADMIN should be allowed to do this
 */

exports.updateUser = (req, res) => {

    /**
     * One of the ways of updating
     */

    try{
    const userIdReq = req.params.userId;
    
    const user = User.findOneAndUpdate({
        userId : userIdReq
    },{
        name : req.body.name,
        userStatus : req.body.userStatus,
        userType : req.body.userType
    }).exec();

    res.status(200).send({
        message : "User record successfully updated"
    });
}catch(err){
    console.log(err.message);
    res.status(500).send({
        message : "Internal server error while updating"
    });
}

} 