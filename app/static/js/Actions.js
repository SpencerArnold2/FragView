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

const fileReader = new FileReader();

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

	
	toggle_hydrogens: function () {
		var setting = document.getElementById("action-models-toggle-hydrogens");
		if (setting.classList.contains("checked")) {
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
		nodeId = nodeId.replace("node-", "");
		selectedNode = document.getElementById("img" + nodeId);

		try {
			selectedNode.src = url
		}
		catch {
			Messages.alert("refresh_image_error");
		}
		// selectedNode.src = url
	},

	treeSmile: function (root = "", newTreeFlag = false) {
		$(".r-mode").removeClass("checked");
		document.getElementById("action-model-balls").classList.add("checked");
		let smile = document.getElementById("search-smile").value;
		let splitVer, fragFlag, inchiFlag;
		if (root.contains(".")) {
			splitVer = smile.split(".");
			fragFlag = true;
		}
		if(smile.contains("InChI")) {
			inchiFlag = true;
		}

		if (smile === "" && root !== "") {
			smile = root;
		}
		if (smile === "" && root === "") {
			Messages.alert("empty_smile_search");
		}
		else {
			resetUpdateAnim();
			MolDataList.molList[0].smile = smile;
			document.getElementById("file-upload-text").innerHTML = "<p id='newTree'></p>";
			Loader.loadSMILES(smile, fragFlag, newTreeFlag, inchiFlag);
			setTimeout(() => {MolGraph.storeMol(MolDataList["molList"][0]["mol2d"], "2d", 0, 0);}, 2000);
			
		}
	},
	treeSmileCont: function (ajaxData, mol3d, mol2d) {
		//ajaxData["output"] is joined fragments 2D molfile
		smile = document.getElementById("search-smile").value;
		//[ATOM] specifies it is explicit (no hydrogens are drawn) so
		// if this does not exist, implicit hydrogens only exist
		// if(smile.search("[H]") === 0 || smile.search("[H]") === -1) {
		// 	implicitFlag = true;
		// }

		var molInfo = [mol2d, mol3d];
		var DomRoot = document.getElementById("node-0");
		var DomRootURL = sketcherBlobURL();
		DomRoot.title = smile;
		DomRoot.innerHTML = "<img id=img0 src=" + DomRootURL + ">";
		addClickHandler(DomRoot);
		let rootNode = MolDataList.getNode("0");
		rootNode.set2d(molInfo[0]);
		rootNode.set3d(molInfo[1]);
		
		if (hasFragment(smile)) {

			setTimeout(function () {
				rootNodeH = document.getElementById("node-0");
				DomRoot = document.getElementById("node-0");
				DomRoot.style.pointerEvents = "none";

			}, 300)
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
		var node = MolDataList.getNode(parseInt(rootNode.replace("node-", ""), 10));
		Sketcher.loadMOL(node.get2d());
		cancelUpdateAnim();
	},
	//This is not supposed to load the 3d model because
	// it will be used for generating fragments only. The
	// 3d will hold the root node and only switch to the first
	// child node should the new tree contain fragments in initial smile
	convert3d(smiles) {
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
		Progress.increment();
		Sketcher.loadMOL(mol2d);
		Progress.complete();
		Messages.clear()
		let results = [mol3d, mol2d];

		return results;
	},

	async fragPromise(frag, fragAjaxData, parentId, frags) {
		new Promise(function (resolve, reject) {
			setTimeout(() => resolve(Actions.convert3d(frag)), 100);
		}).then(function (results) {
			console.log("load sketcher mol ", i);

			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(Actions.convert2d(frag, results[0], fragAjaxData)), 100);
			});
		}).then(function (results) {
			console.log("store mol ", i);

			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(storeMOL(results[0], fragAjaxData, frags, false, parentId)), 100);
			});
		});
	},

	redrawTree() {
		winHeight = window.innerHeight;
		document.getElementById("uploadDialogText").innerText = "Resizing tree..."
		$("#uploadTreeDialog").show();
		resetUpdateAnim();
		clearTreeMenu();
		originalHTML = document.getElementById("tree-menu").innerHTML;
		onlyNodes = originalHTML.split("</svg>");
		count = 0;
		nodeArr = MolDataList.molList;
		nodeArrLen = nodeArr.length - 1;
		Actions.recursiveCreate(count, nodeArr, nodeArrLen);
	},

	recursiveCreate(count, nodes, len) {
		if(count <= len) {
			new Promise((resolve, reject) => {
				setTimeout(() => resolve(Sketcher.loadMOL(nodes[count]["mol2d"])), 25);
			}).then(function(results) {
				//console.log("count", count);
				if(count === 0) {
					return new Promise((resolve, reject) =>{
						setTimeout(() => resolve(Actions.treeSmileCont(nodes, nodes[count]["mol3d"], nodes[count]["mol2d"])), 25);
					})
				}
				else {
					return new Promise((resolve, reject) => {
						setTimeout(() => resolve(storeMOL(nodes[count]["mol3d"], nodes[count]["mol2d"], nodes[count]["smile"], false, nodes[count]["parentId"])), 100);
					})
				}
			}).then(function (results) {
				//The root node is never deleted, only overwritten so it should not be cut from
				// the array. Instead, when a node is appended to the array, cut that node, which
				// will always be in index one for that iteration
				if(count !== 0) {
					return new Promise((resolve, reject) => {
						setTimeout(() => resolve(MolDataList.molList.splice(nodes.length-1,1)), 25);
					})
				}
				
			}).then(function (results) {
				return new Promise((resolve, reject) => {
					count += 1;
					setTimeout(() => resolve(Actions.recursiveCreate(count, nodes, len)), 25);
				})
				
			});
		}
		else {
			newNodes = MolDataList.molList;
			if(nodes[0]["smile"].contains(".")) {
				Sketcher.loadMOL(nodes[1]["mol2d"]);
				Model.loadMOL(nodes[1]["mol3d"]);
				$(".node").removeClass("active");
				document.getElementById("node-1").classList.add("active");
			}
			else {
				Sketcher.loadMOL(nodes[0]["mol2d"]);
				Model.loadMOL(nodes[0]["mol3d"]);
				$(".node").removeClass("active");
				document.getElementById("node-0").classList.add("active");
			}

			$("#uploadTreeDialog").hide();
			cancelUpdateAnim();
			winWidth = window.innerWidth;
			window.addEventListener('resize', resizeHandler);
			resizeHandler(null, true);
		}
	},

	//Call order ****
	//generate 3d molfile
	// load 2d molfile
	//  take 2d screenshot
	//   generate new node
	//Settimeouts take place before execution; therefore, it is critical
	// that these are continuously placed after a promise
	promiseFrags(frags, result, rootNode = "") {
		let parentId = document.getElementsByClassName("active")[0].id;
		let index = document.getElementsByClassName("active")[0].id;
		index = index.replace("node-", "");
		index = parseInt(index, 10);
		let node = MolDataList.getNode(index);
		Model.loadMOL(node.get3d());
		Sketcher.loadMOL(node.get2d());

		return 0;
	},

	//For new tree
	ajaxReturnData: function (data, mol3d) {
		Actions.treeSmileCont(data, mol3d);
	},
	ajaxReturnDataFrags: function (frags, data) {
		root2D = frags
		rootNode = document.getElementsByClassName("active")[0].id;
		frags.splice(frags.length - 1, frags.length - 1);

		Actions.promiseFrags(frags, data, rootNode);
	},
	isosurface_vdw: function () {
		//calculate PARTIALCHARGE = Calculates relatively reasonable partial charges using the MMFF94 charge model.
		//vdw # = Atom radius relative to the van der Waals radius.
		//MEP = Color mapping data set which depicts the molecular electrostatic potential
		//translucent = Display the isosurface as translucent object.
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-isosurface-vdw");
		if (setting.classList.contains("checked")) {
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
		var affectedSetting2 = document.getElementById("action-molecular-orbital-sp2");
		var affectedSetting3 = document.getElementById("action-molecular-orbital-sp3");
		if (setting.classList.contains("checked")) {
			if((affectedSetting2.classList.contains("checked")) || (affectedSetting3.classList.contains("checked"))){
				Jmol.script(JSmol, "select ~sp; lcaoCartoon DELETE;");
				setting.classList.remove("checked");
			}
			else{
				Jmol.script(JSmol, "select ~sp; lcaoCartoon DELETE;");
				Model.setRepresentation("balls");
				setting.classList.remove("checked");
				affectedSetting.classList.remove("checked");
				affectedSetting1.classList.add("checked");
			}
		}
		else if(affectedSetting2.classList.contains("checked") && !(affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1); define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else if(!(affectedSetting2.classList.contains("checked")) && (affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1);define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else if((affectedSetting2.classList.contains("checked")) && (affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1); define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1); define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else {
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
			affectedSetting2.classList.remove("checked");
			affectedSetting3.classList.remove("checked");
		}
	},

	molecular_orbital_sp2: function () {
		//Delete lcaoCartoon on currently selected atoms first,
		// then display selected atoms' sp2 orbitals
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-molecular-orbital-sp2");
		var affectedSetting = document.getElementById("action-model-line");
		var affectedSetting1 = document.getElementById("action-model-balls");
		var affectedSetting2 = document.getElementById("action-molecular-orbital-sp");
		var affectedSetting3 = document.getElementById("action-molecular-orbital-sp3");
		if (setting.classList.contains("checked")) {
			if((affectedSetting2.classList.contains("checked")) || (affectedSetting3.classList.contains("checked"))){
				Jmol.script(JSmol, "select ~sp2; lcaoCartoon DELETE;");
				setting.classList.remove("checked");
			}
			else{
				Jmol.script(JSmol, "select ~sp2; lcaoCartoon DELETE;");
				Model.setRepresentation("balls");
				setting.classList.remove("checked");
				affectedSetting.classList.remove("checked");
				affectedSetting1.classList.add("checked");
			}
		}
		else if(affectedSetting2.classList.contains("checked") && !(affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1); define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else if(!(affectedSetting2.classList.contains("checked")) && (affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1);define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1)' 
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else if((affectedSetting2.classList.contains("checked") && (affectedSetting3.classList.contains("checked")))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1); define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1); define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else {
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
			affectedSetting2.classList.remove("checked");
			affectedSetting3.classList.remove("checked");
		}
	},

	molecular_orbital_sp3: function () {
		//Delete lcaoCartoon on currently selected atoms first,
		// then display selected atoms' sp3 orbitals
		//Added by Jinyoung An(@jinyoungan85)
		var setting = document.getElementById("action-molecular-orbital-sp3");
		var affectedSetting = document.getElementById("action-model-line");
		var affectedSetting1 = document.getElementById("action-model-balls");
		var affectedSetting2 = document.getElementById("action-molecular-orbital-sp2");
		var affectedSetting3 = document.getElementById("action-molecular-orbital-sp");
		if (setting.classList.contains("checked")) {
			if((affectedSetting2.classList.contains("checked")) || (affectedSetting3.classList.contains("checked"))){
				Jmol.script(JSmol, "select ~sp3; lcaoCartoon DELETE;");
				setting.classList.remove("checked");
			}
			else{
				Jmol.script(JSmol, "select ~sp3; lcaoCartoon DELETE;");
				Model.setRepresentation("balls");
				setting.classList.remove("checked");
				affectedSetting.classList.remove("checked");
				affectedSetting1.classList.add("checked");
			}
		}
		else if(affectedSetting2.classList.contains("checked") && !(affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1) define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else if(!(affectedSetting2.classList.contains("checked")) && (affectedSetting3.classList.contains("checked"))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1); define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else if((affectedSetting2.classList.contains("checked") && (affectedSetting3.classList.contains("checked")))){
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp (carbon and connected(2)) or (nitrogen and connected(1));select ~sp; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create MOLECULAR "spa" "spb";lcaoCartoon COLOR pink pink; lcaoCartoon TRANSLUCENT;lcaoCartoon create MOLECULAR "px" "py";bind "double" "javascript pTog()";javascript echo(1); define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1); define ~sp2 (carbon and connected(3)) or (oxygen and connected(1)) or (nitrogen and connected(2)); select ~sp2; lcaoCartoon COLOR cyan TRANSLUCENT; lcaoCartoon delete create MOLECULAR "sp2a" "sp2b" "sp2c"; lcaoCartoon COLOR pink pink TRANSLUCENT; lcaoCartoon create MOLECULAR "pz";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
		}
		else {
			Jmol.script(
				JSmol, 'lcaoCartoon DELETE; select *; wireframe 0.03; spacefill 1%; boundbox {*}; centerat boundbox; zoom 100;define ~sp3 (carbon and connected(4)) or (oxygen and connected(2)) or (nitrogen and connected(3));select ~sp3; lcaoCartoon COLOR cyan; lcaoCartoon TRANSLUCENT; lcaoCartoon delete create "sp3a" "sp3b" "sp3c" "sp3d";bind "double" "javascript pTog()";javascript echo(1)'
			);
			setting.classList.add("checked");
			affectedSetting.classList.add("checked");
			affectedSetting1.classList.remove("checked");
			affectedSetting2.classList.remove("checked");
			affectedSetting3.classList.remove("checked");
		}
	},

	open_console: function () {
		//Opens up Jmol console pop-up window for developers to test Jmol script and its output.
		Jmol.script(JSmol, 'console');
	},

	//Code for exporting tree data and then reuploading to reload save place
	save_tree: function () {
		MolDataList.molList[0]["smile"] = document.getElementById("node-0").title;
		var blob = new Blob([JSON.stringify(MolDataList.molList)], { type: "application/json" });
		console.log(blob);
		saveAs(blob, "saveTree.json");
	},

	upload_tree: function () {
		$("#file-dialog").trigger("click");
		var fileDialog = document.getElementById("file-dialog");
	},

	dialogChange: function () {
		// dispatchEvent(document.getElementById("file-dialog").addEventListener("change", (a) => {
		// 	Actions.handleFileUpload(a);
		// }));
	},

	handleFileUpload: function (a) {
		var files = a.target.files;
		if (files.length < 1) {
			return;
		}
		if (files[0].size < 500000) {
			if (files[0]["type"].contains("application/json")) {
				document.getElementById("file-upload-text").innerHTML = "<p id='fileTree'>" + files[0].name.split(".json")[0] + "</p>";
				var fileData
				var count = -1;
				for (var i = 1; i < MolTree.tree.nodeDB.db.length; i++) {
					MolDataList.delNode(i.toString());
				}
				//Setting the style to be shown first before clearing tree
				// is essential in centering tree
				document.getElementById("tree-menu-container").style.display = "";
				clearTreeMenu();
				
				//Reads the file and triggers the load event on the fileReader
				fileReader.readAsText(files[0]);
			}
			else {
				alert("File must be in JSON format");
			}
		}
		else {
			alert("File size must be less than 500KB");
		}
	},

	createSaveTree: function(nodesArr, count=-1) {
		document.getElementById("uploadDialogText").innerText = "Uploading new tree...    ";
		$("#uploadTreeDialog").show();
		$("#loadModelAnim").show();

		//Count starts at -1 to offset root ID
		count++;
		if (count === 0) {
			var firstNode = MolDataList.getNode("0");
			firstNode.set2d(nodesArr[0].mol2d);
			firstNode.set3d(nodesArr[0].mol3d);
			firstNode.setSmile(nodesArr[0].smile);
			var rootNode = document.getElementById("node-0");
			addClickHandler(rootNode);
			//Let Actions.updateTree() set image source
			rootNode.title = nodesArr[0].smile;
			rootNode.innerHTML = '<img id="img0">';

			new Promise((resolve, reject) => {
				setTimeout(() => resolve(Sketcher.loadMOL(nodesArr[0].mol2d)), 100);
			}).then(function (results) {
				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(Actions.updateTree()), 100);
				});
			}).then(function (results) {
				if (count < nodesArr.length) {
					Actions.createSaveTree(nodesArr, count);
				}
			})
		}
		else {
			if (count < nodesArr.length) {
				new Promise((resolve, reject) => {
					setTimeout(() => resolve(Sketcher.loadMOL(nodesArr[count].mol2d)), 100);

				}).then(function (results) {

					return new Promise((resolve, reject) => {
						setTimeout(() => resolve(storeMOL(nodesArr[count].mol3d, nodesArr[count].mol2d, nodesArr[count].smile, false, nodesArr[count].parentId, false, true)), 100);
					});
				}).then(function (results) {
					if (count < nodesArr.length - 1) {
						Actions.createSaveTree(nodesArr, count);
					}
					else {
						var node;
						if(nodesArr[0].smile.contains('.')) {
							node = MolDataList.getNode(1);
							Sketcher.loadMOL(node.get2d());
							Model.loadMOL(node.get3d());
							$("#node-0").removeClass("active");
							$("#node-1").addClass("active");
							document.getElementById("node-0").style.pointerEvents = "none";
						}
						else {
							node = MolDataList.getNode(0);
							Sketcher.loadMOL(node.get2d());
							Model.loadMOL(node.get3d());
						}

						//Jmol.script(JSmol, "SELECT hydrogen; delete selected")

						$("#uploadTreeDialog").hide();
						$("#loadModelAnim").hide();
						//Change the value of the file stored in the file-dialog to trigger on-change for next upload
						$("#file-dialog")[0].value = "";

					}
				})
			}
		}
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

	// search_substructure: function () {
	// 	MolView.hideDialogs();
	// 	MolView.setLayer("main");
	// 	Messages.process(function () {
	// 		if (Sketcher.metadata.cid) {
	// 			Loader.PubChem.structureSearch("cid", Sketcher.metadata.cid, "substructure");
	// 		} else {
	// 			var smiles;
	// 			try {
	// 				smiles = Sketcher.getSMILES();
	// 			} catch (error) {
	// 				Messages.alert("smiles_load_error_force", error);
	// 				return;
	// 			}
	// 			Loader.PubChem.structureSearch("smiles", smiles, "substructure");
	// 		}
	// 	}, "search");
	// },

	// search_superstructure: function () {
	// 	MolView.hideDialogs();
	// 	MolView.setLayer("main");
	// 	Messages.process(function () {
	// 		if (Sketcher.metadata.cid) {
	// 			Loader.PubChem.structureSearch("cid", Sketcher.metadata.cid, "superstructure");
	// 		} else {
	// 			var smiles;
	// 			try {
	// 				smiles = Sketcher.getSMILES();
	// 			} catch (error) {
	// 				Messages.alert("smiles_load_error_force", error);
	// 				return;
	// 			}
	// 			Loader.PubChem.structureSearch("smiles", smiles, "superstructure");
	// 		}
	// 	}, "search");
	// },

	// search_similarity: function () {
	// 	MolView.hideDialogs();
	// 	MolView.setLayer("main");
	// 	Messages.process(function () {
	// 		if (Sketcher.metadata.cid) {
	// 			Loader.PubChem.structureSearch("cid", Sketcher.metadata.cid, "similarity");
	// 		} else {
	// 			var smiles;
	// 			try {
	// 				smiles = Sketcher.getSMILES();
	// 			} catch (error) {
	// 				Messages.alert("smiles_load_error_force", error);
	// 				return;
	// 			}
	// 			Loader.PubChem.structureSearch("smiles", smiles, "similarity");
	// 		}
	// 	}, "search");
	// },

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

	// load_more_pubchem: function () {
	// 	Loader.PubChem.loadNextSet();
	// },

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

var fileDialog = document.getElementById("file-dialog");
fileDialog.addEventListener('change', (a) => {
	Actions.handleFileUpload(a);
});

fileReader.addEventListener("load", b => {
	Actions.createSaveTree(JSON.parse(fileReader.result));
});