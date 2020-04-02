import json
import boto3
import constants

#Input: supporter_id
#Output: JSON object of current supporter appointments
def get_appointment_supporters(event, context):
    # TODO implement

    supporter_id_want = event['supporter_id']
    client = boto3.client('rds-data') #Connecting to the database
    appointment_info = client.execute_statement(
        secretArn = constants.SECRET_ARN,
        database = constants.DB_NAME,
        resourceArn = constants.Arn,
        sql = 'SELECT supporter_id, appointment_id, time, type, duration, method, location \
               FROM scheduled_appointments WHERE supporter_id = %s;' % (supporter_id_want)

    )

    """
    if appointment_info['supporter_id'] == '': 
        print("The user does not exist")
        return {
            "statusCode": 404
        }
    else:
        return{
            json_output = json.dumps(sql) #outputs the query in JSON format
            "statusCode": 200
        }
    """


    return {
        'statusCode': 200,
        'body': json.dumps('Hello from get_appointment_supporters Lambda!')
    }