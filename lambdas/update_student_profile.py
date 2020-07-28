import boto3
from package.query_db import query
from package.dictionary_to_list import dictionary_to_list
from package.lambda_exception import LambdaException

#Authors: Victoria Caruso and Hadley Pope
#Date: 4/9/20

#function updates the student profile details in the database
def update_student_profile(event, context):
    # Student identifier
    if 'student_id' in event:
        student_id = int(event['student_id'])
    else:
        raise LambdaException("Invalid input: No user Id")

    student_id = int(event['student_id'])
    student_id_param = {'name' : 'student_id', 'value' : {'longValue' : student_id}}

    #Check if supporter exists
    sql = 'SELECT * FROM students WHERE student_id = :student_id;'
    supporter_id_param = {'name': 'student_id', 'value': {'longValue': student_id}}
    response = query(sql, [supporter_id_param])
    if(response['records'] == []):
        raise LambdaException("404: Student does not exist")


    link_id_list = []
    if 'links' in event:
        links_list = event['links']
        
        #Check if link_type exists, and convert to link_id
        for link_type_list in links_list:
            sql = 'SELECT link_id FROM link WHERE link_type = :link_type;'
            sql_parameters = [{'name': 'link_type', 'value': {'stringValue': link_type_list[0]}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: link_id:" + str(entry) + " does not exist")
            else:
                link_id_list.append((response['records'][0][0]['longValue'], link_type_list[1]))

    #User links
    #Execute parameterized query to delete supporter's old links
    if len(link_id_list) > 0:
        sql = "DELETE FROM user_link WHERE user_id = :student_id;"
        try:
            query(sql, [student_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete links" + str(e))
    
        #Execute parameterized queries for updating links
        for link_id, link in link_id_list:
            sql = 'INSERT INTO user_link (user_id, link_id, link) VALUES (:student_id, :link_id, :link);'
            sql_parameters = [student_id_param, {'name': 'link_id', 'value': {'longValue': link_id}}, {'name': 'link', 'value': {'stringValue': link}}]
            major_response = query(sql, sql_parameters)
            if(major_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: User links not updated")


    #Student Colleges
    college_id_list = []
    if 'colleges' in event:
        college_list = event['colleges']
        
        #Check if college_id exists
        for entry in college_list:
            sql = 'SELECT college_id FROM college WHERE college = :college;'
            sql_parameters = [{'name': 'college', 'value': {'stringValue': entry}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: college_id:" + str(entry) + " does not exist")
            else:
                college_id_list.append(response['records'][0][0]['longValue'])

    #Execute parameterized query to delete student's old colleges
    if len(college_id_list) > 0:
        sql = 'DELETE FROM student_college WHERE student_id = :student_id;'
        try:
            query(sql, [student_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete student colleges, " + str(e))
    
        #Execute parameterized queries for updating major preferences
        for entry in college_id_list:
            sql = 'INSERT INTO student_college (student_id, college_id) VALUES (:student_id, :college_id);'
            sql_parameters = [student_id_param, {'name': 'college_id', 'value': {'longValue': entry}}]
            college_response = query(sql, sql_parameters)
            if(college_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: student_colleges not updated")      


    #Student Majors
    major_id_list = []
    if 'majors' in event:
        major_list = event['majors']
        
        #Check if major_id exists
        for entry in major_list:
            sql = 'SELECT major_id FROM major WHERE major = :major;'
            sql_parameters = [{'name': 'major', 'value': {'stringValue': entry}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: major_id: " + str(entry) + " does not exist")
            else:
                major_id_list.append(response['records'][0][0]['longValue'])

    #Execute parameterized query to delete student's old majors
    if len(major_id_list) > 0:
        sql = 'DELETE FROM student_majors WHERE student_id = :student_id;'
        try:
            query(sql, [student_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete student majors, " + str(e))
    
        #Execute parameterized queries for updating major preferences
        for entry in major_id_list:
            sql = 'INSERT INTO student_majors (student_id, major_id) VALUES (:student_id, :major_id);'
            sql_parameters = [student_id_param, {'name': 'major_id', 'value': {'longValue': entry}}]
            major_response = query(sql, sql_parameters)
            if(major_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: student_majors majors not updated")

    
    #Student Minors
    minor_id_list = []
    if 'minors' in event:
        minor_list = event['minors']
        
        #Check if minor_id exists
        for entry in minor_list:
            sql = 'SELECT minor_id FROM minor WHERE minor = :minor;'
            sql_parameters = [{'name': 'minor', 'value': {'stringValue': entry}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: minor_id:" + str(entry) + " does not exist")
            else:
                minor_id_list.append(response['records'][0][0]['longValue'])

    #Execute parameterized query to delete supporter's old minor preferences
    if len(minor_id_list) > 0:
        sql = 'DELETE FROM student_minors WHERE student_id = :student_id;'
        try:
            query(sql, [supporter_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete student minors")
    
        for entry in minor_id_list:
            sql = 'INSERT INTO student_minors (student_id, minor_id) VALUES (:student_id, :minor_id);'
            sql_parameters = [student_id_param, {'name': 'minor_id', 'value': {'longValue': entry}}]
            minor_response = query(sql, sql_parameters)
            if(minor_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: student_minors not updated")


    #User settings
    user_settings = {}
    updated_user_vals = []

    if event['first_name'] != "":
        first_name = event['first_name']
        user_settings['first_name'] = first_name
        updated_user_vals.append("first_name = :first_name")

    if event['last_name'] != "":        
        last_name = event['last_name']
        user_settings['last_name'] = last_name
        updated_user_vals.append("last_name = :last_name")
        
    if event['email'] != "":
        email = event['email']
        user_settings['email'] = email
        updated_user_vals.append("email = :email")

    if event['preferred_name'] != "":
        preferred_name = event['preferred_name']
        user_settings['preferred_name'] = preferred_name
        updated_user_vals.append("preferred_name = :preferred_name")

    if event['bio'] != "":
        bio = event['bio']
        user_settings['bio'] = bio
        updated_user_vals.append("bio = :bio")

    if event['pronouns'] != "":
        pronouns = event['pronouns']
        user_settings['pronouns'] = pronouns
        updated_user_vals.append("pronouns = :pronouns")
        
    if event['gender'] != "":
        gender = event['gender']
        user_settings['gender'] = gender
        updated_user_vals.append("gender = :gender")

    if event['phone'] != "":
        phone = event['phone']
        user_settings['phone'] = phone
        updated_user_vals.append("phone = :phone")

    user_settings_sql = "UPDATE users SET " + ", ".join(updated_user_vals) + " WHERE id = :student_id;"
    user_settings_params = dictionary_to_list(user_settings) 
    user_settings_params.append(supporter_id_param)

    if len(updated_user_vals) > 0:
        try:
            query(user_settings_sql, user_settings_params)
        except Exception as e:
            raise LambdaException("500: Unable to update users table, " + str(e))

    # Profile Picture
    if event['picture'] != "":
        upload_profile_picture(student_id, event['picture'])

    # Student Settings
    student_settings = {}
    updated_student_vals = []

    if event['grad_student'] != "":
        grad_student = event['grad_student'].lower()

        if grad_student == "true":
            grad_student_bool = True
        else:
            grad_student_bool = False

        student_settings['grad_student'] = grad_student_bool
        updated_student_vals.append("grad_student = :grad_student")

    if event['grad_year'] != "":
        grad_year = int(event['grad_year'])
        student_settings['grad_year'] = grad_year
        updated_student_vals.append("grad_year = :grad_year")

    if event['resume'] != "":
        resume = event['resume']
        student_settings['resume'] = resume
        updated_student_vals.append("resume = :resume")

    student_settings_sql = "UPDATE students SET " + ", ".join(updated_student_vals) + " WHERE student_id = :student_id;"
    student_settings_params = dictionary_to_list(student_settings)
    student_settings_params.append(student_id_param)

    if len(updated_student_vals) > 0:
        try:
            query(student_settings_sql, student_settings_params)
        except Exception as e:
            raise LambdaException("500: Failed to update students table, " + str(e))


    print("Updated Student Profile")
    return {
        'body' : "Successfully updated student profile"
    }

def upload_profile_picture(student_id, picData):
    s_3 = boto3.client('s3')
    bucket_name_images = 't1-s3-us-east-1-images' # s3 bucket for images
    file_path = 'profile/' + str(student_id) + '/image'

    try:
        s_3.put_object(Bucket=bucket_name_images, Key=file_path, Body=picData)
    except Exception as e:
        raise LambdaException("400: Failed to upload file. " + str(e))