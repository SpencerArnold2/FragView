FragView README:

This document will explain how to setup the application to run on your local machine
and also give some notice to chances for error in the application.

Packages Needed:
If you do not already have a new Anaconda environment ready to use when running the application,
create one. The environment will need to be initialized with several necessary packages, so make
sure to install all of the packages listed below.

    Python 3.0 - >3.7:
        conda create -n fragviewenv python=3.7

    Flask:
        conda install -n fragviewenv Flask

    flask-cors:
        conda install -n fragviewenv flask-cors

    RDKit:
        conda install -n fragviewenv rdkit

These packages can be added through Anaconda's GUI application or through through terminal using
the commands specified below the packages

Next, navigate to the application in your terminal or command prompt and traverse to the app directory,
which contains the __init__.py and app.py files and static and templates directories.

Initialize the Anaconda environment through the conda activate command, as displayed below

    conda activate fragviewenv

Set the FLASK_APP environment variable to the app.py file through one of the commands shown below.
NOTE: the set command is used in Windows command prompt, while export is used in Linux and OS X terminals.

    Windows:
        set FLASK_APP=app.py
    
    Linux and Mac:
        export FLASK_APP=app.py

The application is now ready to run with the following command:

    flask run

The application can be seen from your browser at the localhost:5000 URL.


Common Setup Errors

When running the application for the first time, your environment might not be set up properly
and there are some common errors in the startup process.

1. VERIFY the version of Python used in the environment. Note that this will not be the version installed
    directly on your machine for other purposes. To see the environment's version of Python, run
    python --version from inside the environment (you might have to use python3 --version is python2 is also
    installed). If it is less than Python 3, you will receive an
    syntax error from app.py. If the application is greater than or equal to Python 3.7, some of RDKit's
    statements will not execute properly.

2. VERIFY flask's version in the environment. It is not uncommon for an external version of Flask, one
    that is installed outside of the Anaconda environment, will use the external Python version. Therefore,
    even if you have Flask installed on you computer, it is recommended to re-install it through the environment.
    Additionally, Flask should be using the environment's version with Python, and this can be checked by executing
    flask --version in the environment from the terminal.

3. Although the application can be run locally on your machine, it still depends on an internet connection.
    Some assets are loaded using an Internet connection, meaning that without one, the application will not work.

What To Do If an Error Cannot be Resolved

If the application still will not run locally, please send us a description of your error, OS and version, and
Anaconda env info with detailed descriptions of your error (screenshots of errors are very helpful). We will try
to replicate your error on our side and find a solution that will be added to the common setup errors section.
We will be as descriptive as possible in our answer; however, please utilize the common setup errors section above
before making a post on GitHub.

Application Guide Link

The following YouTube link will show you how to efficiently use the application and give you some help on the
features that are offered along with limitations of the application. The video WILL NOT show how to properly
install and setup the application.

YouTube video link: INSERT HERE

