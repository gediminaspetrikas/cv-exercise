import { Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import * as uuid from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();

export const create: Handler = async () => {
  const timestamp = new Date().getTime();

  console.log(process.env);
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  const result = await dynamoDb.put(params).promise();
  console.log(result);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
