function clearTreeMenu() {
    MolTree = new Treant(INITIAL);
}
//This function will create a new node in the MolTree
function storeMOL(mol3d, mol2d, smiles, singleFlag=false, parentId, newTreeFlag=false, saveTreeFlag=false) {
    let id;
    if(parentId) {
        id = parentId;
    }
    else {
        id = document.getElementsByClassName("active")[0].id;
    }
    if(newTreeFlag) {
        id = "node-0";
    }
    if(!saveTreeFlag) {
        try {
            id = id.replace("node-", "");
            id = parseInt(id, 10);
        }
        catch{
            //Redraw tree was called
        }
    }
    else {
        id = parentId;
    }

    let parent = MolTree.tree.getNodeDb().get(id);
    let htmlid = "node-" + ((MolTree.tree.getNodeDb().db.length));

    let frag = {
        parent: parent,
        link: {
            href: ""
        },
        image: "",
        HTMLid: htmlid,
    };

    populateTree(id, frag, mol3d, mol2d, smiles, singleFlag);

} 
function hasFragment(smile) {
    let hasFrag = false;
    for (let i = 0; i < smile.length; i++) {
        if (smile.charAt(i) == ".") {
            hasFrag = true;
        }
    }
    return hasFrag;
}
function smileSplitter(smile) {
    let frags = smile.split(".");
    return frags;
}
function fragProcessor(frag) {
    return new Promise(function (resolve, reject) {
        Loader.resolve(frag);
        let wait = setTimeout(() => {
            clearTimeout(wait);
        }, 4000)
        resolve("did it");
    })

}
const timeout = time => new Promise(resolve => setTimeout(resolve, time));

function sketchThenLoad(smile) {
    return new Promise(function (resolve, reject) {
        Loader.loadSMILES(smile, document.title);
        resolve("this worked");
    })
}

//Currently, this does not work. This is old code from my tree that will need to be converted to the new Treant.js tree.
function selectMoleculeToDelete() {
    let treePosition = document.getElementsByClassName("active")[0].id;
    treePosition = treePosition.replace("node", "");
    treePosition = parseInt(treePosition, 10);
    let molList = BST.getMolList();
    let moleculeToDelete = molList[treePosition];
    BST.deleteNode(moleculeToDelete);
    updateGrid(BST);
}

var config = {
    container: "#tree-menu",
    rootOrientation: 'NORTH',
    scrollbar: "fancy",
    siblingSeperation: 20,
    subTeeSeparation: 60,
    connectors: {
        type: "step"
    },
    node: {
        HTMLclass: ''
    }
},
    root = {
        link: {
            href: ""
        },
        HTMLid: "node-0",
        HTMLclass: "active"

    },
    INITIAL = [config, root];

//This adds an event listener to all the Nodes in the Treant.
function addClickHandler(element) {
    element.addEventListener("click", function () {
        $(".r-mode").removeClass("checked");
        document.getElementById("action-model-balls").classList.add("checked");
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        let index = document.getElementsByClassName("active")[0].id;
        var nodeId = index;
        index = index.replace("node-", "");
        index = parseInt(index, 10);
        let node = MolDataList.getNode(index);
        new Promise(function(resolve, reject) {
            resolve(resetUpdateAnim());
        }).then(function(results) {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(Model.loadMOL(node.get3d())), 20);
            })
        }).then(function(results) {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(Sketcher.loadMOL(node.get2d())), 20);                
            });
        }).then(function(results) {
            return new Promise((resolve, reject) => {
                console.log(MolDataList.getNode(index));
                setTimeout(() => resolve(colorHydrogens(index)), 20);
            }); 
        }).then(function(results) {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(cancelUpdateAnim()), 20);
            });
        })
    });
}

function colorHydrogens(nodeId){
    var node = MolDataList.getNode(nodeId);
    MolGraph.storeMol(node.mol2d, "child");
    MolGraph.storeMol(node.mol3d, "childH");
    var parentId = node.parentId;
    MolGraph.storeMol(MolDataList.getNode(parentId)["mol2d"], "new");
    MolGraph.storeMol(MolDataList.getNode(parentId)["mol3d"], "newH");
    MolGraph.colorHydrogens(MolGraph.newMol, MolGraph.newHMol, MolGraph.brokenMol, MolGraph.childMol, MolGraph.childHMol);
    // if(JSON.stringify(MolGraph.organizeMol(childMol)) != JSON.stringify(MolGraph.newMol)){
        
    // }
    
    // for(i=0;i<affectedAtoms.length;i++){
    //     //Jmol.script(JSmol, "SELECT connected(" + MolFollower.childMol[affectedAtoms[i]][0] + (affectedAtoms[i]+1) + ") and Hydrogen; color orange");
    // }
}

