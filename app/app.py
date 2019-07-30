
from flask import Flask, render_template, request, send_from_directory, redirect, url_for
app = Flask(__name__, static_url_path='/static')

@app.route('/', methods=['GET'])
def root():
    #return render_template('index.html')
    return render_template('index.html')

#This code lines solve 404 NOT FOUND issues related to JSmol files
#WARNING: send_static_file is a security concern with user input
#Maybe needs to find other ways later or we don't need this once our app runs on server.
@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)
