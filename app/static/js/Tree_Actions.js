function clearTreeMenu() {
    MolTree = new Treant(INITIAL);
}
//This function will create a new node in the MolTree
function storeMOL(mol3d, mol2d, smiles, singleFlag=false, parentId, newTreeFlag=false, saveTreeFlag=false) {
    console.log("mol2d: ", mol2d);
    console.log("mol3d: ", mol3d);
    console.log("id STOREBEFORE: ", parentId);
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
    console.log("saveTreeFlag: ", saveTreeFlag);
    console.log("id STOREAFTER: ", id);

    let parent = MolTree.tree.getNodeDb().get(id);
    //console.log("Parent id", id);
    let htmlid = "node-" + ((MolTree.tree.getNodeDb().db.length));

    let frag = {
        parent: parent,
        link: {
            href: ""
        },
        image: "",
        HTMLid: htmlid,
    };

    console.log("populate tree called");

    populateTree(id, frag, mol3d, mol2d, smiles, singleFlag);

}
//check the SMILES returned from pubchem (now through application) and see if it has fragments. 
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
                setTimeout(() => resolve(Model.loadMOL(node.get3d())), 10);
            })
        }).then(function(results) {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(Sketcher.loadMOL(node.get2d())), 20);
            });
        }).then(function(results) {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(cancelUpdateAnim()), 30);
            });
        })
        // var listenerPromise = () => { return new Promise ((resolve, reject) => {
        //     resolve(Model.loadMOL(node.get3d()));
        // })}
        // console.log("listenerPromise", listenerPromise);
        // listenerPromise.then(function(results) {console.log("model loaded; sketcher loading")});
        // listenerPromise.then(function(results) {Sketcher.loadMOL(node.get2d())});
        // listenerPromise.then(function(results) {console.log("sketcher loaded")});
        // setTimeout(function() {
        //     Actions.updateTree();
        // }, 100)
    });
}

//Every time a key is released, check to see if it is return. If it is the enter key, create new tree
document.getElementById("search-smile").addEventListener("keyup", function(event) {
    if(event.keyCode == 13) {
        document.getElementById("search-button").click();
    }
});

var winWidth = window.innerWidth;
// var resizeListener = window.addEventListener("resize", function resizeHandler(event) {
//     if(window.innerWidth >= (winWidth + 150) || window.innerWidth <= (winWidth - 150)) {
//         console.log("Event: ", event);
//         off('resize', resizeHandler);
//         Actions.redrawTree();
//         winWidth = window.innerWidth;
//     }
    
// })

window.addEventListener('resize', resizeHandler);

singleRedraw = 0;
function resizeHandler(event) {
    //Do not let resizing occur if the browser has not moved a certain width and if
    // the tree-menu-container is still hidden
    if((window.innerWidth >= (winWidth + 150) || window.innerWidth <= (winWidth - 150)) && $("#tree-menu-container")[0].style.display !== "none") {
        console.log("Event: ", event);
        window.removeEventListener('resize', resizeHandler);
        Actions.redrawTree();
        //winWidth = window.innerWidth;
        return;
    }
    if((window.innerWidth <= 500 && !singleRedraw) && $("#tree-menu-container")[0].style.display !== "none") {
        console.log("Event1: ");
        window.removeEventListener('resize', resizeHandler);
        Actions.redrawTree();
        //winWidth = window.innerWidth;
        singleRedraw = 1;
        return;
    }
    if((window.innerWidth >= 500 && singleRedraw) && $("#tree-menu-container")[0].style.display !== "none") {
        console.log("Event2:");
        window.removeEventListener('resize', resizeHandler);
        Actions.redrawTree();
        //winWidth = window.innerWidth;
        singleRedraw = 0;
        return;
    }
}

$(window).resize(function() {
    MolTree.tree.redraw();
    MolTree.tree.positionNodes();
    MolTree.tree.redraw();
    nodesMT = MolTree.tree.getNodeDb().db;
    nodesMTDB = MolTree.tree.getNodeDb();
})

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
        //cancelUpdateAnim();
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
    //id is === to parentId
    console.log("id: ", id);
    console.log("fragPT: ", frag);
    console.log("mol2dPT: ", mol2d);
    console.log("mol3dPT: ", mol3d);
    MolTree.tree.addNode(MolTree.tree.getNodeDb().get(id), frag);
    let parent = MolTree.tree.getNodeDb().get(id);
    let child = parent.childAt(parent.children.length - 1);
    let element = document.getElementById(child.nodeHTMLid);
    let elementId = element.id;
    console.log("element: ", element);
    console.log("elementID: ", elementId);
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

    // if(!singleFlag) {
    //     setTimeout(function () {
    //         var dataURL = Sketcher.toDataURL();
    //         var blob = dataURItoBlob(dataURL);
    //         var url = URL.createObjectURL(blob);
    //         var imgTag = document.getElementById(elementId);
    //         var imgId = "img" + elementId;
    //         imgTag.innerHTML = "<img id=" + imgId.replace("node-", "") + " src=" + url + ">";
    //     }, 50)
    // }
    // else {
    //     var dataURL = Sketcher.toDataURL();
    //     var blob = dataURItoBlob(dataURL);
    //     var url = URL.createObjectURL(blob);
    //     var imgTag = document.getElementById(elementId);
    //     var imgId = "img" + elementId
    //     imgTag.innerHTML = "<img id=" + imgId.replace("node-", "") + " src=" + url + ">";
    // }

    //WORKED BEFORE BUT MIGHT NOT NOW
    // setTimeout(function () {
    //     var divId = document.getElementById(elementId);
    //     divId.title = smile;
    // }, 500)
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
// //Set textbox to default caffeine node
// var smileText = document.getElementById("search-smile");
// smileText.value = "N1(C(=O)C2=C(N=CN2C)N(C)C1=O)C";
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
    //Actions.treeSmile("N1(C(=O)C2=C(N=CN2C)N(C)C1=O)C");
    document.title = "FragView";
    var loadingText = document.getElementById("welcome-loading-msg");
    //var loadingAnim = document.getElementById("loadAnim");
    var updateAnim = document.getElementById("loadModelAnim");
    // loadingText.innerText = "Loading complete";
    //loadingAnim.style.display = "none";
    loadModelAnim.style.display = "none";
    //enable eraser button from application load.
    // var eraserButton = document.getElementById("action-mp-eraser");
    // eraserButton.click();
    // document.getElementById("closeWelcomeBannerBtn").disabled = false;
    //MolTree.tree.positionNodes();
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
    //     setTimeout(function() {
    //         var dataURL = Sketcher.toDataURL();
    //         var blob = dataURItoBlob(dataURL);
    //         var url = URL.createObjectURL(blob);
    //         return url;
    //     }, 250);
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
        //$("#welcome-loading-msg").hide();
        $("#welcome-button-bar").show();
        document.getElementById("action-mp-eraser").click();
        document.getElementById("closeWelcomeBannerBtn").disabled = false;
        document.getElementById("welcome-loading-msg").innerText = "Loading complete";
        document.getElementById("loadAnim").style.display = "none";
        $("#closeWelcomeBannerBtn").on("click", startupSMILE);
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