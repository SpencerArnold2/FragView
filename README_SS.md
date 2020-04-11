---Version 1.1 Notes---

---Version 1.0 Notes---

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
    There are no known issues with the script at this time.
