# Meta Modeler
### **About**
Meta Modeler is a 3D modeling web application based off of [MolView](http://molview.org/) and built for a Bioinformatics research project at Middle Georgia State University.
### **Setup Virtual Environment**
Make sure to set up a virtual environment with package `Flask` and activate it.
1. Open command line console (Windows/Linux/Git Bash console) to install `virtualenv`. In command line prompt, type the following commands:  
>`pip install virtualenv`
2. cd into the your local project directory. (`~/meta-modeler' by default) Then type,
>`virtualenv venv`
3. Inside of the `venv` directory just created, your specific version of python, libraries, modules for this project will be installed. Now, activate the virtual environment by either:
>`source venv/Scripts/activate` (for Linux/Git Bash console)

>`venv\Scripts\activate` (for Windows)
4. Your virtual Environment is now activated. Install `Flask` package within the environment by typing:
>`pip install flask`
5. **To turn off** the virtual environment, you can eitehr just close out the console window or type `deactivate` in the command line prompt and enter.
### **How to Run**
1. cd into the app directory (~/meta-modeler/app)
2. export the Flask app by copy and paste following commands.
> `export FLASK_APP=app.py` 
3. export the environment variable
> `export FLASK_ENV=development`
4. run the app
> `flask run`
#### _NOTE: use `set` command instead of `export` in Windows command line console._


