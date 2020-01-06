import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const userId = event.requestContext.identity.cognitoIdentityId;
    try {
        return processMessageRequest(userId, data);
    } catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
