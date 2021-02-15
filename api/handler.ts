import { Handler } from "aws-lambda";

export const testHandler: Handler = async () => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(Date.now() / 1000),
  };
  return response;
};