//Every time a key is released, check to see if it is return. If it is the enter key, create new tree
document.getElementById("search-smile").addEventListener("keyup", function(event) {
    if(event.keyCode == 13) {
        document.getElementById("search-button").click();
    }
});

//Get initial window width and initialize resize handler
var winWidth = window.innerWidth;
var winHeight = window.innerHeight;
window.addEventListener('resize', resizeHandler);

singleRedraw = 0;
function resizeHandler(event) {
    //Do not let resizing occur if the browser has not moved a certain width and if
    // the tree-menu-container is still hidden
    if(((window.innerWidth >= (winWidth + 150) || window.innerWidth <= (winWidth - 150)) || (window.innerHeight >= (winHeight + 30) || window.innerHeight <= (winHeight - 30))) && $("#tree-menu-container")[0].style.display !== "none") {
        window.removeEventListener('resize', resizeHandler);
        Actions.redrawTree();
        return;
    }
    if((window.innerWidth <= 500 && !singleRedraw) && $("#tree-menu-container")[0].style.display !== "none") {
        window.removeEventListener('resize', resizeHandler);
        Actions.redrawTree();
        singleRedraw = 1;
        return;
    }
    if((window.innerWidth > 500 && singleRedraw) && $("#tree-menu-container")[0].style.display !== "none") {
        window.removeEventListener('resize', resizeHandler);
        Actions.redrawTree();
        singleRedraw = 0;
        return;
    }
}

//Test without
// $(window).resize(function() {
//     MolTree.tree.redraw();
//     MolTree.tree.positionNodes();
//     MolTree.tree.redraw();
//     nodesMT = MolTree.tree.getNodeDb().db;
//     nodesMTDB = MolTree.tree.getNodeDb();
// })

function convertSmileTo3d(smiles) {
    return new Promise(function (resolve, reject) {
        Progress.increment();
        var rdkitMolecule = RDKit.Molecule.fromSmiles(smiles);
        rdkitMolecule.addHs();
        rdkitMolecule.EmbedMolecule();
        rdkitMolecule.MMFFoptimizeMolecule();
        var rdkitmol = rdkitMolecule.toMolfile();
        var mymol = rdkitmol.split("\n");
        mymol[0] = "2";
        let results = [mymol.join("\n")];
        resolve(results);
    })
}
function convertSmileTo2d(smiles, mol3d, mol2d) {
    Progress.increment();
    return new Promise(function (resolve, reject) {
        Progress.increment();
        Sketcher.loadMOL(mol2d);
        Progress.complete();
        Messages.clear()
        let results = [mol3d, mol2d];

        resolve(results);
    })
}
function simpleSmileThenStore(smile) {
    return new Promise(function (resolve, reject) {
        var singleFlag = true;
        Progress.increment();
        Progress.increment();
        var rdkitMolecule = RDKit.Molecule.fromSmiles(smile);
        rdkitMolecule.addHs();
        rdkitMolecule.EmbedMolecule();
        rdkitMolecule.MMFFoptimizeMolecule();
        var rdkitMOL = rdkitMolecule.toMolfile();
        var mymol = rdkitMOL.split("\n");
        mymol[0] = "1";
        storeMOL(mymol.join("\n"), Sketcher.getMOL(), smile, singleFlag);
        let results = [mymol.join("\n")];
        resolve(results);
    })
}
//I will delete this function later. It is here to try to give diversity to mols.
function temp(index) {
    if (index % 2 == 0) {
        let newNode = new MolNode(testMol3D_n1, testMol2D_n1);
        return newNode;
    }
    else {
        let newNode = new MolNode(testMol3D_n2, testMol2D_n2);
        return newNode;
    }
}

