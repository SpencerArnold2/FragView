#!/bin/bash

#This file will setup the server by:
# Creating Anaconda environment
# Set up Gunicorn service instance
# Create nginx server block

#If the user does not put a file path for the conda environment, the program will assume the
# condaPath is in a default /home/$USER directory
if [[ -f $1 && $1 != "" ]]; then
    condaPath=$1
else
    condaPath=/home/$SUDO_USER/anaconda3/bin/conda
fi

echo $condaPath

echo "Enter the version number of FragView (NOTE: specifying an existing version will overwrite that file): "
read versionNumber

# echo FragView$versionNumber

#Do not forgot to add sudo -u $SUDO_USER... command to make the condaenv created by regular user instead
# of root

# sudo -u $SUDO_USER bash -c 'appPath=$(pwd)'

appPath=$PWD

echo app path: $appPath
echo conda path: $condaPath

echo Creating Anaconda environment with required packages...

#sudo -u $SUDO_USER whoami
#-p is the same as --prefix, it is used to set path for anaconda env

#Works
#sudo -u $SUDO_USER bash -c '/home/$USER/anaconda3/bin/conda create -p ./condaenv -c rdkit rdkit=2019.09.3.0 python=3.7 flask=1.1.1 flask-cors=3.0.8 gunicorn=20.0.4'

#Test - this was included in setupv1.sh but it creates conda environment as root
$condaPath create -p ./condaenv -c rdkit rdkit=2019.09.3.0 python=3.7 flask=1.1.1 flask-cors=3.0.8 gunicorn=20.0.4

echo Anaconda environment created.

#Add Gunicorn service

echo Creating FragView$versionNumber.service file...
cat <<EOF >/etc/systemd/system/FragView$versionNumber.service
[Unit]
Description=Creates an instance of Gunicorn to allow clients access the application
After=network.target

[Service]
User=$SUDO_USER
Group=www-data
WorkingDirectory=$appPath/app
Environment="PATH=$appPath/condaenv/bin"
ExecStart=$appPath/condaenv/bin/gunicorn --workers 4 --bind unix:fragview.sock -m 007 wsgi:app

[Install]
WantedBy=multi-user.target
EOF
echo FragView$versionNumber.service successfully created.

#Add nginx server block

echo Creating nginx server block...
cat <<EOF >/etc/nginx/sites-available/FragView$versionNumber
server {
    listen 80;

    location / {
        include proxy_params;
        proxy_pass http://unix:/$appPath/app/fragview.sock;
    }
}
EOF

echo nginx server block successfully created.

echo Initializing nginx server block...
#Command to enable and prepare nginx server block config
ln -s /etc/nginx/sites-available/FragView$versionNumber /etc/nginx/sites-enabled

#test for syntax errors
nginx -t

systemctl daemon-reload

#restart nginx to initialize server block
systemctl restart nginx
echo nginx restarted and server block is operational.

systemctl start FragView$versionNumber
systemctl enable FragView$versionNumber

echo FragView$versionNumber.service should be operational. Here is its status:
systemctl status FragView$versionNumber

echo nginx should be operational. Here is its status:
systemctl status nginx

echo "Is the FragView$versionNumber and nginx status green (y/n)"
read response

if [[ $response = 'n' || $response = 'N' ]]; then
    echo Site failed to launch
    echo Removing created service file...
    rm /etc/systemd/system/FragView$versionNumber.service
    echo Removing created nginx sites-available and sites-enabled files...
    rm /etc/nginx/sites-available/FragView$versionNumber
    rm /etc/nginx/sites-enabled/FragView$versionNumber
    echo Created /etc files successfully deleted

else
    echo Site setup successfully
fi