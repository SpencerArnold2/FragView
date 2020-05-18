Although the setup.sh executable should automate the process as much as possible it does have limitations.
What the shell script will do:
    1. Create the Anaconda environment with the packages that are required by the FragView application
    2. Setup the Gunicorn instance, including creating the fragview.service in the /etc/systemd/system/
        directory
    3. Create the nginx server block with the /etc/nginx/sites-available/fragview path, symobolically
        link that to the sites-enabled, and restart nginx

The script assumes that the user is fine with the application running on port 5000 on the server.
IF THIS IS NOT THE CASE, the user will have to add the commands to the script to open the firewall
on the necessary port or execute those commands after running the shell script.

After the script runs, the application should be accessible from [IP ADDRESS]:5000, where [IP ADDRESS] is
the address for the server.

Known Issues:
    1. If running the script results in a green light for the app and nginx but there is a bad gateway
        error and the .sock file is not visible in the app directory, try restarting the service 
        (   sudo systemctl restart FragView[VersionNumber]  )
        or maybe removing the conda env (NOT TESTED). Restarting the service fixed the problem before
        and the error did not occur again even if the setup.sh script was executed again.