import * as dynamoDbLib from "./libs/dynamodb-lib";
import uuid from "uuid";
import {failure, success} from "./libs/response-lib";

export async function main(event, context, callback) {
    const params = {
        TableName: process.env.userTableName,
        IndexName: "userID-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.identity.cognitoIdentityId
        }
    };

    try {
        const result = await dynamoDbLib.call("query", params);
        if (result.Item) {
            return success(result.Item.token);
        } else {
            const tokenParams = {
                TableName: process.env.userTableName,
                Item: {
                    userId: event.requestContext.identity.cognitoIdentityId,
                    token: uuid.v1(),
                }
            };
            await dynamoDbLib.call("put", tokenParams);
            return success(tokenParams.Item.token);
        }
    } catch (e) {
        console.log(e);
        return failure({status: false});
    }
}
