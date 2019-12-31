import * as dynamoDbLib from "./libs/dynamodb-lib";
import uuid from "uuid";

export async function main(event, context, callback) {
    console.log(event);

    if (event.request.userAttributes.email) {
        const params = {
            TableName: process.env.userTableName,
            Item: {
                userId: event.request.userAttributes.email,
                token: uuid.v1(),
            }
        };
        dynamoDbLib.call("put", params);
        // Return to Amazon Cognito
        callback(null, event);
    } else
        {
            // Nothing to do, the user's email ID is unknown
            callback(null, event);
        }
    }
