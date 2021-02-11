from package.Users import Users

def lambda_handler(event, context):
    return Users.get_profile_post_url(event['user_id'], event['extension'])