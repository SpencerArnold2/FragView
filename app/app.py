from flask import Flask, render_template, request, send_from_directory, redirect, url_for, jsonify
from flask_cors import CORS, cross_origin
import os
app = Flask(__name__, static_url_path='/static')
#app.config["CORS_HEADERS"] = "Content-Type"
#pip install -U flask-cors and use to allow AJAX cross-origin request support
CORS(app, resources={r"/*": {"origins": "*"}})
from rdkit import Chem

@app.route('/', methods=['GET'])
#@cross_origin()
def root():
    #return render_template('index.html')
    return render_template('index.html')

#This code lines solve 404 NOT FOUND issues related to JSmol files
#WARNING: send_static_file is a security concern with user input
#Maybe needs to find other ways later or we don't need this once our app runs on server.
@app.route('/<path:path>')
#@cross_origin()
def static_file(path):
    return app.send_static_file(path)


@app.route('/2d', methods=['POST'])
#@cross_origin()
def two_dimensional():
    content = request.get_json() 
    smiles = content['smiles']

    if not smiles:
        return jsonify({ "error": "No smiles provided" }), 400
    
    #print(smiles)
    output = []
    for s in smiles:
        m = Chem.MolFromSmiles(s)
        if m:
            output.append(Chem.MolToMolBlock(m))
        else:
            return jsonify({ "error": f"Unable to generate mol from smile: {s}" }), 400

    return jsonify({ "output": output })

@app.route('/2dSingle', methods=["POST"])
def single_two_dimensional():
    content = request.get_json()
    smile = content['smile']

    output = []

    if(smile):
        m = Chem.MolFromSmiles(smile)
        if m:
            output.append(Chem.MolToMolBlock(m))
        else:
            return jsonify({ "error": f"Unable to generate mol from smile: {s}" }), 400
    else:
        return jsonify({ "error": "No smiles provided" }), 400
    return jsonify({ "output": output })

@app.route('/2dMol')
def two_dimensionalMol():
    smile = request.args.get('smile', 0, str)
    if(len(smile) > 0):
        if(smile.find('.') != -1):
            smile = smile.split('.')
    molFiles = {}
    i = 0
    for smle in smile:
        m = Chem.MolFromSmiles(smle)
        mol_string = Chem.MolToMolBlock(m)
        molFiles['mol' + str(i)] = mol_string
        i += 1
    #Return a JSONified object, not a list
    return(jsonify(mol2D=molFiles), 200, {'Content-Type': 'text/plain'})

@app.route('/licenses')
def loadLicense():
    return render_template('licenses.html')

@app.route('/terms')
def loadTerms():
    return render_template('terms.html')

if(__name__ == "__main__"):
    app.run(host='0.0.0.0')

# @app.route('/favicon.ico')
# def faviconRet():
#     print(os.path.join(app.root_path, 'static/img'))
#     return send_from_directory(os.path.join(app.root_path, 'static/img'), 'favicon-32x32.png')
    

    #m = Chem.MolFromSmiles(smile)
    #mol_string = Chem.MolToMolBlock(m)
    #return mol_string, 200, {'Content-Type': 'text/plain'}
