import boto3
from package.query_db import query
from package.lambda_exception import LambdaException

def get_student_settings_handler(event, context):

    student_id = int(event['student_id'])
    student_id_param = [{'name' : 'student_id', 'value' : {'longValue' : student_id}}]

    student_sql = "SELECT user_id FROM students WHERE student_id = :student_id"
    try:
        existing_student = query(student_sql, student_id_param)['records']

    except Exception as e:
        raise LambdaException("500: Unable to confirm that student exists, " + str(e))

    if len(existing_student) <= 0:
            raise LambdaException("404: Student does not exist")

    response = {}
    error_messages = []

    users_sql = "SELECT first_name, last_name, email, preferred_name, bio, pronouns, gender, phone FROM users WHERE id = :student_id;"
    user_data = []
    try:
        user_data = query(users_sql, student_id_param)['records'][0]

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 16")

    response['first_name'] = user_data[0]['stringValue']
    response['last_name'] = user_data[1]['stringValue']
    response['email'] = user_data[2]['stringValue']
    
    if 'stringValue' in user_data[3]:
        response['preferred_name'] = user_data[3]['stringValue']
    else:
        response['preferred_name'] = None
        
    if 'stringValue' in user_data[4]: 
        response['bio'] = user_data[4]['stringValue']
    else:
        response['bio'] = None
    
    if 'stringValue' in user_data[5]:    
        response['pronouns'] = user_data[5]['stringValue']
    else:
        response['pronouns'] = None
        
    if 'stringValue' in user_data[6]:    
        response['gender'] = user_data[6]['stringValue']
    else:
        response['pronouns'] = None
        
    if 'stringValue' in user_data[7]:    
        response['phone'] = user_data[7]['stringValue']
    else:
        response['phone'] = None    

    response['picture'] = get_profile_picture(student_id)
    
    students_sql = "SELECT grad_year, resume, grad_student FROM students WHERE student_id = :student_id;"
    student_data = []
    try:
        student_data = query(students_sql, student_id_param)['records'][0]

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 60")

    if 'longValue' in student_data[0]:    
        response['grad_year'] = student_data[0]['longValue']
    else:
        response['grad_year'] = None
        
    if 'stringValue' in student_data[1]:
        response['resume'] = student_data[1]['stringValue']
    else:
        response['resume'] = None
        
    if 'booleanValue' in student_data[2]:
        response['grad_student'] = student_data[2]['booleanValue']
    else:
        response['grad_student'] = None


    colleges_sql = "SELECT college FROM college C, student_college SC WHERE SC.student_id = :student_id AND C.college_id = SC.college_id"    
    try:
        colleges_data = query(colleges_sql, student_id_param)['records']

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 81")

    colleges = []
    if len(colleges_data) > 0:
        for college in colleges_data:
            colleges.append(college[0]['stringValue'])
        response['college'] = colleges
    else:
        response['college'] = None


    links_sql = "SELECT link_id FROM user_link WHERE user_id = :student_id"
    student_link_ids = []
    try:
        student_link_ids = query(links_sql, student_id_param)['records']

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 98")

    if len(student_link_ids) > 0:
        student_link_ids = student_link_ids[0]
        link_ids = str(student_link_ids[0]['longValue'])
        for link_id in student_link_ids[1:]:
            link_ids += " OR link_id" + str(link_id['longValue'])

        student_links_sql = "SELECT link_type FROM link WHERE link_id = " + link_ids + ";"
        print(student_links_sql)
        try:
            student_links = query(student_links_sql)['records'][0]

        except Exception as e:
            error_messages.append(str(e) + " get_student_settings.py, line 111")

        links = []
        for link in student_links:
            links.append(link['stringValue'])

        response['links'] = links


    majors_sql = "SELECT major_id FROM student_majors WHERE student_id = :student_id;"
    student_major_ids = []
    try:
        student_major_ids = query(majors_sql, student_id_param)['records']
        
    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 126")

    if len(student_major_ids) > 0:
        student_major_ids = student_major_ids[0]
        major_ids = str(student_major_ids[0]['longValue'])
        for major_id in student_major_ids[1:]:
            major_ids += " OR major_id = " + str(major_id['longValue'])
            
        student_majors_sql = "SELECT major FROM major WHERE major_id = " + major_ids + ";"
        try:
            student_majors = query(student_majors_sql)['records'][0] 

        except Exception as e:
            error_messages.append(str(e) + " get_student_settings.py, line 139")

        majors = []
        for major in student_majors:
            majors.append(major['stringValue'])

        response['major'] = majors
                
    else:
        response['major'] = None


    minors_sql = "SELECT minor_id FROM student_minors WHERE student_id = :student_id;"
    student_minor_ids = []
    try:
        student_minor_ids = query(minors_sql, student_id_param)['records']

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 157")

    if len(student_minor_ids) > 0:
        student_minor_ids = student_minor_ids[0]
        minor_ids = str(student_minor_ids[0]['longValue'])
        for minor_id in student_minor_ids[1:]:
            minor_ids += " OR minor_id = " + str(minor_id['longValue'])
            
        student_minors_sql = "SELECT minor FROM minor WHERE minor_id = " + minor_ids + ";"
        try:
            student_minors = query(student_minors_sql)['records'][0]

        except Exception as e:
            error_messages.append(str(e) + " get_student_settings.py, line 170")

        minors = []
        for minor in student_minors:
            minors.append(minor['stringValue'])

        response['minor'] = minors 
                
    else:
        response['minor'] = None


    notification_sql = "SELECT notification_type_id FROM notification_preferences WHERE user_id = :student_id;"
    notification_type_ids = []
    try:
        notification_type_ids = query(notification_sql, student_id_param)['records']

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 187")

    if len(notification_type_ids) > 0:
        notification_type_ids = notification_type_ids[0]
        notification_ids = str(notification_type_ids[0]['longValue'])
        for notification_id in notification_type_ids[1:]:
            notification_ids += " OR notification_type_id = " + str(notification_id['longValue'])

        student_notification_pref_sql = "SELECT notification_type_name FROM notification_type WHERE notification_type_id = " + notification_ids + ";"
        try:
            student_notification_prefs = query(student_notification_pref_sql)['records']
        except Exception as e:
            error_messages.append(str(e) + " get_student_settings.py, line 199")

        notification_prefs = []
        for pref in notification_prefs:
            notification_prefs.append(pref['stringValue'])

        response['notification_preferences'] = notification_prefs

    if len(error_messages) > 0:
        response['statusCode'] = 500
        response['errorMessage'] = error_messages
        return response
    else:
        response['statusCode'] = 200
        return response

def get_profile_picture(student_id):
    s_3 = boto3.client('s3')
    bucket_name_images = 't1-s3-us-east-1-images' # s3 bucket for images
    file_path = 'profile/' + str(student_id) + '/image'

    try:
        response = s_3.get_object(Bucket=bucket_name_images, Key=file_path)
    except Exception as e:
        if(e.response['Error']['Code'] == "NoSuchKey"):
            return ""
        else:
            raise LambdaException("400: Failed to download file." + str(e))

    return response['Body'].read().decode('utf-8')
