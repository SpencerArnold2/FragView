# Meta Modeler
### **About**
Meta Modeler is a 3D modeling web application based off of [MolView](http://molview.org/) and built for a Bioinformatics research project at Middle Georgia State University.
### **Setup Virtual Environment**
Make sure to set up a virtual environment with package `Flask` and activate it.
1. install `virtualenv` in order to make the virtual development environment for this project. Go to command line console, then type:
>`pip install virtualenv`
2. cd into your local project repository. (~Github/meta-modeler by default after clonning the master repository) Then, type following commands to make a folder `venv`, which will hold specific version of python, libraries, etc.
> ~Github/meta-modeler> `virtualenv venv`
3. Now activate the virtual enviornment.
> `venv\Scripts\activate` _(for Windows)_

> `source venv/Scripts/activate` _(for Linux/Git Bash Console)_
4. Install `Flask` framework.
> `pip install flask` 

 - Flask will be installed in your virtual environmnet folder under _venv/Lib/site-packages_
5. **To turn off** the virtual environment, simply either close out the console window or type and enter `deactivate`. 
### **How to Run the App**
1. In command line console, cd into the app directory (~/meta-modeler as default)
2. export the Flask app and export the environment variable by typing following commands
>`export FLASK_APP=app.py`

>`export FLASK_ENV=development`
3. run the app
> `flask run`

_NOTE: To run the application on another port use the flask run command with the -p flag that and specify the port number (ex. flask run -p 5050)_

_NOTE: You must give permission to run the application on port 80 locally_

_NOTE: If you are on Windows, use `set` command instead of `export`_