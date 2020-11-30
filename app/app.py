from flask import Flask, render_template, request, send_from_directory, redirect, url_for, jsonify
from flask_cors import CORS, cross_origin
import os
app = Flask(__name__, static_url_path='/static')
#app.config["CORS_HEADERS"] = "Content-Type"
#pip install -U flask-cors and use to allow AJAX cross-origin request support
CORS(app, resources={r"/*": {"origins": "*"}})
from rdkit import Chem

homeRoute = "/fragview"

@app.route(homeRoute+'/', methods=['GET'])
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


@app.route(homeRoute+'/2d', methods=['POST'])
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

@app.route(homeRoute+'/2dSingle', methods=["POST"])
def single_two_dimensional():
    content = request.get_json()
    smile = content['smile']

    if(smile.find('.') and len(smile.split('.')) > 30):
        return jsonify({ "error": "No more than 30 fragments can be parsed at a single time" }), 400

    output = []

    if(smile):
        m = Chem.MolFromSmiles(smile)
        if m:
            output.append(Chem.MolToMolBlock(m))
        else:
            return jsonify({ "error": f"Unable to generate mol from smile: {smile}" }), 400
    else:
        return jsonify({ "error": "No smiles provided" }), 400
    return jsonify({ "output": output })

@app.route(homeRoute+'/2dInchi', methods=["POST"])
def inchi_two_dimensional():
    content = request.get_json()
    inchi = content["inchi"]
    output = []
    if(inchi):
        molecule = Chem.MolFromInchi(inchi)
        if(molecule):
            output.append(Chem.MolToMolBlock(molecule))
            output.append(Chem.MolToSmiles(molecule))
        else:
            return jsonify({ "error": f"Unable to generate mol from inchi: {inchi}" }), 400
        # if(inchi.find('.')):
        #     if(len(inchi.split('.')) <= 30):
        #         smiles = []
        #         for frag in inchi.split('.'):
        #             if("InChI" in frag):
        #                 molecule = Chem.MolFromInchi(frag)
        #                 smiles.append(Chem.MolToSmiles(molecule))
        #             #frag is actually a smile and not InChI
        #             else:
        #                 smiles.append(frag)
        #         smile = '.'.join(smiles)
        #         molecule = Chem.MolFromSmiles(smile)
        #         output.append(Chem.MolToMolBlock(molecule))
        #         output.append(smile)
        #         return jsonify({ "output": output })
        #     else:
        #         return jsonify({ "error": "No more than 30 fragments can be parsed at a single time" }), 400
        # else: 
        #     molecule = Chem.MolFromInchi(inchi)
        #     if(molecule):
        #         output.append(Chem.MolToMolBlock(molecule))
        #         output.append(Chem.MolToSmiles(molecule))
        #     else:
        #         return jsonify({ "error": f"Unable to generate mol from inchi: {inchi}" }), 400
    else:
        return jsonify({ "error": "No inchi provided" }), 400
    return jsonify({ "output": output })

@app.route(homeRoute+'/2dMol')
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

@app.route(homeRoute+'/licenses')
def loadLicense():
    return render_template('licenses.html')

@app.route(homeRoute+'/terms')
def loadTerms():
    return render_template('terms.html')

@app.route(homeRoute+'/manual')
def loadManual():
    return render_template('manual.html')

if(__name__ == "__main__"):
    app.run(host='0.0.0.0')

# @app.route('/favicon.ico')
# def faviconRet():
#     print(os.path.join(app.root_path, 'static/img'))
#     return send_from_directory(os.path.join(app.root_path, 'static/img'), 'favicon-32x32.png')
    

    #m = Chem.MolFromSmiles(smile)
    #mol_string = Chem.MolToMolBlock(m)
    #return mol_string, 200, {'Content-Type': 'text/plain'}
