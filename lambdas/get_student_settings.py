from package.query_db import query

def get_student_settings_handler(event, context):

    student_id = int(event['student_id'])
    student_id_param = [{'name' : 'student_id', 'value' : {'longValue' : student_id}}]

    response = {}
    error_messages = []

    users_sql = "SELECT first_name, last_name, email, preferred_name, picture, bio, pronouns, gender, phone FROM users WHERE id = :student_id;"
    try:
        user_data = query(users_sql, student_id_param)['records'][0]

        response['first_name'] = user_data[0]['stringValue']
        response['last_name'] = user_data[1]['stringValue']
        response['email'] = user_data[2]['stringValue']
        
        if 'stringValue' in user_data[3]:
            response['preferred_name'] = user_data[3]['stringValue']
        else:
            response['preferred_name'] = None
            
        if 'stringValue' in user_data[4]: 
            response['picture'] = user_data[4]['stringValue']
        else:
            response['picture'] = None
            
        if 'stringValue' in user_data[5]: 
            response['bio'] = user_data[5]['stringValue']
        else:
            response['bio'] = None
        
        if 'stringValue' in user_data[6]:    
            response['pronouns'] = user_data[6]['stringValue']
        else:
            response['pronouns'] = None
            
        if 'stringValue' in user_data[7]:    
            response['gender'] = user_data[7]['stringValue']
        else:
            response['pronouns'] = None
            
        if 'stringValue' in user_data[8]:    
            response['phone'] = user_data[8]['stringValue']
        else:
            response['phone'] = None

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 26")


    students_sql = "SELECT college, grad_year, resume, grad_student FROM students WHERE student_id = :student_id;"
    try:
        student_data = query(students_sql, student_id_param)['records'][0]
        
        if 'stringValue' in student_data[0]:
            response['college'] = student_data[0]['stringValue']
        else:
            response['college'] = None
            
        if 'stringValue' in student_data[1]:    
            response['grad_year'] = student_data[1]['longValue']
        else:
            response['grad_year'] = None
            
        if 'stringValue' in student_data[2]:
            response['resume'] = student_data[2]['stringValue']
        else:
            response['resume'] = None
            
        if 'stringValue' in student_data[3]:
            response['grad_student'] = student_data[3]['booleanValue']
        else:
            response['grad_student'] = None

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 40")


    colleges_sql = "SELECT college FROM college C, student_college SC WHERE SC.student_id = :student_id AND C.college_id = SC.college_id"    
    try:
        colleges_data = query(colleges_sql, student_id_param)['records']
        colleges = []
        for college in colleges_data:
            colleged.append(college['stringValue'])

        if len(colleges) > 0:
            response['college'] = colleges
        else:
            response['college'] = None

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 86")


    links_sql = "SELECT link_id FROM user_link WHERE user_id = :student_id"
    try:
        student_link_ids = query(links_sql, student_id_param)['records']
        if len(student_link_ids) > 0:
            link_ids = student_link_ids[0]['longValue']
            for link_id in student_link_ids[1:]:
                link_ids += " OR link_id" + link_id['longValue']

            student_links_sql = "SELECT link FROM link WHERE link_id = " + link_ids + ';'
            try:
                student_links = query(student_links_sql)['records']
                links = []
                for link in student_links:
                    links.append(link['stringValue'])

                response['links'] = links

            except Exception as e:
                error_messages.append(str(e) + " get_student_settings.py, line 61")

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 64")


    majors_sql = "SELECT major_id FROM student_majors WHERE student_id = :student_id;"
    try:
        student_major_ids = query(majors_sql, student_id_param)['records']
        if len(student_major_ids) > 0:
            major_ids = student_major_ids[0]['longValue']
            for major_id in student_major_ids[1:]:
                major_ids += " OR major_id = " + major_id['longValue']
        else:
            response['major'] = None
    
            student_majors_sql = "SELECT major FROM major WHERE major_id = " + major_ids + ";"
            try:
                student_majors = query(student_majors_sql)['records'] 
                majors = []
                for major in student_majors:
                    majors.append(major['stringValue'])
    
                response['major'] = majors
    
            except Exception as e:
                error_messages.append(str(e) + " get_student_settings.py, line 84")

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 87")


    minors_sql = "SELECT minor_id FROM student_minors WHERE student_id = :student_id;"
    try:
        student_minor_ids = query(minors_sql, student_id_param)['records']
        if len(student_minor_ids) > 0:
            minor_ids = student_minor_ids[0]['longValue']
            for minor_id in student_minor_ids[1:]:
                minor_ids += " OR minor_id = " + minor_id['longValue']
        else:
            response['minor'] = None
    
            student_minors_sql = "SELECT minor FROM minor WHERE minor_id = " + minor_ids + ";"
            try:
                student_minors = query(student_minors_sql)['records']
                minors = []
                for minor in student_minors:
                    minors.append(minor['stringValue'])
    
                response['minor'] = minors 
    
            except Exception as e:
                error_messages.append(str(e) + " get_student_settings.py, line 107")

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 110")


    notification_sql = "SELECT notification_type_id FROM notification_preferences WHERE user_id = :student_id;"
    try:
        notification_type_ids = query(notification_sql, student_id_param)['records']
        if len(notification_type_ids) > 0:
            notification_ids = notification_type_ids[0]['longValue']
            for notification_id in notification_type_ids[1:]:
                notification_ids += " OR notification_type_id = " + notification_id['longValue']
    
            student_notification_pref_sql = "SELECT notification_type_name FROM notification_type WHERE notification_type_id = " + notification_ids + ";"
            try:
                student_notification_prefs = query(student_notification_pref_sql)['records']
                notification_prefs = []
                for pref in notification_prefs:
                    notification_prefs.append(pref['stringValue'])
    
                response['notification_preferences'] = notification_prefs
    
            except Exception as e:
                error_messages.append(str(e) + " get_student_settings.py, line 130")

    except Exception as e:
        error_messages.append(str(e) + " get_student_settings.py, line 133")



    if len(error_messages) > 0:
        response['statusCode'] = 500
        response['errorMessage'] = error_messages
        return response
    else:
        response['statusCode'] = 200
        return response