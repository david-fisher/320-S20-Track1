import boto3

from package.query_db import query
from package.lambda_exception import LambdaException
from datetime import datetime, date, timedelta

from package.Users import Users
from package.Supporters import Supporters

DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"

# Returns a list of already scheduled appointments.
def get_scheduled_appointments(start_datetime, end_datetime):
    sql = "SELECT A.supporter_id, A.time_of_appt, SS.duration\
        FROM scheduled_appointments A, specializations_for_appointment SFA, specialization_type ST, supporter_specializations SS\
        WHERE A.appointment_id = SFA.appointment_id\
        AND SFA.specialization_type_id = ST.specialization_type_id\
        AND NOT cancelled\
        AND time_of_appt BETWEEN :start_datetime AND :end_datetime"
    
    params = [
        {'name': 'start_datetime', 'typeHint': 'TIMESTAMP', 'value': {'stringValue': start_datetime}},
        {'name': 'end_datetime', 'typeHint': 'TIMESTAMP', 'value': {'stringValue': end_datetime}}
    ]

    sql_result = query(sql, params)['records']

    scheduled_appointments = {}

    for record in sql_result:
        start_datetime = datetime.strptime(record[1]['stringValue'], DATETIME_FORMAT)
        end_datetime = start_datetime + timedelta(minutes=record[2]['longValue'])

        supporter_id = record[0]['longValue']

        if supporter_id in scheduled_appointments:
            scheduled_appointments[supporter_id].append((start_datetime, end_datetime))
        else:
            scheduled_appointments[supporter_id] = [(start_datetime, end_datetime)]
        
    # Sort taken appointments by start time.
    for scheduled_appointments_supporter in scheduled_appointments.values():
        scheduled_appointments_supporter.sort(key = lambda start_datetime: start_datetime[0])
    
    return scheduled_appointments

# Fills supporter profile information in the dictionary.
def fill_supporter_information(available_supporters):
    if(len(available_supporters) == 0):
        return

    supporter_ids = []
    for supporter in available_supporters.keys():
        supporter_ids.append(supporter)

    names = Users.get_name(supporter_ids)
    ratings = {supporter_id: {'rating': rating} for supporter_id, rating in Supporters.get_rating(supporter_ids).items()}
    employers = {supporter_id: {'employer': employer} for supporter_id, employer in Supporters.get_employer(supporter_ids).items()}
    titles = {supporter_id: {'title': title} for supporter_id, title in Supporters.get_title(supporter_ids).items()}
    offices = {supporter_id: {'office': office} for supporter_id, office in Supporters.get_office(supporter_ids).items()}
    profiles = {supporter_id: {'imgsrc': imgsrc} for supporter_id, imgsrc in Users.get_profile(supporter_ids).items()}
    tags = {supporter_id: {'tags': [tag['tag'] for tag in tags]} for supporter_id, tags in Supporters.get_tag_preferences(supporter_ids).items()}
    student_preferences = {
        supporter_id: {
            'preferences': {
                'grad_student': student_preferences['grad_student'],
                'hours_before_appointment': student_preferences['hours_before_appointment']
            }
        } for supporter_id, student_preferences in Supporters.get_student_preferences(supporter_ids).items()
    }
    major_preferences = {
        supporter_id: {
            'preferences': {
                'major_prefs': [major['major'] for major in majors]
            }
        } for supporter_id, majors in Supporters.get_major_preferences(supporter_ids).items()
    }
    preferences = merge({}, student_preferences, major_preferences)
    mediums = {supporter_id: {'mediums': [medium['medium'] for medium in mediums]} for supporter_id, mediums in Supporters.get_supporter_mediums(supporter_ids).items()}
    topics = {supporter_id: {
        topic['specialization_type']: {
            'duration': topic['duration'],
            'max_students': topic['max_students']
        } for topic in topics
    } for supporter_id, topics in Supporters.get_specialization_preferences(supporter_ids).items()}
    
    
    merge(available_supporters, names, ratings, employers, titles, offices, profiles, tags, preferences, mediums, topics)
    
    sql = f"""SELECT S.supporter_id, (SELECT link FROM user_link WHERE user_id = U.id AND link_id = (SELECT link_id FROM link WHERE link_type = 'LinkedIn'))
        FROM users U, supporters S
        WHERE U.id IN({",".join([str(supporter_id) for supporter_id in supporter_ids])}) AND U.id = S.user_id"""
    sql_result = query(sql)['records']
    for record in sql_result:
        supporter_id = record[0]['longValue']
        available_supporters[supporter_id]['LinkedIn'] = record[1]['stringValue'] if 'stringValue' in record[1] else ""

