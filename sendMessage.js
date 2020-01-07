import * as dynamoDbLib from "./libs/dynamodb-lib";
import {success, failure} from "./libs/response-lib";
import twilio from 'twilio';

const accountSid = process.env.twilioAccountSid;
const authToken =  process.env.twilioAuthToken;
const client = twilio(accountSid, authToken);

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const userId = event.requestContext.identity.cognitoIdentityId;
    try {
        const messageStatus = await processMessageRequest(userId, data);
        return success(messageStatus);
    } catch (e) {
        console.log(e);
        return failure({status: false});
    }
}

//Request: {to: [numbers], target: selected/all, message: '', callbackUrl}
async function processMessageRequest(userId, data) {
    let numbers;
    switch (data.target) {
        case 'selected':
            numbers = data.to;
            break;
        case 'all':
            const params = {
                TableName: process.env.contactTableName,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId
                }
            };
            const result = await dynamoDbLib.call("query", params);
            numbers = result.Items.map(item => item.phone);
            break;
        default:
            numbers = data.to;
            break;
    }

    const messageStatus = numbers.map(async (number) => {
        return client.messages
            .create({
                body: data.message,
                from: process.env.twilioPhoneNumber,
                to: number,
            })
            .then(message => {
                console.log(message.sid);
                return {status: 'success', number, message: message.sid};
            })
            .catch(error => {
                console.log(error);
                return {status: 'failure', number, message: error.message};
            });
    });
    return Promise.all(messageStatus);
}
