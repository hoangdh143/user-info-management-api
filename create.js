import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);

    const userIdQueryParams = {
        TableName: process.env.userTableName,
        Key: {
            token: event.queryStringParameters.token
        }
    };

    try {
        const result = await dynamoDbLib.call("get", userIdQueryParams);
        if (result.Item) {
            const params = {
                TableName: process.env.contactTableName,
                Item: {
                    userId: result.Item.userId,
                    contactId: uuid.v1(),
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    birthday: data.birthday,
                    createdAt: Date.now()
                }
            };

            console.log(params);
            await dynamoDbLib.call("put", params);
            return success(params.Item);
        }
    } catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
