from functools import partial
from package import db_config
from package.lambda_exception import LambdaException
import boto3
import botocore

s3 = boto3.client(
    's3',
    region_name='us-east-1' # Presigned URLs require region name to be specified explicitly.
)

query = partial(
    boto3.client('rds-data').execute_statement,
    database=db_config.DB_NAME,
    secretArn=db_config.SECRET_ARN,
    resourceArn=db_config.ARN
)

# DB CONSTANTS
USERS_TABLE = "users"
NOTIFICATION_PREFERENCES_TABLE = "notification_preferences"
NOTIFICATION_ID_TABLE = "notification_type"
USER_LINKS_TABLE = "user_link"
LINKS_TABLE = "link"

# S3 CONSTANTS
IMAGES_BUCKET = 't1-s3-us-east-1-images'

# Currently executeStatement() doesn't support arrayValue.
# So, we pass arrays as strings and then cast them to arrays (ex: :users_ids::int[])
# However, it is expected to be supported in the near future.
# When it becomes available, the code should be updated to use that.

# Methods which are expected to be called multiple times in the same lambda function are designed to use list of identifiers 
# instead of single identifier (user_ids instead of user_id) because that optimizes the program to reduce the number of queries 
# to the backend and saves computation time.

class Users:
    @staticmethod
    def exists(user_ids):
        """ Returns a dictionary with user ids as key containing boolean values indicating whether the user exists or not. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(user_ids, False)
        for record in sql_result:
            result[record[0]['longValue']] = True

        return result
        
    @staticmethod
    def is_student(user_ids):
        """ Returns a dictionary with user ids as key containing boolean values indicating whether the user is a student or not. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, is_student FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['booleanValue']

        return result

    @staticmethod    
    def is_supporter(user_ids):
        """ Returns a dictionary with user ids as key containing boolean values indicating whether the user is a supporter or not. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, is_supporter FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['booleanValue']

        return result

    @staticmethod    
    def is_admin(user_ids):
        """ Returns a dictionary with user ids as key containing boolean values indicating whether the user is an admin or not. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, is_admin FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['booleanValue']

        return result

    @staticmethod
    def get_name(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the user name (preferred name if exists else first name + last name). """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, first_name, last_name, preferred_name FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(user_ids, {'preferred_name': ""}) # The supporters are not required to have a preferred_name, so let's prepopulate that to empty string.
        for record in sql_result:
            supporter_id = record[0]['longValue']
            result[supporter_id]['first_name'] = record[1]['stringValue']
            result[supporter_id]['last_name'] = record[2]['stringValue']
            
            if 'stringValue' in record[3]:
                result[supporter_id]['name'] = record[3]['stringValue'] + " " + record[2]['stringValue']
                result[supporter_id]['preferred_name'] = record[3]['stringValue']
            else:
                result[supporter_id]['name'] = record[1]['stringValue'] + " " + record[2]['stringValue']

        return result
    
    @staticmethod
    def set_first_name(user_id, first_name):
        """ Updates the first name of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(first_name, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'first_name', 'value': {'stringValue': first_name}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET first_name = :first_name WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)
    
    @staticmethod
    def set_last_name(user_id, last_name):
        """ Updates the last name of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(last_name, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'last_name', 'value': {'stringValue': last_name}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET last_name = :last_name WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def set_preferred_name(user_id, preferred_name):
        """ Updates the preferred name of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(preferred_name, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'preferred_name', 'value': {'stringValue': preferred_name}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET preferred_name = :preferred_name WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_email(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the email address of the users. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, email FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def set_email(user_id, email):
        """ Updates the email address of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(email, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'email', 'value': {'stringValue': email}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET email = :email WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_bio(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the bio of the users. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, bio FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def set_bio(user_id, bio):
        """ Updates the bio of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(email, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'bio', 'value': {'stringValue': bio}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET bio = :bio WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_pronouns(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the pronouns of the users. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, pronouns FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def set_pronouns(user_id, pronouns):
        """ Updates the pronouns of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(pronouns, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'pronouns', 'value': {'stringValue': pronouns}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET pronouns = :pronouns WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_gender(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the gender of the users. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, gender FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def set_gender(user_id, gender):
        """ Updates the gender of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(gender, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'gender', 'value': {'stringValue': gender}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET gender = :gender WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)


    @staticmethod
    def get_phone(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the phone of the users. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, phone FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def set_phone(user_id, phone):
        """ Updates the phone of the user with the specified user id. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(phone, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'phone', 'value': {'stringValue': phone}}
        ]
        
        sql = f"UPDATE {USERS_TABLE} SET phone = :phone WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_notification_preferences(user_ids):
        # Not yet ready.
        return

        """ Returns a dictionary with user ids as key containing dictionary values representing notification preferences of the user. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT user_id, npt.notification_type_id, notification_type_name, notification_preference_id \
            FROM {NOTIFICATION_PREFERENCES_TABLE} npt, {NOTIFICATION_ID_TABLE}\
            WHERE id = ANY(:user_ids::int[]) AND npt.notification_type_id = nit.notification_type_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(user_ids, {}) 
        for record in sql_result:
            user_id = record[0]['longValue']
            if 'longValue' in record[1]:
                result[user_id]['notification_type_id'] = record[1]['longValue']
            if 'stringValue' in record[2]:
                result[user_id]['notification_type_name'] = record[2]['stringValue']
                
        return result

    @staticmethod
    def get_links(user_ids):
        """ Returns a dictionary with user ids as key and containing list of dictionary values representing links of the user. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT user_id, ult.link_id, link_type, link \
            FROM {USER_LINKS_TABLE} ult, {LINKS_TABLE} lt\
            WHERE user_id = ANY(:user_ids::int[]) AND ult.link_id = lt.link_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(user_ids, []) 
        for record in sql_result:
            result[record[0]['longValue']].append({
                'link_id': record[1]['longValue'],
                'link_type': record[2]['stringValue'],
                'link': record[3]['stringValue']
            })
                
        return result
        
    @staticmethod
    def get_profile(user_ids):
        """ Returns a dictionary with user ids as key containing string values representing the presigned url of the profile picture. """

        Users.__check_type(user_ids, list)

        param = [{'name': 'user_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in user_ids) + '}'}}]
        sql = f"SELECT id, picture FROM {USERS_TABLE} WHERE id = ANY(:user_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = s3.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': IMAGES_BUCKET,
                        'Key': f"{record[0]['longValue']}/profile/{record[1]['stringValue']}",
                    },
                    ExpiresIn=86400 # Expires in 1 day.
                )
            else:
                result[record[0]['longValue']] = "" # We could replace it with some default picture for a user.
        
        return result

    # No need for allowing multiple user_ids because a user is going to upload their profile picture only.
    @staticmethod
    def get_profile_post_url(user_id, extension):
        # TODO: Delete the profile picture before uploading new.
        # Option 1: Add S3 trigger to be executed once the new image is uploaded.
        #   CONS: Need to study S3 triggers.
        # Option 2: Delete here in this method.
        #   CONS: Leaves user with no profile picture if the picture upload was a failure.
        # TODO: Set the extension in DB.
        # Option 1: Set it here in the method.
        # Option 2: Use S3 triggers.
        # CONS: (same as above)

        """ Creates a presigned post url to be used by frontend to upload the profile picture. """
        
        Users.__check_type(user_id, int)
        Users.__check_type(user_id, str)

        param = [
            {'name': 'user_id', 'value': {'stringValue': user_id}},
            {'name': 'extension', 'value': {'stringValue': extension}}
        ]
        sql = f"UPDATE {USERS_TABLE} SET picture = :first_name WHERE id = :user_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

        return s3.generate_presigned_post(
            Bucket=IMAGES_BUCKET,
            Key=f"{user_id}/profile/pic.{extension}", # Allowing multiple extensions (jpeg, png, ...) here to save computation on user's system of converting image to some standard format.
            Conditions=[
                ['content-length-range', 1, 10485760] # Limit the file size from 1 bytes to 10 MB.
            ],
            ExpiresIn=600 # Expires in 10 minutes
        )

    @staticmethod
    def __check_type(variable, type):
        if not isinstance(variable, type):
            raise LambdaException(f"InvalidArgumentException: Expected {type}, found {type(variable)}")