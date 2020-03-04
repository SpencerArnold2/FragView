#!/bin/bash

#This file will setup the server by:
# Creating Anaconda environment
# Set up Gunicorn service instance
# Create nginx server block

echo Creating Anaconda environment with required packages...
$(conda create --prefix ./condaenv python=3.7 flask=1.1.1 flask-cors=3.0.8 rdkit=2019.09.3.0)
echo Anaconda environment created.

#Add Gunicorn service

echo Creating fragview.service file...
cat <<EOF >/etc/systemd/system/fragview.service
[Unit]
Description=Creates an instance of Gunicorn to let clients access the application
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=/home/$USER/FragView/meta-modeler-Feature-TreeVisualization/app
Environment="PATH=/home/$USER/FragView/condaenv/bin"
ExecStart="/home/$USER/FragView/condaenv/bin/gunicorn --workers 4 --bind unix:fragview.sock -m 007 wsgi:app"

[Install]
WantedBy=multi-user.target
EOF
echo fragview.service successfully created.

#Add nginx server block

echo Creating nginx server block...
cat <<EOF >/etc/nginx/sites-available/fragview
server {
    listen 5000;

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/$USER/FragView/meta-modeler-Feature-TreeVisualization/app/fragview.sock
    }
}
EOF
echo nginx server block successfully created.

echo Initializing nginx server block...
#Command to enable and prepare nginx server block config
sudo ln -s /etc/nginx/sites-available/fragview /etc/nginx/sites-enabled

#test for syntax errors
sudo nginx -t

#restart nginx to initialize server block
sudo systemctl restart nginx
echo nginx restarted and server block is operational.

# echo Will the application run anywhere other than port 5000 [y/n]

# read portAnswer

# #If the user wishes the application to run anywhere other than port 5000, enable
# # all ports
# if(portAnswer != "y") {
#     sudo ufw allow 'Nginx Full'
# }

echo fragview.service should be operational. Here is its status:
sudo systemctl status fragview

echo nginx should be operational. Here is its status:
sudo systemctl status nginx

echo Site should now be active.