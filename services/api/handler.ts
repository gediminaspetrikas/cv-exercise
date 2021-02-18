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
  const jobId = event.pathParameters.jobId;
  if (!jobId) {
    return {
      statusCode: 400,
      errorMessage: "Missing jobId",
    };
  }

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.DYNAMODB_JOBS_TABLE,
    Key: {
      jobId,
    },
  };
  try {
    const result = await dynamoDb.get(params).promise();
    console.log("res", result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
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
