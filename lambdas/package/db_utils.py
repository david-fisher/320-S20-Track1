from package.query_db import query
from package.lambda_exception import LambdaException

# Written by Ish Chhabra

#Returns whether the user with the given admin_id is admin.
def is_user_admin(admin_id):
    admin_id_param = [{'name' : 'admin_id', 'value' : {'longValue' : admin_id}}]
    sql = 'SELECT is_admin FROM users WHERE id = :admin_id'
    try:
        return query(sql, admin_id_param)['records'][0][0]['booleanValue']
    except Exception as e:
        raise LambdaException("Unable to verify admin: " + str(e))
        
# Returns whether a user with the given user_id exists
def user_exists(user_id):
    user_id_param = [{'name' : 'user_id', 'value' : {'longValue' : user_id}}]
    sql = "SELECT EXISTS(SELECT * FROM users WHERE id = :user_id LIMIT 1)"
    try:
        return query(sql, user_id_param)['records'][0][0]['booleanValue']
    except Exception as e:
        raise LambdaException("Unable to verify if user exists: " + str(e))

# Return:
# [0]['booleanValue'] : whether user is student
# [1]['booleanValue'] : whether user is supporter
# [2]['booleanValue'] : whether user is admin
def get_user_roles(user_id):
    user_id_param = [{'name' : 'user_id', 'value' : {'longValue' : user_id}}]
    sql = "SELECT is_student, is_supporter, is_admin FROM users WHERE id = :user_id"
    try:
        return query(sql, user_id_param)['records'][0]
    except Exception as e:
        raise LambdaException("Unable to retrieve roles: " + str(e))