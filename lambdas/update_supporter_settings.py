#Written by Nhan Le and Hadley Pope

import boto3
from package.query_db import query
from package.lambda_exception import LambdaException
from package.dictionary_to_list import dictionary_to_list
import json

#Function to update a supporter's settings
#Inputs: first_name, last_name, email, preferred_name, picture, bio, pronouns, gender, phone, 
#        id, employer, title, team_name, office,
#        hours_before_appointment, grad_student,
#        specialization_type, max_students, duration,
#        list of link_type/link pairs, notification_preferences,
#        list of tag_types, list of major preferences, list of minor preferences,
#        list of supporter types         
#Output: 200 OK

def update_supporter_settings(event, context):

    supporter_id = int(event['id'])

    #Check if supporter exists
    sql = 'SELECT * FROM supporters WHERE supporter_id = :supporter_id;'
    supporter_id_param = {'name': 'supporter_id', 'value': {'longValue': supporter_id}}
    response = query(sql, [supporter_id_param])
    if(response['records'] == []):
        raise LambdaException("404: Supporter does not exist")
        
        
    spec_type_id_list = []
    if 'specializations' in event:
        specializations = event['specializations']
        
        #Check if specialization_type exists, and convert to specialization_type_ids
        for spec_type_list in specializations:
            
            spec_type = spec_type_list[0]
            duration = spec_type_list[1]
            max_students = spec_type_list[2]
            
            sql = "SELECT specialization_type_id FROM specialization_type WHERE specialization_type = :specialization_type;"
            sql_parameters = [{'name' : 'specialization_type', 'value' : {'stringValue' : spec_type}}]
            response = query(sql, sql_parameters)
            if(response['records'] == []):
                raise LambdaException("404: specialization_type: " + spec_type + " does not exist")
            else:
                spec_type_id_list.append((response['records'][0][0]['longValue'], duration, max_students))
            

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


    tag_type_id_list = []
    if 'tags' in event and len(event['tags']) > 0:
        tag_type_list = event['tags']
        
        #Check if tag_type exists, and convert to tag_type_id
        for entry in tag_type_list:
            sql = 'SELECT tag_type_id FROM tag_type WHERE tag_type = :tag_type;'
            sql_parameters = [{'name': 'tag_type', 'value': {'stringValue': entry}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: tag_type_id:" + str(entry) + " does not exist")
            else:
                tag_type_id_list.append(response['records'][0][0]['longValue'])


    major_id_list = []
    if 'major_preferences' in event:
        major_list = event['major_preferences']
        
        #Check if major_id exists
        for entry in major_list:
            sql = 'SELECT major_id FROM major WHERE major = :major;'
            sql_parameters = [{'name': 'major', 'value': {'stringValue': entry}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: major_id:" + str(entry) + " does not exist")
            else:
                major_id_list.append(response['records'][0][0]['longValue'])

    
    minor_id_list = []
    if 'minor_preferences' in event:
        minor_list = event['minor_preferences']
        
        #Check if minor_id exists
        for entry in minor_list:
            sql = 'SELECT minor_id FROM minor WHERE minor = :minor;'
            sql_parameters = [{'name': 'minor', 'value': {'stringValue': entry}}]
            response = query(sql, sql_parameters)
            if(response['records'] ==[]):
                raise LambdaException("404: minor_id:" + str(entry) + " does not exist")
            else:
                minor_id_list.append(response['records'][0][0]['longValue'])


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

    if event['preferred_name'] != "":
        preferred_name = event['preferred_name']
        user_settings['preferred_name'] = preferred_name
        updated_user_vals.append("preferred_name = :preferred_name")

    #Profile Picture
    if event['picture'] != "":
        upload_profile_picture(supporter_id, event['picture'])

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

    user_settings_sql = "UPDATE users SET " + ", ".join(updated_user_vals) + " WHERE id = :supporter_id;"
    user_settings_params = dictionary_to_list(user_settings) 
    user_settings_params.append(supporter_id_param)

    if len(updated_user_vals) > 0:
        try:
            query(user_settings_sql, user_settings_params)
        except Exception as e:
            raise LambdaException("500: Unable to update users table, " + str(e))


    #Supporter Settings
    supporter_settings = {}
    updated_supporter_vals = []

    if event['employer'] != "":
        employer = event['employer']
        supporter_settings['employer'] = employer
        updated_supporter_vals.append("employer = :employer")

    if event['title'] != "":
        title = event['title']
        supporter_settings['title'] = title
        updated_supporter_vals.append("title = :title")

    if event['team_name'] != "":
        team_name = event['team_name']
        supporter_settings['team_name'] = team_name
        updated_supporter_vals.append("team_name = :team_name")

    if event['office'] != "":
        office = event['office']
        supporter_settings['office'] = office
        updated_supporter_vals.append("office = :office")

    supporter_settings_sql = "UPDATE supporters SET " + ", ".join(updated_supporter_vals) + " WHERE supporter_id = :supporter_id;"
    supporter_settings_params = dictionary_to_list(supporter_settings)
    supporter_settings_params.append(supporter_id_param)

    if len(updated_supporter_vals) > 0:
        try:
            query(supporter_settings_sql, supporter_settings_params)
        except Exception as e:
            raise LambdaException("500: Unable to update supporter settings, " + str(e))


    #Supporter Preferences for Students
    supporter_student_prefs = {}
    updated_student_prefs = []

    if event['grad_student'] != "":
        
        grad_student = event['grad_student'].lower()
        
        if grad_student == "true":
            grad_student_bool = True
        else:
            grad_student_bool = False
            
        supporter_student_prefs['grad_student'] = grad_student_bool
        updated_student_prefs.append("grad_student = :grad_student")

    if event['hours_before_appointment'] != "":
        hours_before_appointment = event['hours_before_appointment']
        supporter_student_prefs['hours_before_appointment'] = hours_before_appointment
        updated_student_prefs.append("hours_before_appointment = :hours_before_appointment")

    student_prefs_sql = "UPDATE supporter_preferences_for_students SET " + ", ".join(updated_student_prefs) + " WHERE supporter_id = :supporter_id;"
    student_prefs_params = dictionary_to_list(supporter_student_prefs)
    student_prefs_params.append(supporter_id_param)

    if len(updated_student_prefs) > 0:
        try:
            query(student_prefs_sql, student_prefs_params)
        except Exception as e:
            raise LambdaException("500: Unable to update supporter preferences for students, " + str(e))
            
            
    #Supporter Specializations
    #Execute parameterized query to delete supporter's old specializations
    if len(spec_type_id_list) > 0:
        sql = "DELETE FROM supporter_specializations WHERE supporter_id = :supporter_id;"
        try:
            query(sql, [supporter_id_param])
        except Except as e:
            raise LambdaException("500 Unable to delete supporter specializations, " + str(e))
            
        #Execute parameterized queries for updating supporter specializations
        for spec_type_id, duration, max_students in spec_type_id_list:
            sql = "INSERT INTO supporter_specializations (supporter_id, specialization_type_id, duration, max_students) VALUES (:supporter_id, :spec_type_id, :duration, :max_students);"
            sql_parameters = [supporter_id_param, {'name' : 'spec_type_id', 'value' : {'longValue' : spec_type_id}}, {'name' : 'duration', 'value' : {'longValue' : duration}}, {'name' : 'max_students', 'value' : {'longValue' : max_students}}]
            supporter_spec_response = query(sql, sql_parameters)
            if supporter_spec_response['numberOfRecordsUpdated'] == 0:
                raise LambdaException("409: Supporter specializations not updated")

    
    #User links
    #Execute parameterized query to delete supporter's old links
    if len(link_id_list) > 0:
        sql = "DELETE FROM user_link WHERE user_id = :supporter_id;"
        try:
            query(sql, [supporter_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete links" + str(e))
    
        #Execute parameterized queries for updating links
        for link_id, link in link_id_list:
            sql = 'INSERT INTO user_link(user_id, link_id, link) VALUES (:supporter_id, :link_id, :link);'
            sql_parameters = [{'name': 'supporter_id', 'value': {'longValue': supporter_id}}, {'name': 'link_id', 'value': {'longValue': link_id}}, {'name': 'link', 'value': {'stringValue': link}}]
            major_response = query(sql, sql_parameters)
            if(major_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: User links not updated")



    #Notification preferences

    #notifications_queries stores sql queries and their parameters as tuples
    #As of 4/29 only email notifications are supported
    notifications_queries = []


    #Supporter Tags
    #Execute parameterized query to delete supporter's old tags
    if len(tag_type_id_list) > 0:
        sql = "DELETE FROM supporter_tags WHERE supporter_id = :supporter_id;"
        try:
            query(sql, [supporter_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete tags")
    
        #Execute parameterized queries for updating tags
        for entry in tag_type_id_list:
            sql = 'INSERT INTO supporter_tags(supporter_id, tag_type_id) VALUES (:supporter_id, :tag_type_id);'
            sql_parameters = [{'name': 'supporter_id', 'value': {'longValue': supporter_id}}, {'name': 'tag_type_id', 'value': {'longValue': entry}}]
            major_response = query(sql, sql_parameters)
            if(major_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: supporter_tags majors not updated")
    

    #Execute parameterized query to delete supporter's old major preferences
    if len(major_id_list) > 0:
        sql = 'DELETE FROM supporter_major_preferences WHERE supporter_id = :supporter_id;'
        try:
            query(sql, [supporter_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete major preferences, " + str(e))
    
        #Execute parameterized queries for updating major preferences
        for entry in major_id_list:
            sql = 'INSERT INTO supporter_major_preferences(supporter_id, major_id) VALUES (:supporter_id, :major_id);'
            sql_parameters = [{'name': 'supporter_id', 'value': {'longValue': supporter_id}}, {'name': 'major_id', 'value': {'longValue': entry}}]
            major_response = query(sql, sql_parameters)
            if(major_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: supporter_major_preferences majors not updated")


    #Execute parameterized query to delete supporter's old minor preferences
    if len(minor_id_list) > 0:
        print("CHANGE YO MINOR")
        sql = 'DELETE FROM supporter_minor_preferences WHERE supporter_id = :supporter_id;'
        try:
            query(sql, [supporter_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to delete minor preferences")
    
        for entry in minor_id_list:
            print(entry)
            sql = 'INSERT INTO supporter_minor_preferences(supporter_id, minor_id) VALUES (:supporter_id, :minor_id);'
            sql_parameters = [{'name': 'supporter_id', 'value': {'longValue': supporter_id}}, {'name': 'minor_id', 'value': {'longValue': entry}}]
            minor_response = query(sql, sql_parameters)
            print(minor_response)
            if(minor_response["numberOfRecordsUpdated"] == 0):
                raise LambdaException("409: supporter_minorr_preferences minors not updated")


    #Update supporter types
    if event['supporter_types'] != []:

        supporter_types = event['supporter_types']

        updated_supporter_types = []
        if "Professional Staff" in supporter_types:
            updated_supporter_types.append("professional_staff = true")
        
        if "Student Staff" in supporter_types:
            updated_supporter_types.append("student_staff = true")

        if "Alumni" in supporter_types:
            updated_supporter_types.append("alumni = true")
        
        if "Faculty" in supporter_types:
            updated_supporter_types.append("faculty = true")

        if "Other" in supporter_types:
            updated_supporter_types.append("other = true")

        supporter_types_sql = "UPDATE supporter_type SET " + ", ".join(updated_supporter_types) + " WHERE supporter_id = :supporter_id;"
        try:
            query(supporter_types_sql, [supporter_id_param])
        except Exception as e:
            raise LambdaException("500: Unable to update supporter_types, " + str(e))
            
    
    return {
        'body': "Successfully updated supporter settings"
    }

def upload_profile_picture(id, picData):
    s_3 = boto3.client('s3')
    bucket_name_images = 't1-s3-us-east-1-images' # s3 bucket for images
    file_path = 'profile/' + str(id) + '/image'

    try:
        s_3.put_object(Bucket=bucket_name_images, Key=file_path, Body=picData)
    except Exception as e:
        raise LambdaException("400: Failed to upload file. " + str(e))