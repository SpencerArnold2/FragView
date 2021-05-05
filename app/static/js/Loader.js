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
 * Loads remote data into MolView
 * Wrapper of Request.js
 * Called mainly by Actions.js
 * @type {Object}
 */
var Loader = {
	/**
	 * Last queried chemical identifier
	 * @type {Object}
	 */
	ajaxCompleted: false,

	// lastQuery: {
	// 	type: "", //q || cid || pdbid || codid || smiles
	// 	content: ""
	// },

	// /**
	//  * Set last queried chemical identifier
	//  * @param {String}  type         q || cid || pdbid || codid || smiles
	//  * @param {String}  content      Content string for type
	//  * @param {Boolean} forceReplace Indicates if History should use replaceState
	//  */
	// setQuery: function (type, content, forceReplace) {
	// 	content = String(content);
	// 	this.lastQuery.type = type;
	// 	this.lastQuery.content = content;
	// 	History.push(type, content, forceReplace);

	// 	$("#model-source").removeClass("disabled");
	// 	if (type === "q" || type === "smiles") $("#model-source")
	// 		.text("3D model source")
	// 		.removeAttr().addClass("disabled");
	// 	else if (type === "cid") $("#model-source")
	// 		.text("PubChem source")
	// 		.attr("href", Request.PubChem.staticURL(content));
	// 	else if (type === "pdbid") $("#model-source")
	// 		.text("RCSB source")
	// 		.attr("href", Request.RCSB.staticURL(content));
	// 	else if (type === "codid") $("#model-source")
	// 		.text("COD source")
	// 		.attr("href", Request.COD.staticURL(content));
	// },

	// /**
	//  * Resolve structure identifier from the #search-input using the CIR
	//  * @param {String}  test    Alernative search string
	//  * @param {Boolean} noReset Disable progress resetting
	//  */
	// CIRsearch: function (text, noReset) {
	// 	if (!Request.CIR.available) {
	// 		Messages.alert("cir_func_down");
	// 		return;
	// 	}

	// 	if (!noReset) Progress.reset(3);

	// 	var query = text || $("#search-input").val();

	// 	Request.CIRsearch(query, function (mol2d, mol3d, text) {
	// 		Sketcher.loadMOL(mol2d);
	// 		Sketcher.markUpdated();

	// 		text = ucfirst(text);
	// 		document.title = text;

	// 		Progress.complete();
	// 		Messages.clear();

	// 		Loader.setQuery("q", text);
	// 	}, function () {
	// 		Messages.alert("load_fail");
	// 	});
	// },

	// PubChem: {
	// 	i: 0,
	// 	step: 10,
	// 	loading: false,
	// 	ssli: 1000, //structure search lookup interval

	// 	loadCIDS: function (cids) {
	// 		if (cids.length === 0) return;

	// 		Request.PubChem.description(cids, function (data) {
	// 			/**
	// 			 * In some cases PubChem will return two objects with the same CID
	// 			 * containing different metadata. For now, we will only use the first
	// 			 * object in the array and skip the others.
	// 			 */
	// 			var used = [];
	// 			for (var i = 0; i < data.InformationList.Information.length; i++) {
	// 				var cid = data.InformationList.Information[i].CID;
	// 				if (used.indexOf(cid) !== -1) continue;
	// 				used.push(cid);
	// 				SearchGrid.addEntry(data.InformationList.Information[i]);
	// 			}

	// 			SearchGrid.endLoading(Loader.PubChem.i >= Request.PubChem.data.length);
	// 			Loader.PubChem.loading = false;
	// 			Progress.complete();
	// 		},
	// 			function () {
	// 				Messages.alert("remote_noreach");
	// 			});
	// 	},

	// 	loadNextSet: function () {
	// 		if (this.loading) return;
	// 		if (this.i < Request.PubChem.data.length) {
	// 			this.loading = true;
	// 			SearchGrid.startLoading();

	// 			var start = this.i;
	// 			var end = this.i + this.step;
	// 			if (end > Request.PubChem.data.length) end = Request.PubChem.data.length;

	// 			this.loadCIDS(Request.PubChem.data.slice(start, end));
	// 			this.i = end;
	// 		}
	// 	},

	// 	search: function () {
	// 		var text = $("#search-input").val();

	// 		Progress.reset(3);

	// 		Request.PubChem.search(text, function () {
	// 			Messages.clear();
	// 			Actions.show_search_layer();

	// 			SearchGrid.setDatabase("pubchem");
	// 			SearchGrid.clear();

	// 			Loader.PubChem.i = 0;
	// 			Loader.PubChem.loadNextSet();
	// 		},
	// 			function (statusCode) {
	// 				Messages.alert(statusCode === 404 ? "search_notfound" : "search_fail");
	// 			});
	// 	},

	// 	structureSearch: function (query, value, type) {
	// 		Progress.reset(3);

	// 		Request.PubChem.structureSearch(query, value, type, function (listkey) {
	// 			Progress.increment();

	// 			function lookup() {
	// 				Request.PubChem.list(listkey,
	// 					function () //success
	// 					{
	// 						Progress.increment();
	// 						Messages.clear();
	// 						Actions.show_search_layer();

	// 						SearchGrid.setDatabase("pubchem");
	// 						SearchGrid.clear();

	// 						Loader.PubChem.i = 0;
	// 						Loader.PubChem.loadNextSet();
	// 					},
	// 					function (newlistkey) //wait
	// 					{
	// 						listkey = newlistkey;
	// 						window.setTimeout(lookup, Loader.PubChem.ssli);
	// 					},
	// 					function (statusCode) //error
	// 					{
	// 						Messages.alert("search_fail");
	// 					});
	// 			}

	// 			lookup();
	// 		},
	// 			function (statusCode) {
	// 				Messages.alert(statusCode === 404 ? "search_notfound" : "search_fail");
	// 			});
	// 	},

	// 	loadName: function (name, cirfallback) {
	// 		Progress.reset(cirfallback ? 9 : 6);

	// 		Messages.process(function () {
	// 			Request.PubChem.nameToCID(name, function (cid) {
	// 				Progress.increment();
	// 				Loader.PubChem._loadCID(cid, ucfirst(name));
	// 			}, function () {
	// 				if (cirfallback) {
	// 					Loader.CIRsearch(name, true);
	// 				} else {
	// 					Messages.alert("load_fail");
	// 				}
	// 			});
	// 		}, "compound");
	// 	},

	// 	loadCID: function (cid, name) {
	// 		Progress.reset(4);

	// 		name = ucfirst(name);

	// 		Messages.process(function () {
	// 			Loader.PubChem._loadCID(cid, name);
	// 		}, "compound");
	// 	},

	// 	_loadCID: function (cid, name) {
	// 		//request 2D molecule
	// 		Request.PubChem.sdf(cid, true, function (mol2d) {
	// 			Sketcher.loadMOL(mol2d);
	// 			Sketcher.metadata.cid = cid;
	// 			Sketcher.markUpdated();

	// 			Progress.increment();

	// 			//request 3D molecule
	// 			Request.PubChem.sdf(cid, false, function (mol3d) {
	// 				document.title = name || "MolView";
	// 				Loader.setQuery("cid", cid);

	// 				Progress.complete();
	// 				Messages.clear();
	// 			},
	// 				function () //error: resolve using NCI
	// 				{
	// 					Progress.increment();

	// 					var smiles;
	// 					try {
	// 						smiles = Sketcher.getSMILES();
	// 					} catch (error) {
	// 						Sketcher.markUpdated();

	// 						document.title = name || "MolView";
	// 						Loader.setQuery("cid", cid);

	// 						Progress.complete();
	// 						Messages.clear();

	// 						return;
	// 					}

	// 					Progress.increment();

	// 					Request.CIR.resolve(smiles, false, function (mol3d) {
	// 						Sketcher.markUpdated();

	// 						document.title = name || "MolView";
	// 						Loader.setQuery("cid", cid);

	// 						Progress.complete();
	// 						Messages.clear();
	// 					},
	// 						function () {
	// 							Sketcher.markUpdated();

	// 							document.title = name || "MolView";
	// 							Loader.setQuery("cid", cid);

	// 							Progress.complete();
	// 							Messages.clear();
	// 						});
	// 				});
	// 		},
	// 			function () {
	// 				Messages.alert("load_fail");
	// 			});
	// 	}
	// },

	// RCSB: {
	// 	i: 0,
	// 	step: 10,
	// 	loading: false,

	// 	loadPDBIDS: function (pdbids) {
	// 		if (pdbids.length === 0) return;

	// 		Request.RCSB.information(pdbids, function (data) {
	// 			for (var i = 0; i < data.dataset.length; i++) {
	// 				SearchGrid.addEntry(data.dataset[i]);
	// 			}

	// 			SearchGrid.endLoading(Loader.RCSB.i >= Request.RCSB.data.length);
	// 			Loader.RCSB.loading = false;
	// 			Progress.complete();
	// 		},
	// 			function () {
	// 				Messages.alert("remote_noreach");
	// 			});
	// 	},

	// 	loadNextSet: function () {
	// 		if (this.loading) return;
	// 		if (this.i < Request.RCSB.data.length) {
	// 			this.loading = true;
	// 			SearchGrid.startLoading();

	// 			var start = this.i;
	// 			var end = this.i + this.step;
	// 			if (end > Request.RCSB.data.length) end = Request.RCSB.data.length;

	// 			this.loadPDBIDS(Request.RCSB.data.slice(start, end));
	// 			this.i = end;
	// 		}
	// 	},

	// 	search: function () {

	// 		var text = $("#search-input").val();

	// 		Progress.reset(3);

	// 		Request.RCSB.search(text, function () {
	// 			Messages.clear();
	// 			Actions.show_search_layer();

	// 			SearchGrid.setDatabase("rcsb");
	// 			SearchGrid.clear();

	// 			Loader.RCSB.i = 0;
	// 			Loader.RCSB.loadNextSet();
	// 		},
	// 			function () {
	// 				Messages.alert("search_fail");
	// 			});
	// 	},

	// 	loadPDBID: function (pdbid, name) {
	// 		Progress.reset(2);

	// 		function finish() {
	// 			Sketcher.markOutdated();

	// 			document.title = name || pdbid.toUpperCase();

	// 			Progress.complete();
	// 			Messages.clear();

	// 			Loader.setQuery("pdbid", pdbid);
	// 		}

	// 		MolView.setLayout("model");
	// 		Messages.process(function () {
	// 			Progress.increment();

	// 			Request.RCSB.PDB(pdbid, function (pdb) {
	// 				if (!Detector.webgl) {
	// 					if (MolView.mobile) {
	// 						Messages.alert("mobile_old_no_macromolecules");
	// 					} else {
	// 						if (Model.isJSmol()) {
	// 							Model.loadPDB(pdb);
	// 							finish();
	// 						} else //switch to JSmol
	// 						{
	// 							Model.preloadPDB(pdb);
	// 							Model.setRenderEngine("JSmol", finish);
	// 						}
	// 					}
	// 				} else {
	// 					if (Model.isGLmol()) {
	// 						Model.loadPDB(pdb);
	// 						finish();
	// 					} else //switch to GLmol
	// 					{
	// 						Model.preloadPDB(pdb);
	// 						Model.setRenderEngine("GLmol", finish);
	// 					}
	// 				}
	// 			},
	// 				function () {
	// 					Messages.alert("load_fail");
	// 				});
	// 		}, "macromolecule");
	// 	}
	// },

	// COD: {
	// 	i: 0,
	// 	step: 10,
	// 	loading: false,

	// 	loadNextSet: function () {
	// 		SearchGrid.startLoading();

	// 		window.setTimeout(function () {
	// 			if (this.loading) return;
	// 			if (this.i < Request.COD.data.length) {
	// 				for (var end = this.i + this.step; this.i < Request.COD.data.length && this.i < end; this.i++) {
	// 					SearchGrid.addEntry(Request.COD.data[this.i]);
	// 				}

	// 				SearchGrid.endLoading(Loader.COD.i >= Request.COD.data.length);
	// 				this.loading = false;
	// 				Progress.complete();
	// 			}
	// 		}.bind(this), 300);
	// 	},

	// 	search: function () {
	// 		var text = $("#search-input").val();

	// 		Progress.reset(3);

	// 		Request.COD.search(text, function () {
	// 			Messages.clear();
	// 			Actions.show_search_layer();

	// 			SearchGrid.setDatabase("cod");
	// 			SearchGrid.clear();

	// 			Loader.COD.i = 0;
	// 			Loader.COD.loadNextSet();
	// 		},
	// 			function (offline) {
	// 				Messages.alert(offline ? "remote_noreach" : "search_fail");
	// 			});
	// 	},

	// 	/**
	// 	 * Load a Crystal model using a COD ID
	// 	 * @param {String} codid        COD ID
	// 	 * @param {String} name         Crystal name
	// 	 * @param {String} PubChem_name PubChem Compound name for 2D depiction
	// 	 */
	// 	loadCODID: function (codid, name, PubChem_name) {
	// 		Progress.reset(4);

	// 		MolView.makeModelVisible();

	// 		function finish() {
	// 			document.title = name || "COD: " + codid;

	// 			Progress.complete();
	// 			Messages.clear();

	// 			Loader.setQuery("codid", codid);
	// 		}

	// 		function smilesFallback(cb) //cb(mol2d, smiles)
	// 		{
	// 			Request.COD.smiles(codid, function (data) {
	// 				Progress.increment();

	// 				if (data.records[0].smiles === "") {
	// 					cb(null);
	// 				} else {
	// 					Request.CIR.resolve(data.records[0].smiles, true,
	// 						function (mol2d) {
	// 							cb(mol2d, data.records[0].smiles);
	// 						},
	// 						function () {
	// 							cb(null);
	// 						});
	// 				}
	// 			}, function () {
	// 				cb(null);
	// 			});
	// 		}

	// 		function fallback() {
	// 			smilesFallback(function (mol2d, smiles) {
	// 				if (mol2d) {
	// 					Sketcher.metadata.smiles = smiles;
	// 					Sketcher.loadMOL(mol2d, true);
	// 					Sketcher.markUpdated();

	// 					finish();
	// 					Messages.alert("crystal_2d_unreliable");
	// 				} else {
	// 					finish();
	// 					Messages.alert("crystal_2d_fail");
	// 				}
	// 			});
	// 		}

	// 		function nameToCID(name) {
	// 			Request.PubChem.nameToCID(name, function (cid) {
	// 				Progress.increment();

	// 				Request.PubChem.sdf(cid, true, function (mol2d) {
	// 					Sketcher.metadata.cid = cid;
	// 					Sketcher.loadMOL(mol2d);
	// 					Sketcher.markUpdated();

	// 					finish();
	// 					Messages.alert("crystal_2d_unreliable");
	// 				},
	// 					function () {
	// 						finish();
	// 						Messages.alert("crystal_2d_fail");
	// 					});
	// 			}, fallback);
	// 		}

	// 		Messages.process(function () {
	// 			//load CIF
	// 			Request.COD.CIF(codid, function (cif) {
	// 				Model.loadCIF(cif, [1, 1, 1], function () {
	// 					Progress.increment();

	// 					/*
	// 					load structural formule

	// 					if PubChem_name is defined
	// 					  - check if PubChem_name is CID primary name
	// 					  - convert name to PubChem CID
	// 					  - CID to 2D sdf
	// 					else
	// 					  - convert CODID to name
	// 					  - convert name to PubChem CID
	// 					  - CID to 2D sdf
	// 					fallback
	// 					  - CODID to smiles
	// 					  - Resolve smiles using CIR
	// 					*/

	// 					if (PubChem_name !== undefined) {
	// 						//check if PubChem_name is CID primary name
	// 						Request.PubChem.primaryName(PubChem_name, function (name) {
	// 							Progress.increment();

	// 							if (name.toLowerCase() === PubChem_name.toLowerCase()) {
	// 								//convert name to PubChem CID
	// 								nameToCID(name);
	// 							} else fallback();
	// 						}, fallback);
	// 					} else {
	// 						if (name === undefined || name === "MolView") {
	// 							//convert CODID to name
	// 							Request.COD.name(codid, function (data) {
	// 								Progress.increment();

	// 								if (data.records[0].name !== "") {
	// 									//convert name to PubChem CID
	// 									nameToCID(data.records[0].name);
	// 								} else fallback();
	// 							}, fallback);
	// 						} else {
	// 							nameToCID(name);
	// 						}
	// 					}
	// 				});
	// 			},
	// 				function () {
	// 					Messages.alert("load_fail");
	// 				});
	// 		}, "crystal");
	// 	}
	// },

	/**
	 * Cleans current structural formula using CIR depictionq
	 */
	clean: function () {
		Progress.reset(4);

		var smiles;
		try {
			smiles = Sketcher.getSMILES();

		} catch (error) {
			Messages.alert("smiles_load_error", error);
			return;
		}

		Request.resolve(smiles, 0, true, function (mol, cid) {
			Sketcher.loadMOL(mol);
			Progress.complete();
			Messages.clear();
		},
			function () {
				Messages.alert("load_fail");
			});
	},

	/**
	 * Converts the current structural formula into a 3D model
	 */
	resolve: function (smile = null) {
		Progress.reset(4);
		let frags;
		let smiles = smile;

		if (!smiles) {
			try {
				smiles = Sketcher.getSMILES();
			} catch (error) {
				Messages.alert("smiles_load_error", error);
				//Stops loading animation if failure from fragmenting nothing occurs
				cancelUpdateAnim();
				return;
			}
			if (hasFragment(smiles)) {
				frags = smileSplitter(smiles);
			}
			else {
				Loader._resolve(smiles);
				return;
			}
			if (frags.length === 2) {
				splitPromise(smiles);
				let index = document.getElementsByClassName("active")[0].id;
				index = index.replace("node-", "");
				index = parseInt(index, 10);
				let node = MolDataList.getNode(index);
				Model.loadMOL(node.get3d());
				Sketcher.loadMOL(node.get2d());
			}

			else {
				splitPromise(smiles);
			}
		}
	},

	/**
	 * Converts the current structural formula into a 3D model
	 */
	_resolve: function (smile) {
		Progress.reset(4);
		let promise3d = simpleSmileThenStore(smile);
		promise3d.then(function (results) {
			let index = document.getElementsByClassName("active")[0].id;
			index = index.replace("node-", "");
			index = parseInt(index, 10);
			let node = MolDataList.getNode(index);
			Model.loadMOL(node.get3d());
			Sketcher.loadMOL(node.get2d());
		}).then(function (results) {
			cancelUpdateAnim();
		})
		Progress.complete();
		Messages.clear();
	},

	/**
	 * Loads 2D and 3D molecule for a given SMILES string
	 * @param {String} smiles SMILES
	 * @param {String} title  New document title
	 */
	loadSMILES: function (smiles, fragFlag = false, newTreeFlag = false, inchiFlag = false) {
		//console.log("INCHI", inchiFlag);
		Progress.reset(4);

		var start = smiles;

		//ParentId statement taken from Actions.js
		let parentId = document.getElementsByClassName("active")[0].id;

		var originalSmile = smiles;

		if (fragFlag === true) {
			fragsSent = smiles;

			originalSmile = smiles.join(" ");
			fragsSent.push(originalSmile);
		}
		else {
			if (smiles.search('.') !== 0 || -1) {
				smiles = smiles.split('.');
			}
			else {
				smiles = $.makeArray(smiles);
			}
		}

		var molInfo;
		if(!inchiFlag) {
			molInfo = {
				"smiles": smiles
			};
		}
		else {
			molInfo = {
				"inchi": smiles
			};
		}

		var sortedSmile = [];
		//Sorts the array to have the smiles with the shortest lengths come first.
		// NOTE: this is done completely off of string length and not based on atoms or
		// bonds.
		if (newTreeFlag) {
			sortedSmiles = smiles.sort(function (i, o) {
				return i.length - o.length;
			})
			sortedSmiles.unshift(originalSmile);
		}
		else {
			sortedSmiles = start.sort(function (i, o) {
				return i.length - o.length;
			})
			sortedSmiles.pop();
		}

		var fragInfo;

		smiles = JSON.stringify(molInfo);
		var rootFlag;
		var count = 0;
		if(!inchiFlag) {
			fragInfo = {
				"smile": sortedSmiles[0]
			};
		}
		//Even though Inchi is accepted, the smile from
		// the molecule generated with the Inchi will be returned
		// for 3d molfile generation
		else {
			fragInfo = {
				"smile": sortedSmiles[0]
			};
		}
		frag = JSON.stringify(fragInfo);
		MolGraph.storeMol(Sketcher.getMOL(), "broken", parseInt(parentId.replace("node-", "")), parseInt(parentId.replace("node-", "")));
		if (newTreeFlag && document.getElementById("search-smile").value.contains('.')) {
			fragFlag = true;
		}

		//Fix duplicate parent as child if new tree created with no fragments
		if(newTreeFlag && !document.getElementById("search-smile").value.contains('.')) {
			sortedSmiles.pop();
		}

		if(sortedSmiles.length <= 30) {
			Loader.makeAjax(sortedSmiles, newTreeFlag, rootFlag, count, sortedSmiles.length, parentId, fragFlag, inchiFlag);
		}
		else {
			Messages.alert("fragmentation_limit_reached");
			$("#loadModelAnim").hide();
		}
	},

	makeAjax: function (smiles, newTreeFlag, rootFlag, count, smilesLength, parentId, fragFlag, inchiFlag) {
		var smile;
		if(newTreeFlag) {
			document.getElementById("uploadDialogText").innerText = "Creating new tree...    ";
			$("#uploadTreeDialog").show();
		}
		smiles[count].contains('InChI') ? inchiFlag = true : inchiFlag = false;
		if(!inchiFlag) {
			smile = {
				"smile": smiles[count]
			}
		}
		else {
			smile = {
				"inchi": smiles[count]
			};
		}
		var frag = JSON.stringify(smile);
		AJAX({
			type: "POST",
			primary: true,
			url: (inchiFlag) ? "/2dInchi" : "/2dSingle",
			data: frag,
			dataType: "json",
			crossDomain: true,
			contentType: "application/json; charset=utf-8",
			defaultError: function () {
				$("#uploadTreeDialog").hide();
				Progress.complete();
				cancelUpdateAnim();
				document.title = "FragView";
				//Do not worry about showing message to user if a smile or InChI string with 31 or more
				// fragments is sent server and JS is disabled
				(inchiFlag) ? Messages.alert("fail_inchi_parse"): Messages.alert("fail_smile_parse");
			},
			success: function (result) {
				count++;
				var id = MolTree.tree.nodeDB.db.length - 1 + count;

				//Only needed for when the first tree is created for the session; however,
				// this allows the tree to be properly shown only when no errors with parsing
				// smile
				document.getElementById("tree-menu-container").style.display = "";
				if (newTreeFlag && count === 1) {
					if(MolTree.tree.nodeDB.db.length) {
						for (var i = 1; i < MolTree.tree.nodeDB.db.length; i++) {
							MolDataList.delNode(i.toString());
						}
					}
					clearTreeMenu();
				}

				var ajaxFinished = false;
				//Handle everything that must be corrected for setting up new data, such as
				// deleting old fragments for new tree
				if (count >= smilesLength) {
					Progress.complete();
					ajaxFinished = true;
				}

				new Promise((resolve, reject) => {
					setTimeout(() => resolve(Sketcher.loadMOL(result["output"][0])), 100);
				}).then(function (results) {

					return new Promise((resolve, reject) => {
						setTimeout(() => resolve(Loader.callback(result, JSON.parse(frag), parentId, ajaxFinished, fragFlag, count, newTreeFlag, inchiFlag)), 100);
					});
				}).then(function (results) {
					if (count < smilesLength) {
						return new Promise((resolve, reject) => {
							setTimeout(() => resolve(Loader.makeAjax(smiles, newTreeFlag, rootFlag, count, smilesLength, parentId, fragFlag, inchiFlag)), 100);
						});
					}
					else {

						//MolDataList will not be correctly updated with root data for no fragment new tree
						// so a setTimeout must be used
						return new Promise((resolve, reject) => {
							setTimeout(() => resolve(Loader.finalCallback(parentId, count, result, newTreeFlag, fragFlag)), 100)
						});
					}
				})
			}
		});
	},

	callback(result, fragInfo, parentId, ajaxFinished, fragFlag, count, newTreeFlag, inchiFlag) {
		if(inchiFlag) {
			fragInfo["smile"] = result["output"][1];
		}
		var rdkitMolecule = RDKit.Molecule.fromSmiles(fragInfo["smile"]);
		rdkitMolecule.addHs();
		rdkitMolecule.EmbedMolecule();
		rdkitMolecule.MMFFoptimizeMolecule();
		var rdkitMOL = rdkitMolecule.toMolfile();
		myMol = rdkitMOL.split("\n");
		myMol[0] = "111";
		if (newTreeFlag && count === 1) {
			Actions.treeSmileCont(result, myMol.join("\n"), result["output"][0]);
		}
		else {
			storeMOL(myMol.join("\n"), result["output"][0], fragInfo["smile"], false, parentId, newTreeFlag);
		}
	},

	finalCallback: function(parentId, count, result, newTreeFlag=false, fragFlag=false) {
		let node;
		if(newTreeFlag && fragFlag) {
			$("#node-0").removeClass("active");
			node = MolDataList.getNode("1");
			Sketcher.loadMOL(node.get2d());
			Model.loadMOL(node.get3d());
			$("#node-1").addClass("active");
		}
		else {
			if(newTreeFlag && !fragFlag) {
				node = MolDataList.getNode(0);
			}
			else {
				node = MolDataList.getNode(parentId.replace("node-",""));
			}
			
			Sketcher.loadMOL(node.get2d());
			Model.loadMOL(node.get3d());
			Messages.clear();
		}

		//Jmol.script(JSmol, "SELECT hydrogen; delete selected")
		cancelUpdateAnim();
		$("#uploadTreeDialog").hide();
	},

	loadSMILESRDKit: function (smiles, title) {
		Progress.reset(4);

		var RDKitRequest = new XMLHttpRequest();
		RDKitRequest.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				//console.log(this.responseText);
			}
		}
		RDKitRequest.open("GET", "2d", true);
		RDKitRequest.send();

		Request.resolve(smiles, 0, false, function (mol3d, cid) {
			Progress.increment();
			Model.loadMOL(mol3d);

			Request.resolve(smiles, cid, true, function (mol2d, cid) {
				Sketcher.loadMOL(mol2d);
				Sketcher.markUpdated();

				if (cid > 0) {
					Sketcher.metadata.cid = cid;
					Loader.setQuery("cid", cid, true);
				} else {
					Loader.setQuery("smiles", smiles);
				}

				Progress.complete();
				Messages.clear();

				document.title = title || "MolView";
			},
				function () {
					Messages.alert("load_fail");
				});
		},
			function () {
				Messages.alert("load_fail");
			});
	},
	_loadSMILES: function (smiles, title) {
		Progress.reset(4);

		Request.resolve(smiles, 0, false, function (mol3d, cid) {
			Progress.increment();

			Request.resolve(smiles, cid, true, function (mol2d, cid) {
				Sketcher.markUpdated();

				if (cid > 0) {
					Sketcher.metadata.cid = cid;
					Loader.setQuery("cid", cid, true);
				} else {
					Loader.setQuery("smiles", smiles);
				}

				Progress.complete();
				Messages.clear();
				storeMOL(mol3d, mol2d);

				document.title = title || "MolView";
			},
				function () {
					Messages.alert("load_fail");
				});
		},
			function () {
				Messages.alert("load_fail");
			});
	}
};