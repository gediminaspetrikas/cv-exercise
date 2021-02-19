import { Handler, Context } from "aws-lambda";
import { DynamoDB, SQS } from "aws-sdk";

import * as uuid from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();
const sqs = new SQS();

const getQueueUrl = (context: Context): string => {
  const region = context.invokedFunctionArn.split(":")[3];
  const accountId = context.invokedFunctionArn.split(":")[4];
  const queueName: string = process.env.SQS_QUEUE_JOBS;

  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
};

export const create: Handler = async (event, context) => {
  const jobId = uuid.v1();
  const params: SQS.SendMessageRequest = {
    MessageAttributes: {
      jobId: {
        DataType: "String",
        StringValue: jobId,
      },
    },
    MessageBody: JSON.stringify(jobId),
    QueueUrl: getQueueUrl(context),
  };

  try {
    await sqs.sendMessage(params).promise();

    return {
      statusCode: 202,
      body: JSON.stringify({ jobId }),
    };
  } catch (error) {
    console.error("Push to queue failed", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        errorMessage: "Internal server failure",
      }),
    };
  }
};

export const get: Handler = async (event) => {
  const id = event.pathParameters.id;
  if (!id && uuid.validate(id)) {
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
