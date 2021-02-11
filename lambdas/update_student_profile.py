from package.Users import Users
from package.Students import Students
from package.lambda_exception import LambdaException

# Authors: Victoria Caruso and Hadley Pope
# Date: 4/9/20

# Modified by Ish Chhabra

# Updates the student profile details in the database.
def update_student_profile(event, context):
    # Better to send the error back to frontend rather than raising a LambdaException and not giving the frontend a chance to fix it.
    if 'student_id' not in event:
        raise LambdaException("400: No student id specified.")

    student_id = int(event['student_id'])

    if (not Users.exists([student_id])[student_id]):
        raise LambdaException("404: Student not found.")

    # Even though we are using multiple queries over single here, that performance boost is trivial when compared to the loss in code readability.

    # User settings

    if 'first_name' in event and event['first_name'].strip() != "":
        Users.set_first_name(student_id, event["first_name"])

    if 'last_name' in event and event['last_name'].strip() != "":
        Users.set_last_name(student_id, event["last_name"])

    if 'preferred_name' in event and event['preferred_name']:
        Users.set_preferred_name(student_id, event['preferred_name'])

    if 'email' in event and event['email'].strip() != "":
        Users.set_email(student_id, event["email"])

    if 'bio' in event and event['bio'].strip() != "":
        Users.set_bio(student_id, event["bio"])

    if 'pronouns' in event and event['pronouns'].strip() != "":
        Users.set_pronouns(student_id, event["pronouns"])

    if 'gender' in event and event['gender'].strip() != "":
        Users.set_gender(student_id, event["gender"])

    if 'phone' in event and event['phone'].strip() != "":
        Users.set_phone(student_id, event["phone"])

    # Structure of event['links']: [[link_type, link], ...]
    if 'links' in event and event['links'] != []:
        Users.set_links_by_type(
            student_id, 
            ([{'link_type': link[0], 'link_id': link[1]}] for link in event['links'])
        )

    # Profile picture upload is shifted to a new method entirely.
    # Profile Picture
    # if event['picture'] != "":
    #     upload_profile_picture(student_id, event['picture'])

    # Student Settings

    if 'majors' in event:
        Students.set_majors_by_name(student_id, event['majors'])
    
    if 'minors' in event:
        Students.set_minors_by_name(student_id, event['minors'])
    
    if 'grad_student' in event and event['grad_student'] != "": # Not sure what the second check is for but kept it until I check into it.
        Students.set_grad_student(student_id, event['grad_student'] == "true")

    if 'grad_year' in event and event['grad_year'].strip() != "": # Again, not sure when would the frontend send a blank value here.
        Students.set_grad_yr(student_id, int(event['grad_year']))

    if 'resume' in event and event['resume'].strip() != "":
        Students.set_resume(student_id, event['resume'])

    # Structure of event['links']: List of college names.
    if 'colleges' in event and event['colleges'] != []:
        Students.set_colleges_by_name(student_id, event['colleges'])

    return {
        'body' : "Student profile updated successfully.",
        'statusCode': 200
    }