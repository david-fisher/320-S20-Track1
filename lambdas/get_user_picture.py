from package.Users import Users

# Returns the presigned url for the image.
def get_picture(event, context):
    user_id = int(event['id'])
    return Users.get_profile([user_id])[user_id]