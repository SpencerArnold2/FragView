# Server Setup
### Description
Although the setup.sh executable should automate the process as much as possible it does have limitations.
What the shell script will do:
1. Create the Anaconda environment with the packages that are required by the FragView application
2. Setup the Gunicorn instance, including creating the fragview.service in the /etc/systemd/system/
    directory
3. Create the nginx server block with the /etc/nginx/sites-available/fragview path, symobolically
    link that to the sites-enabled, and restart nginx
4. Disable past FragView service through user input so that service does not start on boot

### Migrating to Another Server
When moving the application to another server, download the code from the master branch, or another branch if
desired through the following command:
> `git clone -b [GithubBranchName] --single-branch [PrivateGithubURL]`
The previous command will download the FragView application to the current, active directory. After obtaining
all of the code on the server, the setup.sh must be executed with root privileges to set up the application
on the server. To run the setup script:
> `chmod +x setup.sh` // To enable execution privileges on the script
> `sudo ./setup.sh` // Execute the script as root


### Details
The script assumes that the user is fine with the application running on port 80 on the server.
IF THIS IS NOT THE CASE, the user will have to add the commands to the script to open the firewall
on the necessary port or execute those commands after running the shell script.

After the script runs, the application should be accessible from [IP ADDRESS], where [IP ADDRESS] is
the address for the server.

### When to use the Script
This script only needs to be run when the application is moving to another server. IT IS NOT needed
if the server is only being updated from the code in GitHub. After navigating to the GitHub remote
repository on the server, run the following command to update the code (git stash and pop to restore
local changes might have to be executed, but NOTE running the git pop command will cause local
changes on the server to overwrite code from the repository)
> `git pull [RemoteConnectionName] FragView[VersionNumber]`
The RemoteConnectionName can be obtained through the following command
> `git remote -v`
After the code has been updated, the server should reflect the new code with no downtime to update
the server. If the changes do not appear to have been implemented, restart the service, as described
below, and refresh the browser cache.

### Known Issues:
1. If running the script results in a green light for the app and nginx but there is a bad gateway
    error and the .sock file is not visible in the app directory, try restarting the service 
    > `sudo systemctl restart FragView[VersionNumber]`
    or maybe removing the conda env (NOT TESTED). Restarting the service fixed the problem before
    and the error did not occur again even if the setup.sh script was executed again.