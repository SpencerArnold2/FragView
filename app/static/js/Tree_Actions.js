const navSlide = () => {
    const burger = document.querySelector(".tree-toggle-button");
    burger.addEventListener("click", () =>{
        openTreeMenu();
        burger.classList.toggle("animate");
    });
}
function updateActive(){
        var nodeContainer = document.getElementById("tree-menu");
        var mol3D;
        var nodes = nodeContainer.getElementsByClassName("tree-node");

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
            let index = document.getElementsByClassName("active")[0].id;
            index = index.replace("node", "");
            index = parseInt(index, 10);
            let list = BST.getMolList();
            mol3D = list[index];
            Model.loadMOL(mol3D.getMol3D());
            Sketcher.loadMOL(mol3D.getMol2D());
            });
        }
}
function openTreeMenu(){
    var x = document.getElementById("tree-menu-container");
    var y = document.getElementById("tree-options-menu");
    if (x.style.height === "600px"){
        x.style.height = "0px";
        y.style.display="none";
    }
    else{
        x.style.height = "600px";
        y.style.display="inline-block";
    }
}
navSlide();


document.getElementById("tree-selection-split").addEventListener("click", function(){selectMoleculeToSplit() });
document.getElementById("tree-selection-delete").addEventListener("click", function(){selectMoleculeToDelete() });
document.getElementById("tree-selection-clear").addEventListener("click", function(){clearTreeMenu() });
function clearTreeMenu(){
    BST.clearAll();
    updateGrid(BST);
}
function selectMoleculeToSplit(){
    let treePosition = document.getElementsByClassName("active")[0].id;
    treePosition = treePosition.replace("node", "");
    treePosition = parseInt(treePosition, 10);
    let molList = BST.getMolList();
    let moleculeToSplit = molList[treePosition];
    BST.insert(moleculeToSplit, testMol3D_n1, testMol3D_n2, testMol2D_n1, testMol2D_n2, treePosition);
}
function selectMoleculeToDelete(){
    let treePosition = document.getElementsByClassName("active")[0].id;
    treePosition = treePosition.replace("node", "");
    treePosition = parseInt(treePosition, 10);
    let molList = BST.getMolList();
    let moleculeToDelete = molList[treePosition];
    BST.deleteNode(moleculeToDelete);
    updateGrid(BST);
}


function updateGrid(Tree){
    let height = Tree.getHeight(Tree.root);
    let active = document.getElementsByClassName("active")[0].id;
    active = active.replace("node", "");
    active = parseInt(active, 10);
    let rowNum = height;
    let originalRow = document.getElementById("tree-row-1");
    let originalColumn = document.getElementById("original-column");
    let originalNode = document.getElementById("node0");
    originalColumn.innerHTML="";
    originalRow.innerHTML = "";
    let rows = document.querySelectorAll(".tree-rows");
    if (rows){
        let parent = document.getElementById("tree-menu");
        for (let i = 0; i < rows.length; i++){
            let child = rows[i];
            parent.removeChild(child);
        }
    }
    let parent = document.getElementById("tree-menu");
    for (let i = 0; i < height; i++){      
        let clone = originalRow.cloneNode(true);
        parent.appendChild(clone);
    }
    let newRows = document.querySelectorAll(".tree-rows");
    for (let i = 0; i < newRows.length; i++){
        newRows[i].id = "tree-row-" + (i+1);
    }
    let count = 0;
    for (let i = 1; i < (height + 1); i++){
        let list = BST.getMolList();
        let parent = document.getElementById("tree-row-" + (i));
        if (i == 1){
            let child = originalColumn;
            let node = originalNode;
            child.appendChild(node);
            parent.appendChild(child);
            count ++;
        }
        else{
            let x = (Math.pow(2, ( i - 1)));
            let y = 0;
            while (y < x){
                let child = originalColumn.cloneNode(true);
                child.innerHTML="";
                child.id=null;
                let node = originalNode.cloneNode(true);
                node.id = "node " + (count);
                node.className = node.className.replace(" active", "");
                node.innerHTML="Node " +(count);
                child.appendChild(node);
                parent.appendChild(child);
                parent.style.display = "grid";
                parent.style.gridTemplateColumns = "repeat(" + x + ", auto)";
                if (list[count] === null){
                    node.style.pointerEvents="none";
                    node.style.backgroundColor="rgb(99, 51, 148, 0.8)";
                    node.style.color = "rgb(99, 51, 148, 0.8)";
                }
                if (count == active){
                    node.className += " active";
                }
                count++;
                y++;
            }
        }
    }


    document.documentElement.style.setProperty("--rowNum", rowNum);
    updateActive();
}

