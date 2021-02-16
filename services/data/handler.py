from __future__ import print_function


def process_data(event, context):
    for record in event['Records']:
        print("test")
        payload = record["body"]
        print(str(payload))
