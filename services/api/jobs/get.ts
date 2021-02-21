import { Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import * as uuid from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();

export const get: Handler = async (event) => {
  const id = event.pathParameters.id;
  console.log("ID: ", id);
  if (!id || uuid.validate(id)) {
    return {
      statusCode: 400,
      errorMessage: "Missing or wrong id path parameter",
    };
  }

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.DYNAMODB_JOBS_TABLE,
    Key: {
      id,
    },
  };

  try {
    const { Item: result } = await dynamoDb.get(params).promise();
    console.log("item: ", result);

    const mappedResult = {
      jobId: result.id,
      text: result.text,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(mappedResult),
    };
  } catch (error) {
    console.error("Read from database failed", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        errorMessage: "Internal server failure",
      }),
    };
  }
};
