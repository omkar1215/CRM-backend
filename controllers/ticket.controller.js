const User = require("../models/user.model");
const constants = require("../utils/constants");
const Ticket = require("../models/ticket.model");
const objectConverter = require("../utils/objectConverter");
const notificationServiceClient = require("../utils/notificationServiceClient");

/**
 * Create a ticket
 *  v1 - Any one should be able to create the ticket
 */

exports.createTicket = async (req, res) => { 

    //logic to create the ticket
    const ticketObj = {
        title : req.body.title,
        ticketPriority : req.body.ticketPriority,
        description : req.body.description
    }

    /**
     * If any Engineer is available
     */

    try{
    const engineer = await User.findOne({
        userType : constants.userType.engineer,
        userStatus : constants.userStatus.approved
    });

    if (engineer) {
        ticketObj.assignee = engineer.userId;
    }
    
    const ticket = await Ticket.create(ticketObj);

    /**
     * Ticket is created now
     * 1. We should update the customer and engineer document 
     */

    /**
     * Find out the customer
     */
    if(ticket){
        const user = await User.findOne({
            userId : req.userId
        });
        user.ticketsCreated.push(ticket._id);
        await user.save();

        /**
         * Update the Engineer
         */
        engineer.ticketAssigned.push(ticket._id);
        await engineer.save();

        /**
         * Right place to send the email
         * 
         * call the notificationService to send the email
         * 
         * I need to have a client to call the external service
         */

        notificationServiceClient(ticket._id, "Created new Ticket : "+ticket._id, ticket.description, user.email+","+engineer.email, user.email);
        
        return res.status(201).send(objectConverter.ticketResponse(ticket));
    }

}catch(err){
    console.log(err.message);
    return res.status(500).send({
        message : "Some internal error"
    });
}
}

/** 
 * API to fetch all the tickets 
 * 
 * Allowthe user to filter based on state
 * 
 * TODO HW : Extension :
 * Using query param, allow the users to
 * filter the list of tickets based on status 
 * 
 * Depending on the user I need to return different list of tickets :
 * 
 * 1.ADMIN - Return all tickets 
 * 2. ENGINEER - All the tickets, either created or assigned to him/her
 * 3. CUSTOMER - All the tickets created by him
*/

exports.getAllTickets = async (req, res) => {

    /**
     * I want to get the list of all the tickets
     */


    const queryObj = {};

    if(req.query.status != undefined){
        queryObj.status = req.query.status;
    }
    const user = await User.findOne({userId : req.userId});

    if(user.userType == constants.userType.admin){
        //Return all the tickets
        //No need to change anything in the query object
    }else if(user.userType == constants.userType.customer){
        if(user.ticketsCreated == null || user.ticketsCreated.length==0){
            return res.status(200).send({
                message : "No tickets created by you !!"
            });
        }

        queryObj._id = {
            $in : user.ticketsCreated // array of ticket ids 
        }
    }else{  
        //User is of type engineer
        queryObj._id = {
            $in : user.ticketsCreated // array of ticket ids 
        }
        //All the ticket where im assignee
        queryObj.assignee = req.userId;
    }

    const tickets= await Ticket.find(queryObj);



    res.status(200).send(objectConverter.ticketListResponse(tickets));
}

/**
 * controller to fetch ticket based on id
 */

exports.getOneTicket =async (req, res) => {
    const ticket = await Ticket.findOne({
        _id : req.params.id
    });
    res.status(200).send(objectConverter.ticketResponse(ticket));

}

/**
 * Write the controller to update the ticket
 * 
 * TODO :
 * 1. Assignee Engineer should also be able to update the ticket
 */

exports.updateTicket = async (req, res) => {

    //Check if the ticket exists

    const ticket = await Ticket.findOne({
        _id : req.params.id
    });

    if(ticket == null){
        return res.status(200).send({
            message : "Ticket doesn't exist"
        });
    }

    /**
     * Only the ticket request be allowed to update the ticket
     */
    const user = User.findOne({
        userId : req.userId
    });

    /**
     * If the ticket is not assigned to any engineer, any engineer
     * can self assign themselves the given ticket
     */


    if(ticket.assignee == undefined){
        ticket.assignee = req.userId;
    }

    if((user.ticketsCreated == undefined || !user.ticketsCreated.includes(req.params.id)) && !(user.userType==constants.userType.admin) && !(ticket.assignee == req.userId)){
        return res.status(403).send({
            message: "Only owner of the ticket is allowed to update the ticket"
        });
    }

    //Update the attribute of the saved ticket

    ticket.title = req.body.title != undefined ? req.body.title : ticket.title;
    ticket.description = req.body.description != undefined ? req.body.description : ticket.description;
    ticket.ticketPriority = req.body.ticketPriority != undefined ? req.body.ticketPriority : ticket.ticketPriority;
    ticket.status = req.body.status != undefined ? req.body.status : ticket.status;

    //Ability to re-assign the ticket
    if(user.userType == constants.userType.admin){
        ticket.assignee = req.body.assignee != undefined ? req.body.assignee : ticket.assignee;
    }

    //Saved the changed ticket

    const updatedTicket = await ticket.save();

    //Return the updated ticket

    return res.status(200).send(objectConverter.ticketResponse(updatedTicket));
}