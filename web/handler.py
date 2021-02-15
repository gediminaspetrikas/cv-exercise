def hello(event, context):
    return {
        "statusCode": 200,
        "body": "<html><body><p>Hello!</p></body></html>",
        "headers": {
            "Content-Type": "text/html"
        }
    }
