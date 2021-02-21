import { Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import * as uuid from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();

export const get: Handler = async (event) => {
  const id = event.pathParameters.id;
  console.log("ID: ", id);
  if (!id || !uuid.validate(id)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing or wrong id path parameter",
      }),
    };
  }

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.DYNAMODB_JOBS_TABLE,
    Key: {
      id,
    },
  };

  try {
    const { Item: jobItem } = await dynamoDb.get(params).promise();
    console.log("item: ", jobItem);

    if (!jobItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Resource not found",
        }),
      };
    }

    const mappedResult = {
      jobId: jobItem.id,
      text: jobItem.text,
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
        message: "Internal server failure",
      }),
    };
  }
};
