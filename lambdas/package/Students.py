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
STUDENTS_TABLE = "students"
STUDENT_MAJORS_TABLE = "student_majors"
MAJORS_TABLE = "major"
STUDENT_MINORS_TABLE = "student_minors"
MINORS_TABLE = "minor"
STUDENT_COLLEGES_TABLE = "student_college"
COLLEGES_TABLE = "college"

# Currently executeStatement() doesn't support arrayValue.
# So, we pass arrays as strings and then cast them to arrays (ex: :users_ids::int[])
# However, it is expected to be supported in the near future.
# When it becomes available, the code should be updated to use that.

# Methods which are expected to be called multiple times in the same lambda function are designed to use list of identifiers 
# instead of single identifier (user_ids instead of user_id) because that optimizes the program to reduce the number of queries 
# to the backend and saves computation time.

class Students:
    @staticmethod
    def get_grad_yr(student_ids):
        """ Returns a dictionary with student ids as key containing integer values representing the student's graduation year. """

        Students.__check_type(student_ids, list)

        param = [{'name': 'student_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in student_ids) + '}'}}]
        sql = f"SELECT student_id, grad_year FROM {STUDENTS_TABLE} WHERE student_id = ANY(:student_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            if 'longValue' in record[1]:
                result[record[0]['longValue']] = record[1]['booleanValue']
            else:
                result[record[0]['longValue']] = None # Have to figure out what the frontend expects here.

        return result

    @staticmethod
    def set_grad_yr(student_id, grad_yr):
        """ Updates the graduation year of the student with the specified student id. """

        Students.__check_type(student_id, int)
        Students.__check_type(grad_yr, int)

        param = [
            {'name': 'student_id', 'value': {'longValue': student_id}},
            {'name': 'grad_yr', 'value': {'longValue': grad_yr}}
        ]
        
        sql = f"UPDATE {STUDENTS_TABLE} SET grad_yr = :grad_yr WHERE student_id = :student_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_resume(student_ids):
        """ Returns a dictionary with student ids as key containing string values representing the student's resume. """

        Students.__check_type(student_ids, list)

        param = [{'name': 'student_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in student_ids) + '}'}}]
        sql = f"SELECT student_id, resume FROM {STUDENTS_TABLE} WHERE student_id = ANY(:student_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']
            else:
                result[record[0]['longValue']] = "" # Have to figure out what the frontend expects here.

        return result

    @staticmethod
    def set_resume(student_id, resume):
        """ Updates the resume link of the student with the specified student id. """

        Students.__check_type(student_id, int)
        Students.__check_type(resume, str)

        param = [
            {'name': 'student_id', 'value': {'longValue': student_id}},
            {'name': 'resume', 'value': {'stringValue': resume}}
        ]
        
        sql = f"UPDATE {STUDENTS_TABLE} SET resume = :resume WHERE student_id = :student_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_grad_student(student_ids):
        """ Returns a dictionary with student ids as key containing boolean values indicating whether the student is a grad student or not. """

        Students.__check_type(student_ids, list)

        param = [{'name': 'student_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in student_ids) + '}'}}]
        sql = f"SELECT student_id, grad_student FROM {STUDENTS_TABLE} WHERE student_id = ANY(:student_ids::int[])"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {}
        for record in sql_result:
            if 'stringValue' in record[1]:
                result[record[0]['longValue']] = record[1]['stringValue']
            else:
                result[record[0]['longValue']] = "" # Have to figure out what the frontend expects here.

        return result

    @staticmethod
    def set_grad_student(student_id, grad_student):
        """ Updates the grad student property of the student with the specified student id. """

        Students.__check_type(student_id, int)
        Students.__check_type(grad_student, bool)

        param = [
            {'name': 'student_id', 'value': {'longValue': student_id}},
            {'name': 'grad_student', 'value': {'booleanValue': grad_student}}
        ]
        
        sql = f"UPDATE {STUDENTS_TABLE} SET grad_student = :grad_student WHERE student_id = :student_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def get_majors(student_ids):
        """ Returns a dictionary with student id as key containing list of dictionary values representing the majors of the student. """

        Students.__check_type(student_ids, list)

        param = [{'name': 'student_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in student_ids) + '}'}}]
        sql = f"SELECT student_id, major, smt.major_id FROM {STUDENT_MAJORS_TABLE} smt, {MAJORS_TABLE} mt WHERE \
            student_id = ANY(:student_ids::int[]) AND smt.major_id = mt.major_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {student_id: [] for student_id in student_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                'major': record[1]['stringValue'],
                'major_id': record[2]['longValue']
            })

        return result
    
    @staticmethod
    def get_major_id(major_name):
        """ Returns the major id of the major with the specified major name. """

        param = [{'name': 'major_name', 'value': {'stringValue': major_name}}]
        sql = f"SELECT major_id FROM {MAJORS_TABLE} WHERE major = :major_name"
        sql_result = query(sql=sql, parameters=param)['records']
        if sql_result == []:
            return None
        else:
            return sql_result[0][0]['longValue']

    @staticmethod
    def set_majors_by_name(student_id, major_names):
        """ Updates the majors of the student with the specified list of majors. """

        Students.__check_type(major_names, list)

        Students.set_majors_by_id(student_id, [major_id for major_name in major_names if (major_id := Students.get_major_id(major_name)) is not None])

    @staticmethod
    def set_majors_by_id(student_id, major_ids):
        """ Updates the majors of the student with the specified list of majors. """

        Students.__check_type(student_id, int)
        Students.__check_type(major_ids, list)

        Students.delete_all_majors(student_id)
        Students.insert_majors(student_id, major_ids)

    @staticmethod
    def insert_majors(student_id, major_ids):
        """ Inserts majors into the majors list of the student with the specified student id. """
        
        Students.__check_type(student_id, int)
        Students.__check_type(major_ids, list)
        
        param = [
            {'name': 'student_id', 'value': {'longValue': student_id}},
            {'name': 'majors', 'value': {'stringValue': ",".join([f"({student_id}, {major_id})" for major_id in major_ids])}}
        ]
        sql = f"INSERT INTO {STUDENT_MAJORS_TABLE}(student_id, major_id) VALUES :majors"
        query(sql=sql, parameters=param, continueAfterTimeout=True)
    
    @staticmethod
    def delete_all_majors(student_id):
        """ Deletes all majors of the student with the specified student id. """

        Students.__check_type(student_id, int)

        param = [{'name': 'student_id', 'value': {'longValue': student_id}}]
        sql = f"DELETE FROM {STUDENT_MAJORS_TABLE} WHERE student_id = :student_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)
    
    @staticmethod
    def get_minors(student_ids):
        """ Returns a dictionary with student id as key containing list of dictionary values representing the minors of the student. """

        Students.__check_type(student_ids, list)

        param = [{'name': 'student_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in student_ids) + '}'}}]
        sql = f"SELECT student_id, minor, smt.minor_id FROM {STUDENT_MINORS_TABLE} smt, {MINORS_TABLE} mt WHERE \
            student_id = ANY(:student_ids::int[]) AND smt.minor_id = mt.minor_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {student_id: [] for student_id in student_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                'minor': record[1]['stringValue'],
                'minor_id': record[2]['longValue']
            })

        return result
    
    @staticmethod
    def get_minor_id(minor_name):
        """ Returns the minor id of the minor with the specified minor name. """

        param = [{'name': 'minor_name', 'value': {'stringValue': minor_name}}]
        sql = f"SELECT minor_id FROM {MINORS_TABLE} WHERE minor = :minor_name"
        sql_result = query(sql=sql, parameters=param)['records']
        if sql_result == []:
            return None
        else:
            return sql_result[0][0]['longValue']

    @staticmethod
    def set_minors_by_name(student_id, minor_names):
        """ Updates the minors of the student with the specified list of minors. """

        Students.__check_type(minor_names, list)

        Students.set_minors_by_id(student_id, [minor_id for minor_name in minor_names if (minor_id := Students.get_minor_id(minor_name)) is not None])

    @staticmethod
    def set_minors_by_id(student_id, minor_ids):
        """ Updates the minors of the student with the specified list of minors. """

        Students.__check_type(student_id, int)
        Students.__check_type(minor_ids, list)

        Students.delete_all_minors(student_id)
        Students.insert_minors(student_id, minor_ids)

    @staticmethod
    def insert_minors(student_id, minor_ids):
        """ Inserts minors into the minors list of the student with the specified student id. """
        
        Students.__check_type(student_id, int)
        Students.__check_type(minor_ids, list)
        
        param = [
            {'name': 'student_id', 'value': {'longValue': student_id}},
            {'name': 'minors', 'value': {'stringValue': ",".join([f"({student_id}, {minor_id})" for minor_id in minor_ids])}}
        ]
        sql = f"INSERT INTO {STUDENT_MINORS_TABLE}(student_id, minor_id) VALUES :minors"
        query(sql=sql, parameters=param, continueAfterTimeout=True)
    
    @staticmethod
    def delete_all_minors(student_id):
        """ Deletes all minors of the student with the specified student id. """

        Students.__check_type(student_id, int)

        param = [{'name': 'student_id', 'value': {'longValue': student_id}}]
        sql = f"DELETE FROM {STUDENT_MINORS_TABLE} WHERE student_id = :student_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)
    
    @staticmethod
    def get_colleges(student_ids):
        """ Returns a dictionary with student id as key containing list of dictionary values representing the colleges of the student. """

        Students.__check_type(student_ids, list)

        param = [{'name': 'student_ids', 'value': {'stringValue': '{' + ','.join(str(id) for id in student_ids) + '}'}}]
        sql = f"SELECT student_id, college, sct.college_id FROM {STUDENT_COLLEGES_TABLE} sct, {COLLEGES_TABLE} ct WHERE \
            student_id = ANY(:student_ids::int[]) AND sct.college_id = ct.college_id"
        sql_result = query(sql=sql, parameters=param)['records']
        result = {student_id: [] for student_id in student_ids}
        for record in sql_result:
            result[record[0]['longValue']].append({
                'college': record[1]['stringValue'],
                'college_id': record[2]['longValue']
            })

        return result
    
    @staticmethod
    def get_college_id(college_name):
        """ Returns the college id of the college with the specified college name. """

        param = [{'name': 'college', 'value': {'stringValue': college_name}}]
        sql = f"SELECT college_id FROM {COLLEGES_TABLE} WHERE college = :college"
        sql_result = query(sql=sql, parameters=param)['records']
        if sql_result == []:
            return None
        else:
            return sql_result[0][0]['longValue']

    @staticmethod
    def set_colleges_by_name(student_id, college_names):
        """ Updates the colleges of the student with the specified list of colleges. """

        Students.__check_type(college_names, list)

        Students.set_colleges_by_id(student_id, [college_id for college_name in college_names if (college_id := Students.get_college_id(college_name)) is not None])

    @staticmethod
    def set_colleges_by_id(student_id, college_ids):
        """ Updates the colleges of the student with the specified list of colleges. """

        Students.__check_type(student_id, int)
        Students.__check_type(college_ids, list)

        Students.delete_all_colleges(student_id)
        Students.insert_colleges(student_id, college_ids)

    @staticmethod
    def insert_colleges(student_id, college_ids):
        """ Inserts colleges into the colleges list of the student with the specified student id. """
        
        Students.__check_type(student_id, int)
        Students.__check_type(college_ids, list)
        
        param = [
            {'name': 'student_id', 'value': {'longValue': student_id}},
            {'name': 'colleges', 'value': {'stringValue': ",".join([f"({student_id}, {college_id})" for college_id in college_ids])}}
        ]
        sql = f"INSERT INTO {STUDENT_COLLEGES_TABLE}(student_id, college_id) VALUES :colleges"
        query(sql=sql, parameters=param, continueAfterTimeout=True)
    
    @staticmethod
    def delete_all_colleges(student_id):
        """ Deletes all colleges of the student with the specified student id. """

        Students.__check_type(student_id, int)

        param = [{'name': 'student_id', 'value': {'longValue': student_id}}]
        sql = f"DELETE FROM {STUDENT_COLLEGES_TABLE} WHERE student_id = :student_id"
        query(sql=sql, parameters=param, continueAfterTimeout=True)

    @staticmethod
    def __check_type(variable, type):
        if not isinstance(variable, type):
            raise LambdaException(f"InvalidArgumentException: Expected {type}, found {type(variable)}")