import { APIGatewayProxyHandler } from "aws-lambda";

const testHandler: APIGatewayProxyHandler = async () => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(Date.now() / 1000),
  };
  return response;
};

export default testHandler;
