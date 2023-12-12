from confluent_kafka import Consumer, error
from fastapi import FastAPI

app = FastAPI()

@app.get("/{magasin}")
async def get_kafka_data():
    # Connect to a Kafka broker using API access
    access_point = "kafka_host:9094"

    consumer = Consumer(bootstrap_servers=[access_point], 
                        group=None,
                        value_deserializer="org.apache.kafka.common.serialization.StringDeserializer",
                        bootstrap_timeout=30, 
                        group_id="tickets",
                        auto_offset_reset='earliest',
                        enable_auto_commit=True,
                        api_version='1.0')

    # Wait for a message to be returned from the API
    while True:
        # Get a batch of messages from the API
        messages = await consumer.fetch_messages(min_messages=1, max_messages=1, fetch_max_wait=10, api_version='1.0', use_offset=True)
        # If there were messages returned, return them as JSON data
        if messages:
            response_data = await consumer.poll(timeout_ms=30, api_version='1.0', use_offset=True, use_reset_offets=True)
            if response_data.error is not None:
                raise ValueError(f'Error occurred retrieving messages from Kafka: {response_data.error}')
            return response_data.value
        else:
            response_data = await consumer.poll("timeout")