//IMPORTANT EDIT 2/05/2020: After five fragments changes, singleFlag is needed so screenshot
// for a single fragment will not have any staggering setTimeout
//This is called in addClickHandler to create a new node and pass fragments to the MolList
function populateTree(id, frag, mol3d, mol2d, smile, singleFlag=false) {
    //id is equal to parentId
    MolTree.tree.addNode(MolTree.tree.getNodeDb().get(id), frag);
    let parent = MolTree.tree.getNodeDb().get(id);
    let child = parent.childAt(parent.children.length - 1);
    let element = document.getElementById(child.nodeHTMLid);
    let elementId = element.id;
    let newNode = new MolNode(mol3d, mol2d, smile, id, parseInt(elementId.replace("node-",""), 10));
    MolDataList.pushNode(newNode);
    addClickHandler(element, elementId);

    var dataURL = Sketcher.toDataURL();
    var blob = dataURItoBlob(dataURL);
    var url = URL.createObjectURL(blob);
    var imgTag = document.getElementById(elementId);
    var imgId = "img" + elementId
    imgTag.innerHTML = "<img id=" + imgId.replace("node-", "") + " src=" + url + ">";

    var divId = document.getElementById(elementId);
    divId.title = smile;
}

//This jump starts the system; added starting caffeine smile to textbox.
//NOTE: If errors are occurring with screenshots, check this function (commenting out defaultNode and pushing node
// to molDataList causes errors)
var MolTree = new Treant(INITIAL);
var MolDataList = new MolList();
//Set textbox to default caffeine node
var smileText = document.getElementById("search-smile");
smileText.value = "N1(C(=O)C2=C(N=CN2C)N(C)C1=O)C";
let DefaultNode = new MolNode(defaultMol3D, defaultMol2D, smileText.value);
MolDataList.pushNode(DefaultNode);
//Hide tree at the beginning
document.getElementById("tree-menu-container").style.display = "none";
var textClicked = 0;
smileText.onclick = function() {
    if(!textClicked) {
        smileText.value = "";
        textClicked++;
    }
}

let DomRoot = document.getElementById("node-0");
width = window.innerWidth;
height = window.innerHeight;
//Fix 3D model size on Linux server
window.resizeTo(width, height);
//CHECK resize for Firefox compatibility put here.
setTimeout(function () {
    var DomRootURL = sketcherBlobURL(true);
    setTimeout(function() {
        addClickHandler(DomRoot);
        //DomRootSmile = Sketcher.getSMILES();
        //DomRoot.title = DomRootSmile;
    }, 500);
    document.title = "FragView";
    var loadingText = document.getElementById("welcome-loading-msg");
    var updateAnim = document.getElementById("loadModelAnim");
    loadModelAnim.style.display = "none";
}, 750);




// Create URL for sketcher blob.
function sketcherBlobURL(start=false) {
    if(start == false) {
        var dataURL = Sketcher.toDataURL();
        var blob = dataURItoBlob(dataURL);
        var url = URL.createObjectURL(blob);
        return url;
    }
    else {
        Sketcher.resize();
    }
}

function splitPromise(smile) {
    frags = smileSplitter(smile);
    Loader.loadSMILES(frags, true);
}

//Reset the styling for the updating animation
function resetUpdateAnim() {
    var updateElem = document.getElementById("loadModelAnim");
    updateElem.style = {
        'display': ''
    };
}

function cancelUpdateAnim() {
    document.getElementById("loadModelAnim").style.display = "none";
}

function uploadTreeDialogStart() {
    var dialog = document.getElementById("uploadTreeDialog");

}

var jsmolLoadCount = 0;

function handleLoadCompletion() {
    if(jsmolLoadCount) {
        $("#welcome-button-bar").show();
        document.getElementById("action-mp-eraser").click();
        //Never show close button
        //document.getElementById("closeWelcomeBannerBtn").disabled = false;
        document.getElementById("welcome-loading-msg").innerText = "Loading complete";
        document.getElementById("loadAnim").style.display = "none";
        $("#closeWelcomeBannerBtn").on("click", startupSMILE);
        $("#closeWelcomeBannerBtn").click();
    }
    jsmolLoadCount++;
}

function startupSMILE(event) {
    var smileTxt = document.getElementById("welcomeTextBox");
    if(smileTxt.value !== "") {
        document.getElementById("search-smile").value = smileTxt.value;
        Actions.treeSmile('', true);
    }
}

window.addEventListener('resize', function() {
    //var remaining = $("#menu-bar").width() - $("#main-menu").width() - $("#loadModelAnim").width() * 5;
    var remaining = $("#menu-bar").width() / 3;
    document.getElementById("search-smile").style.width = (remaining).toString() + "px";
})

//document.getElementById("search-smile").style.width = ($("#menu-bar").width() - $("#main-menu").width() - $("#loadModelAnim").width() * 5).toString() + "px";
document.getElementById("search-smile").style.width = ($("#menu-bar").width() / 3).toString() + "px";