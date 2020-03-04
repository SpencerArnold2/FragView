/**
 * This file is part of MolView (http://molview.org)
 * Copyright (c) 2014, 2015 Herman Bergwerf
 *
 * MolView is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MolView is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with MolView.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Wrapper for all MolView actions which can be triggered in the UI
 * All methods are binded in MolView.init
 * @type {Object}
 */
var Actions = {
	/*
	MolView menu
	*/
	layout_sketcher: function () {
		MolView.setLayout("sketcher");
	},
	layout_model: function () {
		MolView.setLayout("model");
	},
	layout_vsplit: function () {
		MolView.setLayout("vsplit");
	},
	layout_hsplit: function () {
		MolView.setLayout("hsplit");
	},

	theme_desktop: function () {
		MolView.setTheme("desktop");
	},

	theme_touch: function () {
		MolView.setTheme("touch");
	},

	help: function () {
		MolView.showDialog("help");
	},

	about: function () {
		MolView.showDialog("about");
	},

	/*
	Tools menu
	*/
	share: function () {
		Link.updateShareDialog();
		MolView.showDialog("share");
	},

	embed: function () {
		Link.updateEmbedDialog();
		MolView.showDialog("embed");
	},

	export_sketcher_png: function () {
		var dataURL = Sketcher.toDataURL();
		var blob = dataURItoBlob(dataURL);
		if (blob !== null) saveAs(blob, document.title + " (structural formula).png");
		var url = URL.createObjectURL(blob);
	},

	export_model_png: function () {
		var dataURL = Model.getImageDataURL();
		var blob = dataURItoBlob(dataURL);
		if (blob !== null) saveAs(blob, document.title + " (model).png");
	},

	export_model: function () {
		var blob = Model.getFileBlob();
		saveAs(blob, document.title + "." + (Model.getFileExstension().toLowerCase()));
	},

	export_model_stl: function () {
		//Export the current 3D model into a STL file format for 3D printing.
		//Check out JSmolPlugin.js for script()
		//Added by Jinyoung An(@jinyoungan85)
		Jmol.script(JSmol, 'WRITE STL "file.stl"');
		Jmol.script(JSmol, "hbonds ON");
		Jmol.script(JSmol, "color hbonds TYPE");
	},

	toggle_hydrogens: function() {
		var setting = document.getElementById("action-models-toggle-hydrogens");
		if(setting.classList.contains("checked")) {
			Jmol.script(JSmol, "calculate hydrogens;");
			setting.classList.remove("checked");
		}
		else {
			Jmol.script(JSmol, "SELECT hydrogen; delete selected");
			setting.classList.add("checked");
		}
	},

	updateTree: function () {
		Sketcher.center();
		url = sketcherBlobURL();
		nodeId = document.getElementsByClassName("active")[0].id;
		nodeId = nodeId.replace("node-","");
		selectedNode = document.getElementById("img" + nodeId);
		selectedNode.src = url
	},

	treeSmile: function (root="", newTreeFlag=false) {
		$(".r-mode").removeClass("checked");
        document.getElementById("action-model-balls").classList.add("checked");
		let smile = document.getElementById("search-smile").value;
		let splitVer, fragFlag;
		if(root.contains(".")) {
			splitVer = smile.split(".");
			fragFlag = true;
		}
		//Not needed anymore because frag limit is checked before AJAX
		//if(true) {
			// var totalNodes = MolTree.tree.getNodeDb().db.length;
			// for (i = 1; i < totalNodes; i++) {
			// 	let currentNode = MolDataList.getNode(i.toString());
			// 	MolDataList.delNode(i.toString());
			// }
			//clearTreeMenu();

			//Sketcher.clear();
			//Use S to differentiate search smiles for loader
			// let smile = document.getElementById("search-smile").value;
			//console.log("newTreeFlag", newTreeFlag);
			if(smile === "" && root !== "") {
				smile = root;
			}
			if (smile === "" && root === "") {
				Messages.alert("empty_smile_search");
			}
			else {
				resetUpdateAnim();
				// document.getElementById("tree-menu-container").style.display = "";
				Loader.loadSMILES(smile, fragFlag, newTreeFlag);
			}
		//}
		//else {
		//	Messages.alert("frag_limit_exceeded");
		//}
	},
	treeSmileCont: function (ajaxData) {
		//ajaxData["output"] is joined fragments 2D molfile
		//console.log("Smiles retrieved", ajaxData["output"])
		smile = document.getElementById("search-smile").value;
		//[ATOM] specifies it is explicit (no hydrogens are drawn) so
		// if this does not exist, implicit hydrogens only exist
		// if(smile.search("[H]") === 0 || smile.search("[H]") === -1) {
		// 	implicitFlag = true;
		// }
		setTimeout(function () {
			mol2d = Sketcher.getMOL();
			mol3d = Model.data.mol;
			var molInfo = [mol2d, mol3d];
			var DomRoot = document.getElementById("node-0");
			var DomRootURL = sketcherBlobURL();
			DomRoot.title = smile;
			DomRoot.innerHTML = "<img id=img0 src=" + DomRootURL + ">";
			addClickHandler(DomRoot);
			let rootNode = MolDataList.getNode("0");
			rootNode.set2d(molInfo[0]);
			rootNode.set3d(molInfo[1]);
			Sketcher.loadMOL(ajaxData["output"][1]);
		}, 100)
		if (hasFragment(smile)) {

			result = ajaxData;
			result["output"].shift();
			frags = smileSplitter(smile);

			setTimeout(function() {
				term = 1;
				term = Actions.promiseFrags(frags, result);
				rootNodeH = document.getElementById("node-0");
				DomRoot = document.getElementById("node-0");
				DomRoot.style.pointerEvents = "none";

			}, 500)
			//to revert back to root node
			setTimeout(function() {
				// var node = MolDataList.getNode(1);
			 	// Model.loadMOL(node.get3d());
				// Sketcher.loadMOL(node.get2d());
				// rootNodeH.className = "node";
			 	// firstFrag = document.getElementById("node-1");
			 	// firstFrag.className = "node active";
			}, 1800)
		}
		else {
			cancelUpdateAnim();
		}


	},
	revertFirstNodeNew() {
		var node = MolDataList.getNode(1);
		Model.loadMOL(node.get3d());
		Sketcher.loadMOL(node.get2d());
		rootNodeNew = document.getElementById("node-0");
		rootNodeNew.className = "node";
		firstFrag = document.getElementById("node-1");
		firstFrag.className = "node active";
		cancelUpdateAnim();
	},
	revertRootNode(rootNode) {
		var node = MolDataList.getNode(parseInt(rootNode.replace("node-",""), 10));
		Sketcher.loadMOL(node.get2d());
		cancelUpdateAnim();
	},
	//This is not supposed to load the 3d model because
	// it will be used for generating fragments only. The
	// 3d will hold the root node and only switch to the first
	// child node should the new tree contain framents in initial smile
	convert3d(smiles) {
		//console.log("3d smiles", smiles);
		Progress.increment();
        var rdkitMolecule = RDKit.Molecule.fromSmiles(smiles);
        rdkitMolecule.addHs();
        rdkitMolecule.EmbedMolecule();
        rdkitMolecule.MMFFoptimizeMolecule();
        var rdkitmol = rdkitMolecule.toMolfile();
        var mymol = rdkitmol.split("\n");
        mymol[0] = "2";
        let results = [mymol.join("\n")];
        return results;
	},
	convert2d(smiles, mol3d, mol2d) {
		// console.log("mol2d", mol2d);
		// console.log("mol3d", mol3d);
		Progress.increment();
        Sketcher.loadMOL(mol2d);
        Progress.complete();
        Messages.clear()
        let results = [mol3d, mol2d];

        return results;
	},
	//Call order ****
	//generate 3d molfile
	// load 2d molfile
	//  take 2d screenshot
	//   generate new node
	//Settimeouts take place before execution; therefore, it is critical
	// that these are continuously placed after a promise
	promiseFrags(frags, result, rootNode="") {
		//console.log("rootNode", rootNode);
		let parentId = document.getElementsByClassName("active")[0].id;
		//console.log("load 3d mol 0");
		
		new Promise(function(resolve, reject) {
			setTimeout(() => resolve(Actions.convert3d(frags[0])), 100);
		}).then(function(results) {
			//console.log("load sketcher mol 0");
			
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(Actions.convert2d(frags[0], results[0], result["output"][0])), 100);
			});
		}).then(function(results) {
			//console.log("store mol 0");

			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(storeMOL(results[0], result["output"][0], frags[0], false, parentId)), 100);
			});
		}).then(function(results) {
			//console.log("load 3d mol 1");

			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(Actions.convert3d(frags[1])), 100);
			});
		}).then(function(results) {
			//console.log("load sketcher mol 1");

			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(Actions.convert2d(frags[1], results[0], result["output"][1])), 100);
			});
		}).then(function (results) {
			//console.log("store mol 1");

			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(storeMOL(results[0], result["output"][1], frags[1], false, parentId)), 100);
			});
		}).then(function(results) {
			if(frags.length > 2) {
				//console.log("load 3d mol 2");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.convert3d(frags[2])), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 2) {
				//console.log("sketcher load mol 2");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.convert2d(frags[2], results[0], result["output"][2])), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 2) {
				//console.log("store mol 2");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(storeMOL(results[0], result["output"][2], frags[2], false, parentId)), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 3) {
				//console.log("load 3d mol 3");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.convert3d(frags[3])), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 3) {
				//console.log("sketcher load mol 3");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.convert2d(frags[3], results[0], result["output"][3])), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 3) {
				//console.log("store mol 3");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(storeMOL(results[0], result["output"][3], frags[3], false, parentId)), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 4) {
				//console.log("load 3d mol 4");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.convert3d(frags[4])), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 4) {
				//console.log("sketcher load mol 4");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.convert2d(frags[4], results[0], result["output"][4])), 100);
				});
			}
		}).then(function(results) {
			if(frags.length > 4) {
				//console.log("store mol 4");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(storeMOL(results[0], result["output"][4], frags[4], false, parentId)), 100);
				});
			}
		}).then(function(results) {
			if(!rootNode && frags.length > 1) { //Root node is empty for new trees
				//console.log("new tree");

				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.revertFirstNodeNew()), 100);
				});
			}
			else {
				//console.log("else");
				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.revertRootNode(rootNode)), 100)
				});
			}
		});

		//console.log("Executing");
		let index = document.getElementsByClassName("active")[0].id;
		index = index.replace("node-", "");
		index = parseInt(index, 10);
		let node = MolDataList.getNode(index);
		Model.loadMOL(node.get3d());
		Sketcher.loadMOL(node.get2d());

		return 0;
	},

	//For new tree
	ajaxReturnData: function (data) {
		Actions.treeSmileCont(data);
	},
	ajaxReturnDataFrags: function (frags, data) {
		root2D = frags
		rootNode = document.getElementsByClassName("active")[0].id;
		frags.splice(frags.length-1, frags.length - 1);

		Actions.promiseFrags(frags, data, rootNode);
	},
	isosurface_vdw: function () {
		//calculate PARTIALCHARGE = Calculates relatively reasonable partial charges using the MMFF94 charge model.
		//vdw # = Atom radius relative to the van der Waals radius.
		//MEP = Color mapping data set which depicts the molecular electrostatic potential
		//translucent = Display the isosurface as translucent object.
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-isosurface-vdw");
		if(setting.classList.contains("checked")) {
			setting.classList.remove("checked");
		}
		else {
			$("#action-isosurface-vdw").addClass("checked");
		}
		Jmol.script(JSmol, 'select *;if ($s1) {isosurface s1 delete} else {calculate partialcharge;isosurface s1 vdw map MEP translucent}');
		//console.log("SETTING", setting.classList.contains("checked"));
		
	},

	molecular_orbital_sp: function () {
		//Delete lcaoCartoon on currently selected atoms first,
		// then display selected atoms' sp orbitals
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-molecular-orbital-sp");
		var affectedSetting = document.getElementById("action-model-line");
		var affectedSetting1 = document.getElementById("action-model-balls");
		if(setting.classList.contains("checked")) {
			Jmol.script(JSmol, "lcaoCartoon DELETE;");
			Model.setRepresentation("balls");
			setting.classList.remove("checked");
			affectedSetting.classList.remove("checked");
			affectedSetting1.classList.add("checked");
		}
		else {
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
	},

	molecular_orbital_sp2: function () {
		//Delete lcaoCartoon on currently selected atoms first,
		// then display selected atoms' sp2 orbitals
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-molecular-orbital-sp2");
		var affectedSetting = document.getElementById("action-model-line");
		var affectedSetting1 = document.getElementById("action-model-balls");
		if(setting.classList.contains("checked")) {
			Jmol.script(JSmol, "lcaoCartoon DELETE;");
			Model.setRepresentation("balls");
			setting.classList.remove("checked");
			affectedSetting.classList.remove("checked");
			affectedSetting1.classList.add("checked");
		}
		else {
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
	},

	molecular_orbital_sp3: function () {
		//Delete lcaoCartoon on currently selected atoms first,
		// then display selected atoms' sp3 orbitals
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-molecular-orbital-sp3");
		var affectedSetting = document.getElementById("action-model-line");
		var affectedSetting1 = document.getElementById("action-model-balls");
		if(setting.classList.contains("checked")) {
			Jmol.script(JSmol, "lcaoCartoon DELETE;");
			Model.setRepresentation("balls");
			setting.classList.remove("checked");
			affectedSetting.classList.remove("checked");
			affectedSetting1.classList.add("checked");
		}
		else {
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
	},

	open_console: function () {
		//Opens up Jmol console pop-up window for developers to test Jmol script and its output.
		//Jmol.script(JSmol, 'console');
	},

	data_infocard: function () {
		var smiles;
		try {
			smiles = Sketcher.getSMILES();
		} catch (error) {
			Messages.alert("smiles_load_error_force", error);
			return;
		}

		InfoCard.update(smiles);
		InfoCard.load();
		MolView.setLayer("infocard");
	},

	data_spectra: function () {
		var smiles;
		try {
			smiles = Sketcher.getSMILES();
		} catch (error) {
			Messages.alert("smiles_load_error_force", error);
			return;
		}

		if (Spectroscopy.data["smiles"] && Spectroscopy.data["smiles"] === smiles) {
			MolView.setLayer("spectra");
		} else {
			Spectroscopy.update(smiles);
			MolView.setLayer("spectra");
		}

		Spectroscopy.resize();
	},

	search_substructure: function () {
		MolView.hideDialogs();
		MolView.setLayer("main");
		Messages.process(function () {
			if (Sketcher.metadata.cid) {
				Loader.PubChem.structureSearch("cid", Sketcher.metadata.cid, "substructure");
			} else {
				var smiles;
				try {
					smiles = Sketcher.getSMILES();
				} catch (error) {
					Messages.alert("smiles_load_error_force", error);
					return;
				}
				Loader.PubChem.structureSearch("smiles", smiles, "substructure");
			}
		}, "search");
	},

	search_superstructure: function () {
		MolView.hideDialogs();
		MolView.setLayer("main");
		Messages.process(function () {
			if (Sketcher.metadata.cid) {
				Loader.PubChem.structureSearch("cid", Sketcher.metadata.cid, "superstructure");
			} else {
				var smiles;
				try {
					smiles = Sketcher.getSMILES();
				} catch (error) {
					Messages.alert("smiles_load_error_force", error);
					return;
				}
				Loader.PubChem.structureSearch("smiles", smiles, "superstructure");
			}
		}, "search");
	},

	search_similarity: function () {
		MolView.hideDialogs();
		MolView.setLayer("main");
		Messages.process(function () {
			if (Sketcher.metadata.cid) {
				Loader.PubChem.structureSearch("cid", Sketcher.metadata.cid, "similarity");
			} else {
				var smiles;
				try {
					smiles = Sketcher.getSMILES();
				} catch (error) {
					Messages.alert("smiles_load_error_force", error);
					return;
				}
				Loader.PubChem.structureSearch("smiles", smiles, "similarity");
			}
		}, "search");
	},

	/*
	Model menu
	*/
	model_reset: function () {
		Model.reset();
	},
	model_balls: function () {
		Model.setRepresentation("balls");
	},
	model_stick: function () {
		Model.setRepresentation("stick");
	},
	model_vdw: function () {
		Model.setRepresentation("vdw");
	},
	model_wireframe: function () {
		Model.setRepresentation("wireframe");
	},
	model_line: function () {
		Model.setRepresentation("line");
	},

	model_bg_black: function () {
		Model.setBackground("black");
	},
	model_bg_gray: function () {
		Model.setBackground("gray");
	},
	model_bg_white: function () {
		Model.setBackground("white");
	},

	engine_glmol: function () {
		//clear Model window
		Messages.clear();

		Messages.process(function () {
			Model.setRenderEngine("GLmol", Messages.clear);
		}, "switch_engine");
	},

	engine_jmol: function () {
		//clear Model window
		Messages.clear();

		Messages.process(function () {
			Model.setRenderEngine("JSmol", Messages.clear);
		}, "switch_engine");
	},

	engine_cdw: function () {
		//clear Model window
		Messages.clear();

		Messages.process(function () {
			Model.setRenderEngine("CDW", Messages.clear);
		}, "switch_engine");
	},

	cif_unit_cell: function () {
		if (Model.isCIF()) {
			Messages.process(function () {
				Model.loadCIF(Model.data.cif, [1, 1, 1]);
				Messages.clear();
			}, "crystal_structure");
		}
	},

	cif_cubic_supercell: function () {
		if (Model.isCIF()) {
			Messages.process(function () {
				Model.loadCIF(Model.data.cif, [2, 2, 2]);
				Messages.clear();
			}, "crystal_structure");
		}
	},

	cif_flat_supercell: function () {
		if (Model.isCIF()) {
			Messages.process(function () {
				Model.loadCIF(Model.data.cif, [1, 3, 3]);
				Messages.clear();
			}, "crystal_structure");
		}
	},

	/*
	Protein menu
	*/
	bio_assembly: function () {
		Model.setBioAssembly(!Model.displayBU);
	},
	chain_type_ribbon: function () {
		Model.setChainType(!$("#action-chain-type-ribbon").hasClass("checked") ? "ribbon" : "none");
	},
	chain_type_cylinders: function () {
		Model.setChainType(!$("#action-chain-type-cylinders").hasClass("checked") ? "cylinders" : "none");
	},
	chain_type_btube: function () {
		Model.setChainType(!$("#action-chain-type-btube").hasClass("checked") ? "btube" : "none");
	},
	chain_type_ctrace: function () {
		Model.setChainType(!$("#action-chain-type-ctrace").hasClass("checked") ? "ctrace" : "none");
	},
	chain_type_bonds: function () {
		Model.setChainBonds(!$("#action-chain-type-bonds").hasClass("checked"));
	},

	chain_color_ss: function () {
		Model.setChainColor("ss");
	},
	chain_color_spectrum: function () {
		Model.setChainColor("spectrum");
	},
	chain_color_chain: function () {
		Model.setChainColor("chain");
	},
	chain_color_residue: function () {
		Model.setChainColor("residue");
	},
	chain_color_polarity: function () {
		Model.setChainColor("polarity");
	},
	chain_color_bfactor: function () {
		Model.setChainColor("bfactor");
	},

	/*
	Jmol menu
	*/
	jmol_clean: function () {
		Model.JSmol.clean();
	},
	jmol_hq: function () {
		Model.JSmol.setQuality(!$("#action-jmol-hq").hasClass("checked"));
	},
	jmol_mep_lucent: function () {
		Model.JSmol.loadMEPSurface(true);
	},
	jmol_mep_opaque: function () {
		Model.JSmol.loadMEPSurface(false);
	},
	jmol_charge: function () {
		Model.JSmol.displayCharge();
	},
	jmol_bond_dipoles: function () {
		Model.JSmol.displayDipoles();
	},
	jmol_net_dipole: function () {
		Model.JSmol.displayNetDipole();
	},
	jmol_minimize: function () {
		Model.JSmol.calculateEnergyMinimization();
	},

	jmol_measure_distance: function () {
		Model.JSmol.setMeasure($("#action-jmol-measure-distance").hasClass("checked") ?
			"OFF" : "DISTANCE");
	},

	jmol_measure_angle: function () {
		Model.JSmol.setMeasure($("#action-jmol-measure-angle").hasClass("checked") ?
			"OFF" : "ANGLE");
	},

	jmol_measure_torsion: function () {
		Model.JSmol.setMeasure($("#action-jmol-measure-torsion").hasClass("checked") ?
			"OFF" : "TORSION");
	},

	show_search_layer: function () {
		MolView.setLayer("search");
	},

	load_more_pubchem: function () {
		Loader.PubChem.loadNextSet();
	},

	load_more_rcsb: function () {
		Loader.RCSB.loadNextSet();
	},

	load_more_cod: function () {
		Loader.COD.loadNextSet();
	},

	/*
	Sketcher
	*/
	mp_bond_single: function () {
		Sketcher.setTool(this, "bond", {
			type: MP_BOND_SINGLE
		});
	},
	mp_bond_double: function () {
		Sketcher.setTool(this, "bond", {
			type: MP_BOND_DOUBLE
		});
	},
	mp_bond_triple: function () {
		Sketcher.setTool(this, "bond", {
			type: MP_BOND_TRIPLE
		});
	},
	mp_bond_wedge: function () {
		Sketcher.setTool(this, "bond", {
			stereo: MP_STEREO_UP
		});
	},
	mp_bond_hash: function () {
		Sketcher.setTool(this, "bond", {
			stereo: MP_STEREO_DOWN
		});
	},

	mp_frag_benzene: function () {
		Sketcher.setTool(this, "fragment", {
			frag: MPFragments.benzene
		});
	},
	mp_frag_cyclopropane: function () {
		Sketcher.setTool(this, "fragment", {
			frag: MPFragments.cyclopropane
		});
	},
	mp_frag_cyclobutane: function () {
		Sketcher.setTool(this, "fragment", {
			frag: MPFragments.cyclobutane
		});
	},
	mp_frag_cyclopentane: function () {
		Sketcher.setTool(this, "fragment", {
			frag: MPFragments.cyclopentane
		});
	},
	mp_frag_cyclohexane: function () {
		Sketcher.setTool(this, "fragment", {
			frag: MPFragments.cyclohexane
		});
	},
	mp_frag_cycloheptane: function () {
		Sketcher.setTool(this, "fragment", {
			frag: MPFragments.cycloheptane
		});
	},

	mp_chain: function () {
		Sketcher.setTool(this, "chain", {});
	},
	mp_charge_add: function () {
		Sketcher.setTool(this, "charge", {
			charge: 1
		});
	},
	mp_charge_sub: function () {
		Sketcher.setTool(this, "charge", {
			charge: -1
		});
	},

	mp_clear: function () {
		Sketcher.clear();
	},
	mp_eraser: function () {
		Sketcher.setTool(this, "erase", {});
	},
	mp_drag: function () {
		Sketcher.setTool(this, "drag", {});
	},
	mp_undo: function () {
		Sketcher.undo();
	},
	mp_redo: function () {
		Sketcher.redo();
	},
	mp_rect: function () {
		Sketcher.setTool(this, "select", {
			type: "rect"
		});
	},
	mp_lasso: function () {
		Sketcher.setTool(this, "select", {
			type: "lasso"
		});
	},
	mp_color_mode: function () {
		Sketcher.toggleColorMode();
	},
	mp_skeletal_formula: function () {
		Sketcher.toggleSkeletalFormula();
	},
	mp_center: function () {
		Sketcher.center();
	},
	mp_clean: function () {
		Sketcher.clean();
	},

	mp_atom_c: function () {
		Sketcher.setTool(this, "atom", {
			element: "C"
		});
	},
	mp_atom_h: function () {
		Sketcher.setTool(this, "atom", {
			element: "H"
		});
	},
	mp_atom_n: function () {
		Sketcher.setTool(this, "atom", {
			element: "N"
		});
	},
	mp_atom_o: function () {
		Sketcher.setTool(this, "atom", {
			element: "O"
		});
	},
	mp_atom_p: function () {
		Sketcher.setTool(this, "atom", {
			element: "P"
		});
	},
	mp_atom_s: function () {
		Sketcher.setTool(this, "atom", {
			element: "S"
		});
	},
	mp_atom_f: function () {
		Sketcher.setTool(this, "atom", {
			element: "F"
		});
	},
	mp_atom_cl: function () {
		Sketcher.setTool(this, "atom", {
			element: "Cl"
		});
	},
	mp_atom_br: function () {
		Sketcher.setTool(this, "atom", {
			element: "Br"
		});
	},
	mp_atom_i: function () {
		Sketcher.setTool(this, "atom", {
			element: "I"
		});
	},

	mp_periodictable: function () {
		MolView.showDialog("periodictable");
	},

	resolve: function () {
		resetUpdateAnim();
		//Added Sketcher.center to help with showing molecule image on Treant.
		Sketcher.center();
		Messages.process(Loader.resolve, "resolve");
	},

	/*
	Misc
	*/
	start_help: function () {
		MolView.showDialog("help");
	},

	export_spectrum_png: function () {
		if (!Spectroscopy.data[$("#spectrum-select").val()]) {
			alert("No spectrum selected!");
			return;
		}

		var dataURL = document.getElementById("spectrum-canvas").toDataURL("image/png");
		var blob = dataURItoBlob(dataURL);
		if (blob !== null) saveAs(blob, $("#spectrum-select").find("option:selected").text() + ".png");
	},

	export_spectrum_jcamp: function () {
		if (!Spectroscopy.data[$("#spectrum-select").val()]) {
			alert("No spectrum selected!");
			return;
		}

		var blob = new Blob([Spectroscopy.data[$("#spectrum-select").val()]], {
			type: "chemical/x-jcamp-dx;charset=utf-8"
		});
		if (blob !== null) saveAs(blob, $("#spectrum-select").find("option:selected").text() + ".jdx");
	}
};