from functools import partial
from package import db_config
from package.lambda_exception import LambdaException
import boto3
import botocore

query = partial(
    boto3.client('rds-data').execute_statement,
    database=db_config.DB_NAME,
    secretArn=db_config.SECRET_ARN,
    resourceArn=db_config.ARN
)

# DB CONSTANTS
SUPPORTERS_TABLE = "supporters"
SUPPORTER_MAJOR_PREFERENCES_TABLE = "supporter_major_preferences"
MAJORS_TABLE = "major"
SUPPORTER_MINOR_PREFERENCES_TABLE = "supporter_minor_preferences"
MINORS_TABLE = "minor"
SUPPORTER_STUDENT_PREFERENCES_TABLE = "supporter_preferences_for_students"
SUPPORTER_TAG_PREFERENCES_TABLE = "supporter_tags"
TAGS_TABLE = "tag_type"
SUPPORTER_SPECIALIZATION_PREFERENCES_TABLE = "supporter_specializations"
SPECIALIZATIONS_TABLE = "specialization_type"
SUPPORTER_TYPES_TABLE = "supporter_type"
MEDIUMS_TABLE = "medium"
SUPPORTER_MEDIUMS_TABLE = "supporter_mediums"

# Currently executeStatement() doesn't support arrayValue.
# So, we pass arrays as strings and then cast them to arrays (ex: :users_ids::int[])
# However, it is expected to be supported in the near future.
# When it becomes available, the code should be updated to use that.

# Methods which are expected to be called multiple times in the same lambda function are designed to use list of identifiers 
# instead of single identifier (user_ids instead of user_id) because that optimizes the program to reduce the number of queries 
# to the backend and saves computation time.