# Gets a dictionary with all available appointments by supporter.
def get_available_appointments(start_datetime, end_datetime, scheduled_appointments):
    appointment_blocks = {}

    sql = "SELECT supporter_id, start_date, end_date FROM appointment_block WHERE start_date BETWEEN :start_datetime AND :end_datetime"

    params = [
        {'name': 'start_datetime', 'typeHint': 'TIMESTAMP', 'value': {'stringValue': start_datetime}},
        {'name': 'end_datetime', 'typeHint': 'TIMESTAMP', 'value': {'stringValue': end_datetime}}
    ]

    sql_result = query(sql, params)['records']

    for record in sql_result:
        supporter_id = record[0]['longValue']
        if supporter_id not in appointment_blocks:
            appointment_blocks[supporter_id] = {}
            appointment_blocks[supporter_id]['supporter_id'] = supporter_id
            appointment_blocks[supporter_id]['timeBlocks'] = []

        start_datetime = datetime.strptime(record[1]['stringValue'], DATETIME_FORMAT)
        end_datetime = datetime.strptime(record[2]['stringValue'], DATETIME_FORMAT)

        # Add appointment if it isn't already used.
        time_counter = start_datetime
        if supporter_id in scheduled_appointments:
            for scheduled_appointment in scheduled_appointments[supporter_id]:
                if time_counter <= scheduled_appointment[0] < scheduled_appointment[1] <= end_datetime:
                    if time_counter != scheduled_appointment[0]:
                        appointment_blocks[supporter_id]['timeBlocks'].append({
                            'start': ceil_dt(time_counter, timedelta(minutes=30)).strftime(DATETIME_FORMAT),
                            'end': ceil_dt(scheduled_appointment[0], timedelta(minutes=30)).strftime(DATETIME_FORMAT)
                        })
                    time_counter = scheduled_appointment[1]
        
        if time_counter != end_datetime:
            appointment_blocks[supporter_id]['timeBlocks'].append({
                        'start': ceil_dt(time_counter, timedelta(minutes=30)).strftime(DATETIME_FORMAT),
                        'end': ceil_dt(end_datetime, timedelta(minutes=30)).strftime(DATETIME_FORMAT)
                    })
    
    for supporter__id in appointment_blocks:
        if(appointment_blocks[supporter__id] == []):
            appointment_blocks.pop(supporter__id)
    
    return appointment_blocks

# Rounds the time to the next multiple of delta.
def ceil_dt(dt, delta):
    return dt + (datetime.min - dt) % delta

# Merges all the following dictionaries into the first dictionary.
def merge(arg1, *argv):
    for arg in argv:
        _merge(arg1, arg)
    
    return arg1

def _merge(d1, d2):
    for k, v in d1.items():
        if k in d2:
            d2[k] = _merge(v, d2[k])
    d1.update(d2)
    return d1

def main(event, context):
    today = date.today()
    start_datetime = event['start_date']
    if (datetime.strptime(start_datetime, DATETIME_FORMAT).date() < today) :
        start_datetime = today.strftime(DATETIME_FORMAT)

    end_datetime = event['end_date']

    scheduled_appointments = get_scheduled_appointments(start_datetime, end_datetime)
    available_supporters = get_available_appointments(start_datetime, end_datetime, scheduled_appointments)
    fill_supporter_information(available_supporters)

    return {
        'statusCode': 200,
        'body': list(available_supporters.values())
    }