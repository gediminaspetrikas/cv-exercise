import { Handler, Context } from "aws-lambda";
import { DynamoDB, SQS } from "aws-sdk";

import * as uuid from "uuid";

// const dynamoDb = new DynamoDB.DocumentClient();
const sqs = new SQS();
const MESSAGE_GROUP_ID = "Jobs";

const getQueueUrl = (context: Context): string => {
  const region = context.invokedFunctionArn.split(":")[3];
  const accountId = context.invokedFunctionArn.split(":")[4];
  const queueName: string = process.env.SQS_QUEUE_JOBS;

  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
};

export const create: Handler = async (event, context) => {
  const jobId = uuid.v1();
  console.log("queue", getQueueUrl(context));
  const params: SQS.SendMessageRequest = {
    MessageAttributes: {
      jobId: {
        DataType: "String",
        StringValue: jobId,
      },
    },
    MessageBody: JSON.stringify(jobId),
    MessageDeduplicationId: jobId,
    MessageGroupId: MESSAGE_GROUP_ID,
    QueueUrl: getQueueUrl(context),
  };

  try {
    await sqs.sendMessage(params).promise();
  } catch (error) {
    console.error("Push to queue failed", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        errorMessage: "Internal server failure",
        queue: getQueueUrl(context),
      }),
    };
  }

  return {
    statusCode: 202,
    body: JSON.stringify({ jobId }),
  };
};

export const get: Handler = async () => {
  // const timestamp = new Date().getTime();
  // console.log(process.env);
  // const params: DynamoDB.DocumentClient.PutItemInput = {
  //   TableName: process.env.DYNAMODB_JOBS_TABLE,
  //   Item: {
  //     id: uuid.v1(),
  //     createdAt: timestamp,
  //     updatedAt: timestamp,
  //   },
  // };
  // const result = await dynamoDb.put(params).promise();
  // console.log("res", result);
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(result),
  // };
};