class Supporters:
    @staticmethod
    def get_employer(supporter_ids):
        """ Returns a dictionary with supporter id as key containing string values representing the employer of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, employer FROM {SUPPORTERS_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(supporter_ids, "") # Is every supporter required to have an employer?
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']

        return result
    
    @staticmethod
    def get_title(supporter_ids):
        """ Returns a dictionary with supporter id as key containing string values representing the title of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, title FROM {SUPPORTERS_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(supporter_ids, "") # Is every supporter required to have a title?
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']

        return result
    
    @staticmethod
    def get_feedback(supporter_ids):
        # Not sure what feedback does, so no method description here. Could someone else please add that?

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, feedback FROM {SUPPORTERS_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(supporter_ids, "") # Is every supporter required to have a feedback?
        for record in sql_result:
            if 'booleanValue' in record[1]:
                result[record[0]['longValue']] = record[1]['booleanValue']

        return result

    @staticmethod
    def get_rating(supporter_ids):
        """ Returns a dictionary with supporter id as key containing list of dictionary values representing the rating of the supporter. """
        
        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, rating FROM {SUPPORTERS_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(supporter_ids, "") # Is every supporter required to have a rating?
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def get_teamname(supporter_ids):
        """ Returns a dictionary with supporter id as key containing string values representing the team name of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, team_name FROM {SUPPORTERS_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(supporter_ids, "") # Is every supporter required to have a team name?
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def get_office(supporter_ids):
        # What is office property exactly representing here? Is it office location maybe?
        """ Returns a dictionary with supporter id as key containing string values representing the office of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, office FROM {SUPPORTERS_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = dict.fromkeys(supporter_ids, "") # Is every supporter required to have a office?
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']

        return result

    @staticmethod
    def get_major_preferences(supporter_ids):
        """ Returns a dictionary with supporter id as key containing list of dictionary values representing the major preferences of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, major, smt.major_id FROM {SUPPORTER_MAJOR_PREFERENCES_TABLE} smt, {MAJORS_TABLE} mt WHERE \
            supporter_id = ANY(:supporter_ids::int[]) AND smt.major_id = mt.major_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: [] for supporter_id in supporter_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                    'major': record[1]['stringValue'],
                    'major_id': record[2]['longValue']
            })

        return result

    @staticmethod
    def get_minor_preferences(supporter_ids):
        """ Returns a dictionary with supporter id as key containing list of dictionary values representing the minor preferences of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, minor, smt.minor_id FROM {SUPPORTER_MINOR_PREFERENCES_TABLE} smt, {MINORS_TABLE} mt WHERE \
            supporter_id = ANY(:supporter_ids::int[]) AND smt.minor_id = mt.minor_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: [] for supporter_id in supporter_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                    'minor': record[1]['stringValue'],
                    'minor_id': record[2]['longValue']
            })

        return result

    @staticmethod
    def get_tag_preferences(supporter_ids):
        """ Returns a dictionary with supporter id as key containing list of dictionary values representing the tag preferences of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, tag_type, stt.tag_type_id FROM {SUPPORTER_TAG_PREFERENCES_TABLE} stt, {TAGS_TABLE} tt WHERE \
            supporter_id = ANY(:supporter_ids::int[]) AND stt.tag_type_id = tt.tag_type_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: [] for supporter_id in supporter_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                    'tag': record[1]['stringValue'],
                    'tag_id': record[2]['longValue']
            })

        return result

    @staticmethod
    def get_specialization_preferences(supporter_ids):
        """ Returns a dictionary with supporter id as key containing list of dictionary values representing the specialization topics of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, specialization_type, max_students, duration, sst.specialization_type_id FROM {SUPPORTER_SPECIALIZATION_PREFERENCES_TABLE} sst, {SPECIALIZATIONS_TABLE} st WHERE \
            supporter_id = ANY(:supporter_ids::int[]) AND sst.specialization_type_id = st.specialization_type_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: [] for supporter_id in supporter_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                'specialization_type': record[1]['stringValue'],
                'max_students': record[2]['longValue'],
                'duration': record[3]['longValue'],
                'specialization_id': record[4]['longValue'] 
            })

        return result
    
    @staticmethod
    def get_supporter_mediums(supporter_ids):
        """ Returns a dictionary with supporter id as key containing list of dictionary values representing the mediums of the supporter. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, medium, smt.medium_id FROM {SUPPORTER_MEDIUMS_TABLE} smt, {MEDIUMS_TABLE} mt WHERE \
            supporter_id = ANY(:supporter_ids::int[]) AND smt.medium_id = mt.medium_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: [] for supporter_id in supporter_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                'medium': record[1]['stringValue'],
                'medium_id': record[2]['longValue']
            })
        
        return result

    # Summed up all the supporter preferences into single method because I couldn't think of a single use case where only one of these would be required.
    @staticmethod
    def get_student_preferences(supporter_ids):
        """ Returns a dictionary with supporter id as key containing dictionary representing supporter preferences. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, grad_student, hours_before_appointment FROM {SUPPORTER_STUDENT_PREFERENCES_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: {'hours_before_appointment': 0} for supporter_id in supporter_ids}
        for record in sql_result:
            result[record[0]['longValue']]['grad_student'] = record[1]['booleanValue']
            if 'longValue' in record[2]:
                result[record[0]['longValue']]['hours_before_appointment'] = record[2]['longValue']
        
        return result

    @staticmethod
    def get_supporter_type(supporter_ids):
        """ Returns a dictionary with supporter id as key containing dictionary indicating supporter type. """

        Supporters.__check_type(supporter_ids, list)

        param = [{'name': 'supporter_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in supporter_ids) + '}'}}]
        sql = f"SELECT supporter_id, professional_staff, student_staff, alumni, faculty, other FROM {SUPPORTER_TYPES_TABLE} WHERE supporter_id = ANY(:supporter_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {supporter_id: {} for supporter_id in supporter_ids}
        for record in sql_result:
            supporter_id = record[0]['longValue']
            result[supporter_id]['professional_staff'] = record[1]['booleanValue']
            result[supporter_id]['student_staff'] = record[2]['booleanValue']
            result[supporter_id]['alumni'] = record[3]['booleanValue']
            result[supporter_id]['faculty'] = record[4]['booleanValue']
            result[supporter_id]['other'] = record[5]['booleanValue']
        
        return result
        
    @staticmethod
    def __check_type(variable, type):
        if not isinstance(variable, type):
            raise LambdaException(f"InvalidArgumentException: Expected {type}, found {type(variable)}")