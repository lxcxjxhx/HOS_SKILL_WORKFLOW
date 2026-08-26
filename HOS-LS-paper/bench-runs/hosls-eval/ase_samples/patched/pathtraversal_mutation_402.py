317         ### Parameters:
- **username (str):** The username for the account.
- **token (str):** The token for the account.
321         ### Returns:
- **dict:** Status of the operation.
"""
# Gets token from database
database_token = database.retrieve_user_token(username=username)
327         if not database_token:
return {"Status": "Unsuccessful"}
elif database_token == token:
return {"Status": "Successful"}
else:
return {"Status": "Unsuccessful"}
334     @app.get("/get_pfp/{username}")
async def get_pfp(username: str):
"""
## Get User Avatar (Profile Picture)
Allows services to get the avatar (profile picture) of a specified account. 
340         ### Parameters:
- **username (str):** The username for the account.
343         ### Returns:
- **file:** The avatar the service requested.
"""
    # Sanitize username to prevent path traversal
    safe_username = os.path.basename(username)
    pfp_path = os.path.join("user_images", "pfp", safe_username)
    pfp_path = os.path.realpath(pfp_path)
    
    # Verify the resolved path is within the allowed directory
    allowed_dir = os.path.realpath("user_images/pfp")
    if not pfp_path.startswith(allowed_dir + os.sep):
        return {"Status": "Unsuccessful", "Error": "Invalid username"}
    
    # Checks if the user has a profile pic uploaded
    if os.path.isfile(pfp_path):
        return FileResponse(pfp_path, media_type='image/gif')
    else:
        # Returns default image if none is uploaded
        return FileResponse(f'{assets_folder}/default_pfp.png', media_type='image/gif')
353     @app.get("/get_banner/{username}")
async def get_banner(username: str):
"""
## Get User Banner
Allows services to get the account banner of a specified account.
359         ### Parameters:
- **username (str):** The username for the account.
362         ### Returns:
- **file:** The banner the service requested.
"""
    # Sanitize username to prevent path traversal
    safe_username = os.path.basename(username)
    banner_path = os.path.join("user_images", "banner", safe_username)
    banner_path = os.path.realpath(banner_path)
    
    # Verify the resolved path is within the allowed directory
    allowed_dir = os.path.realpath("user_images/banner")
    if not banner_path.startswith(allowed_dir + os.sep):
        return {"Status": "Unsuccessful", "Error": "Invalid username"}
    
    # Checks if the user has a banner uploaded
    if os.path.isfile(banner_path):
        return FileResponse(banner_path, media_type='image/gif')
    else:
        # Returns default image if none is uploaded
        return FileResponse(f'{assets_folder}/default_banner.png', media_type='image/gif')
372     @app.post("/create_lif_account")
async def create_lif_account(request: Request):
"""
## Create Lif Account (NEW)
Handles the creation of Lif Accounts
378         ### Parameters:
- **username (str):** The username for the account.
- **password (str):** The password for the account.
- **email (str):** The email for the account.