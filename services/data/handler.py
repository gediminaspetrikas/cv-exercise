from __future__ import print_function
import json
import logging
import os
import time
import uuid

import boto3

dynamodb = boto3.resource('dynamodb')


def create_uuid(event, context):
    for record in event['Records']:
        # process data
        time.sleep(1)

        jobId = record["messageAttributes"]['jobId']['stringValue']
        timestamp = str(time.time())
        table = dynamodb.Table(os.environ['DYNAMODB_JOBS_TABLE'])
        item = {
            'id': str(uuid.UUID(jobId)),
            'text': str(uuid.uuid1()),
            'createdAt': timestamp,
            'updatedAt': timestamp,
        }

        table.put_item(Item=item)
