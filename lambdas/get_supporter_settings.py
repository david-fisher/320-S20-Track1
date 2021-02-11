# Written by Nhan Le
# Modified by Ish Chhabra

from package.Users import Users
from package.Supporters import Supporters
from package.query_db import query
from package.lambda_exception import LambdaException

#Function to update a supporter's settings
#Inputs: supporter_id
#Output: first_name, preferred_name, last_name, email, pronouns, gender, link, 
#        phone, bio, picture, employer, title, team_name, professional_staff, student_staff,
#        alumni, faculty, other, list of tags, list of specialization_types, 
#        notification_type_name, feedback, list of supporter_preferences_for_student,
#        list of appointment durations (for each specialization), max_students, office, list of majors and major_id
# ^^^ fix

def get_supporter_settings(event, context):
    supporter_id = int(event['id'])

    if(not Users.exists([supporter_id])[supporter_id]):
        raise LambdaException("404: Supporter not found.")

    settings = {}
    names = Users.get_name([supporter_id])
    settings['first_name'] = names[supporter_id]['first_name']
    settings['last_name'] = names[supporter_id]['last_name']
    settings['preferred_name'] = names[supporter_id]['preferred_name']
    
    settings['email'] = Users.get_email([supporter_id])[supporter_id]
    settings['bio'] = Users.get_bio([supporter_id])[supporter_id]
    settings['pronouns'] = Users.get_pronouns([supporter_id])[supporter_id]
    settings['gender'] = Users.get_gender([supporter_id])[supporter_id]
    settings['phone'] = Users.get_phone([supporter_id])[supporter_id]
    settings['picture'] = Users.get_profile([supporter_id])[supporter_id]
    settings['employer'] = Supporters.get_employer([supporter_id])[supporter_id]
    settings['title'] = Supporters.get_title([supporter_id])[supporter_id]
    settings['team_name'] = Supporters.get_teamname([supporter_id])[supporter_id]
    settings['feedback'] = Supporters.get_feedback([supporter_id])[supporter_id]
    settings['office'] = Supporters.get_office([supporter_id])[supporter_id]

    supporter_type = Supporters.get_supporter_type([supporter_id])[supporter_id]
    settings['professional_staff'] = supporter_type['professional_staff']
    settings['student_staff'] = supporter_type['student_staff']
    settings['alumni'] = supporter_type['alumni']
    settings['faculty'] = supporter_type['faculty']
    settings['other'] = supporter_type['other']

    specializations = Supporters.get_specialization_preferences([supporter_id])[supporter_id]
    settings['appointment_type_info'] = [
        {
            'specialization_type': specialization['specialization_type'],
            'duration': specialization['duration'],
            'max_students': specialization['max_students']
        }
        for specialization in specializations
    ]
    settings['specialization_types'] = [
        {
            'specialization_type': specialization['specialization_type']
        }
        for specialization in specializations
    ]
    
    student_preferences = Supporters.get_student_preferences([supporter_id])[supporter_id]
    settings['grad_student'] = student_preferences['grad_student']
    settings['hours_before_appointment'] = student_preferences['hours_before_appointment']

    settings['major_preferences'] = Supporters.get_major_preferences([supporter_id])[supporter_id]
    settings['minor_preferences'] = Supporters.get_minor_preferences([supporter_id])[supporter_id] 
    settings['tags'] = [tag['tag'] for tag in Supporters.get_tag_preferences([supporter_id])[supporter_id]]
    
    links = Supporters.get_links([supporter_id])[supporter_id]
    settings['links'] = [
        {
            'link': link['link'],
            'link_type': link['link_type']
        }
        for link in links
    ]

    # Need to figure it out where and how it is being used to properly implement it.

    #Execute parameterized query to get tags
    sql = 'SELECT N2.notification_type_name FROM notification_preferences N1, notification_type N2 \
           WHERE N1.notification_type_id = N2.notification_type_id AND N1.user_id = :supporter_id;'
    sql_parameters = [{'name': 'supporter_id', 'value': {'longValue': supporter_id}}]
    sql_result = query(sql, sql_parameters)['records']
    if(sql_result != []):
        settings['notification_type_name'] = settings[0][0].get('stringValue')
    if(settings == []):
        settings['notification_type_name'] = None

    return {
        'body': settings,
        'statusCode': 200
    }