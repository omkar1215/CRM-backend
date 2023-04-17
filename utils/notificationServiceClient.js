/**
 * Logic to make a POST call to the Notification Service
 */
const Client = require("node-rest-client").Client;

const client = new Client();

/**
 * Expose a function which will take the following information
 * 
 * subject,
 * content,
 * recepientEmails,
 * requester,
 * ticketId
 * 
 * and then make a POST call
 */

module.exports = (ticketId, subject, content, emailIds, requester) => {

    /**
     * Post call
     *  -URI : 127.0.0.1:7777/notifServ/api/v1/notifications
     *  -HTTP Verb : POST
     *  -Request Body --DONE
     *  -Headers
     */

    //Request Body
    const reqBody = {
        subject : subject,
        content : content,
        recepientEmails : emailIds,
        requester : requester,
        ticketId : ticketId
    }

    const headers = {
        "Content-Type" : "application/json"
    }

    const args = {
        data : reqBody,
        headers : headers
    }

    var req = client.post("http://127.0.0.1:7777/notifServ/api/v1/notifications", args, (data, response) => {
        console.log("Request Sent");
        console.log(data);
    });

    /**
     * Check for the Error
     */

    req.on('requestTimeout', function (req) {
        console.log('request has expired');
        req.abort();
    });
    
    req.on('responseTimeout', function (res) {
        console.log('response has expired');
    });

    req.on('error', function (err) {
        console.log('request error', err);
    });

}