class Graph {
    
    /**
     * Represents a graph.
     * @constructor
     * @param {Number} numOfVertices 
     * @param {Number} parentId 
     * @param {Number} nodeId 
     * @param {Number} brokenId 
     */
    constructor(numOfVertices, parentId, nodeId, brokenId){
        this.numOfVertices = numOfVertices; // stores number of vertices
        this.adjMatrix = new Array(numOfVertices).fill(0).map(() => new Array(numOfVertices).fill(0)); //creates empty adjMatrix
        this.vertexList = new Array(numOfVertices); // stores all vertices
        this.parentId = parentId; // stores the id of the parent element
        this.nodeId = nodeId; // stores the id of the node element
        this.coloredHydrogens = []; // stores the hydrogens that are colored
        this.vertexListWithHydrogens = []; // stores the vertices with hydrogen connections
        this.brokenId = brokenId; // represents which broken graph is parent.
    }

    addVertex (v, id){
        this.vertexList[id] = v; // adds the vertex to the list
    }

    addEdge (v1ID, v2ID, bondNum){
        this.adjMatrix[v1ID][v2ID] = parseInt(bondNum,10); // indicates the connection in both places on the adjmatrix
        this.adjMatrix[v2ID][v1ID] = parseInt(bondNum,10); 
    }

    checkConnection(v1ID, v2ID){
        return this.adjMatrix[v1ID][v2ID] != 0; // Checks if two vertices are connected
    }

    checkNumOfConnections(vID){ // returns number of vertices connected to a vertex
        var connectionCounter = 0;
        for(i=0;i<this.numOfVertices;i++){
            if(this.adjMatrix[vID][i]!=0){
                connectionCounter++;
            }
        }
        return connectionCounter;
    }
    getListOfElementsConnected(vID){ // returns a list of elements connected to a vertex
        var a = this.adjMatrix[vID];
        var connectedElements = [];
        for(var l = 0; l < a.length; l++){
            if(a[l]!=0){
                connectedElements.push(this.vertexList[l][0] + a[l]);
            }
        }
        return connectedElements.sort();
    }
    getListOfElementsConnectedIgnoringH(vID){ // Returns a list of elements and how many bonds for each connection. [C1,N2,N1]
        var a = this.adjMatrix[vID];
        var connectedElements = [];
        for(var i = 0; i < a.length; i++){ // loops through the adjacency matrix
            if(this.getVertexElement(i)!="H"){
                if(a[i]!=0){
                    connectedElements.push(this.vertexList[i][0] + a[i]);
                }
            }
        }
        return connectedElements.sort();
    }
    getH(vID){ // returns how many Hydrogens are connected to a vertex
        var h = 0;
        var a = this.adjMatrix[vID];
        for(var i = 0; i < a.length; i++){ // loops through the adjacency matrix
            if(a[i]!=0){
                if(this.getVertexElement(i)=="H"){
                    h++;
                }
               
            }
        }
        return h;
    }
    getVertexElement(vID){
        return this.vertexList[vID][0];
    }
    checkNextLayer(vID){ // returns the connections of the vertices connected to the indicated vertex
        var connections = [];
        for(var i=0; i<this.adjMatrix[vID].length;i++){ // loops through the adjacency matrix of a vertex
            if(this.adjMatrix[vID][i]!=0 && this.getVertexElement(i) != "H"){ // checks if the vertex is connected and if it is not a hydrogen
                connections.push(i);
            }
        }
        var elementList = [];
        for(var i=0; i < connections.length; i++){
            elementList.push([connections[i], this.getListOfElementsConnectedIgnoringH(connections[i])]);
        }
        // console.log(elementList);
        return elementList.sort();
    }
    getAdjList(vID){ // returns the adjacency list
        var adjList = [];
        for(var i=0;i<this.adjMatrix[vID].length;i++){
            if(this.adjMatrix[vID][i]!=0){
                adjList.push(i);
            }
        }
        return adjList;
    }

}

var MolGraph = {
    molBrokenList: [],
    mol2dList: [],
    mol3dList: [],

    storeMol: function (mol, state, parentId, nodeId){ // stores the graph into the correct array for the given state 
        var tmpMol = this.organizeMol(mol, parentId, nodeId);
        if(state=="broken" && tmpMol.numOfVertices > 0){
            this.molBrokenList.push(tmpMol);
        }else if(state == "2d" && tmpMol.numOfVertices > 0 && !this.includesGraph(nodeId, "2d")){
            this.mol2dList.push(tmpMol);
        }else if(state == "3d" && tmpMol.numOfVertices > 0 && !this.includesGraph(nodeId, "3d")){
            this.mol3dList.push(tmpMol);
        }
    },

    includesGraph: function (nodeId, state){ // checks if the state array contains a graph with the given nodeId
        if(state=="broken"){
            for(var i = 0; i<this.molBrokenList.length; i++){
                if(this.molBrokenList[i].nodeId==nodeId){
                    return true;
                }
            }
            return false;
        }else if(state=="2d"){
            for(var i = 0; i<this.mol2dList.length; i++){
                if(this.mol2dList[i].nodeId==nodeId){
                    return true;
                }
            }
            return false;
        }else if(state=="3d"){
            for(var i = 0; i<this.mol3dList.length; i++){
                if(this.mol3dList[i].nodeId==nodeId){
                    return true;
                }
            }
            return false;
        }
    },

    organizeMol: function (mol, parentId, nodeId){ // converts mol to graph
        var lines = mol.split("\n");
        var splitMol = [];
        for (i = 0; i < lines.length; i++){ // After loop, splitMol = array with all lines with all emptiness filtered
            splitMol.push(lines[i].split(" "))
            splitMol[i] = splitMol[i].filter(item => item);
        }
        var numOfVertices = parseInt(splitMol[3][0]);
        var numOfEdges = parseInt(splitMol[3][1]);

        var MolGraph = new Graph(numOfVertices, parentId, nodeId, this.molBrokenList.length);
        for(i=0; i<numOfVertices;i++){
            var v = splitMol[i+4][3];
            v = v + i;
            MolGraph.addVertex(v, i); // Vertex = "<element><id>"
        }
        for (i=0; i<numOfEdges; i++){
            MolGraph.addEdge((splitMol[i+numOfVertices+4][0] - 1) , ((splitMol[i+numOfVertices+4][1] - 1)), splitMol[i+numOfVertices+4][2]);
        }
        return MolGraph;
    },

    getListOfChildNodes: function (parentId, brokenId){ //returns list of graphs that share the same parentId
        var childList = [];
        for(var i=0; i<this.mol2dList.length; i++){
            if(this.mol2dList[i].parentId==parentId && this.mol2dList[i].brokenId==brokenId && this.mol2dList[i].nodeId != parentId){
                childList.push(this.mol2dList[i]);
            }
        }
        return childList;
    },

    alignChildNodes: function(parentId, brokenId){ // expands the alignment to include neighboring child nodes
        var childList = this.getListOfChildNodes(parentId, brokenId);
        var G_broken = this.molBrokenList[brokenId-1];
        childList.sort((a, b) => parseFloat(b.numOfVertices) - parseFloat(a.numOfVertices));
        var alignmentList = [];
        var brokenAtomsUsed = [];
        for(var i=0; i<childList.length; i++){
            alignmentList.push([childList[i].nodeId, this.alignSubgraph(G_broken, childList[i])]);
            
        }
        for(var i=0; i<alignmentList.length; i++){
            for(var j=0; j<alignmentList[i][1].length; j++){
                for(var k=0; k<alignmentList[i][1][j][1].length; k++){
                    if(brokenAtomsUsed.includes(alignmentList[i][1][j][1][k])){
                        alignmentList[i][1][j][1].splice(k, 1);
                    }
                    else{ //if(j==0)
                        brokenAtomsUsed.push(alignmentList[i][1][j][1][k]);
                        alignmentList[i][1][j][1] = [alignmentList[i][1][j][1][k]];
                    }
                    // else if(G_broken.checkConnection(alignmentList[i][1][0][1][k], alignmentList[i][1][j][1][k])){
                    //     brokenAtomsUsed.push(alignmentList[i][1][j][1][k]);
                    //     alignmentList[i][1][j][1] = [alignmentList[i][1][j][1][k]];
                    // }
                }
            }
        }
        // console.log(alignmentList);
        return alignmentList;
    },

    narrowAlignment: function(alignmentList){ // removes atoms that are duplicates in the alignment
        var duplicateAlignments = [];
        for(var i=0; i<alignmentList.length; i++){
            for(var j=0; j<alignmentList[i][1].length; j++){
                if(alignmentList[i][1][j][1].length>1){
                    duplicateAlignments.push([alignmentList[i][0], alignmentList[i][1][j][1], alignmentList[i][1][j][0]]);
                }
            }
        }
        if(duplicateAlignments.length>0){
            var nodeToCompare = duplicateAlignments[0][0];
            var alignmentWithLocation = [];
            var availableAtoms = [];
            for(var i=0; i<duplicateAlignments.length; i++){
                if(duplicateAlignments[i][0]==nodeToCompare){
                    alignmentWithLocation.push([duplicateAlignments[i][2],duplicateAlignments[i][1]]);
                    // check if availableAtoms contains duplicate
                    for(var j=0; j<duplicateAlignments[i][1].length; j++){
                        if(!availableAtoms.includes(duplicateAlignments[i][1][j])){
                            availableAtoms.push(duplicateAlignments[i][1][j]);
                        }
                    }
                }
            }
            // console.log(alignmentWithLocation);
            var usedAtoms = [];
            alignmentWithLocation[0][1].length = 1;
            usedAtoms.push(alignmentWithLocation[0][1][0]);
            for(var i=1; i<alignmentWithLocation.length; i++){
                // console.log(usedAtoms);
                for(var j=0; j<alignmentWithLocation[i][1].length; j++){
                    if(usedAtoms.includes(alignmentWithLocation[i][1][j])){
                        alignmentWithLocation[i][1].splice(j, 1);
                        j--;
                    }
                }
                if(alignmentWithLocation[i][1].length>1){
                    alignmentWithLocation[i][1].length = 1;
                    usedAtoms.push(alignmentWithLocation[i][1][0]);
                }
                else if(alignmentWithLocation[i][1].length==1){
                    usedAtoms.push(alignmentWithLocation[i][1][0]);
                }
            }
        }
        // console.log(alignmentWithLocation);
    },

    alignSubgraph: function (G_broken, G_child){
        //when used between 2d and 3d graphs, G_broken indicates 3d and G_child indicates 2d
        
        function compareVertices(brokenVID, childVID){ //compares the two vertices' connections at one level
            var brokenConnections = G_broken.getListOfElementsConnectedIgnoringH(brokenVID);
            var childConnections = G_child.getListOfElementsConnectedIgnoringH(childVID);
            // for(var i = 0; i<brokenConnections.length; i++){ // ignores Hydrogen atoms within the list of elements connected
            //     if(brokenConnections[i][0]=="H"){
            //         brokenConnections.splice(i, 1);
            //     }
            // }
            var brokenVElement = G_broken.getVertexElement(brokenVID);
            var childVElement = G_child.getVertexElement(childVID);
            // console.log(childConnections);
            // console.log(brokenConnections);
            // console.log(JSON.stringify(childConnections) == JSON.stringify(brokenConnections));
            if(JSON.stringify(brokenConnections) == JSON.stringify(childConnections) && brokenVElement==childVElement){
                return true;
            }
            else{
                return false;
            }
        }

        // Create list of all possible matching vertices
        var possibleMatches = new Array(G_child.numOfVertices);
        for(i=0;i<possibleMatches.length;i++){
            possibleMatches[i] = [i, []]; // i is first element and second element is empty array on each row
        }
        for(i=0;i<G_child.numOfVertices;i++){
            var brokenV = G_broken.numOfVertices;
            for(j=0; j<brokenV; j++){
                if(compareVertices(j, i)){
                    possibleMatches[i][1].push(j);
                    // console.log(possibleMatches);
                }
            }
        }
        function compareLayer(brokenVID, childVID){
            var brokenLayer = G_broken.checkNextLayer(brokenVID);
            var childLayer = G_child.checkNextLayer(childVID);
            var brokenConnection = [];
            for(var i=0; i<brokenLayer.length;i++){
                brokenConnection.push(brokenLayer[i][1]);
            }
            var childConnections = [];
            for(var i=0; i<childLayer.length;i++){
                childConnections.push(childLayer[i][1]);
            }
            brokenConnection.sort();
            childConnections.sort();
            return JSON.stringify(childConnections) == JSON.stringify(brokenConnection);
        }
        
        function findNextVertex(vID, visited, graph){
            var adjList = graph.getAdjList(vID);
            var nextVertex = vID;
            for(var i = 0; i< adjList.length; i++){
                if(!visited.includes(adjList[i]) && graph.getVertexElement(adjList[i]) != "H"){
                    nextVertex = adjList[i];
                }
            }
            return nextVertex;
        }
        for(var i=0; i<possibleMatches.length; i++){
            var confirmed = [];
            for(var j=0; j<possibleMatches[i][1].length; j++){
                if(compareLayer(possibleMatches[i][1][j], i)){
                    confirmed.push(possibleMatches[i][1][j]);
                }
            }
            possibleMatches[i][1]=confirmed;


            if(confirmed.length>1){
                var cVertex = i;
                var bVertex = confirmed[0];
                var vistitedC = [];
                var vistitedB = [];
                let lastVertex, lastAdjList;
                for(var j = 0; j<confirmed.length;j++){
                    vistitedC = [];
                    vistitedB = [];
                    bVertex = confirmed[j];
                    cVertex = i;

                    while(vistitedC.length < G_child.numOfVertices){
                        if (compareLayer(bVertex, cVertex)){
                            vistitedC.push(cVertex);
                            vistitedB.push(bVertex);
                            cVertex = findNextVertex(cVertex, vistitedC, G_child);
                            bVertex = findNextVertex(bVertex, vistitedB, G_broken);
                        }
                        else{
                            vistitedB.push(bVertex);
                            lastVertex = vistitedB[vistitedB.length-2];
                            lastAdjList = G_broken.getAdjList(lastVertex);
                            var found = false;
                            for(var k=0; k<lastAdjList.length; k++){
                                if(!vistitedB.includes(lastAdjList[k]) && !found){
                                    if(compareLayer(lastAdjList[k], cVertex)){
                                        vistitedB.splice(vistitedB.length-1, 1);
                                        vistitedB.push(lastAdjList[k]);
                                        bVertex = findNextVertex(lastAdjList[k], vistitedB, G_broken);
                                        vistitedC.push(cVertex);
                                        cVertex = findNextVertex(cVertex, vistitedC, G_child);
                                        found=true;
                                    }
                                }
                            }
                            if(!found){
                                confirmed.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
            possibleMatches[i][1]=confirmed;
            confirmed=[];
        }

        // console.log(possibleMatches);
        return possibleMatches;
    },

    align3d: function (G_child, G_childH){ // child = 2d, childH = 3d // Role of function is to ensure that 2d references are the same as 3d graph
        // console.log(G_child);
        // console.log(G_childH);

        var aVertexList = G_child.vertexList; //2d
        var bVertexList = G_childH.vertexList; //3d
        var isAligned = true;
        
        for(var i =0; i < aVertexList.length; i++){ //ensures that 2d and 3d are not already aligned.
            if(aVertexList[i] != bVertexList[i]){
                isAligned = false;
                break;
            }
            var aConnection = JSON.stringify(G_child.getListOfElementsConnectedIgnoringH(i));
            var bConnection = JSON.stringify(G_childH.getListOfElementsConnectedIgnoringH(i));
            if(aConnection!=bConnection){
                isAligned = false;
                break;
            }
        }

        var alignment = new Array(G_child.numOfVertices);
        for(var i=0; i<alignment.length; i++){ //creates the alignment array
            alignment[i] = [i, []];
        }


        if(isAligned){
            for(var i=0; i<alignment.length; i++){
                alignment[i][1][0] = i;
            }
            return alignment;
        }

        // console.log(aVertexList);
        // console.log(bVertexList);
        // console.log(alignment);

        function compareLayer(aVID, bVID){
            var aLayer = G_child.checkNextLayer(aVID);
            var bLayer = G_childH.checkNextLayer(bVID);
            var aConnections = [];
            for(var i=0; i<aLayer.length;i++){
                aConnections.push(aLayer[i][1]);
            }
            var bConnections = [];
            for(var i=0; i<bLayer.length;i++){
                bConnections.push(bLayer[i][1]);
            }
            aConnections.sort();
            bConnections.sort();
            return JSON.stringify(bConnections) == JSON.stringify(aConnections);
        }

        for(var i=0; i<aVertexList.length; i++){
            for(var j=0; j< bVertexList.length; j++){
                if(G_child.getVertexElement(i)==G_childH.getVertexElement(j) && compareLayer(i, j)){
                    alignment[i][1].push(j);
                }
            }
        }

        for(var i=0; i<alignment.length; i++){
            if(alignment[i][1].length > 1){
                var aLayerID = G_child.checkNextLayer(i)[0][0];
                for(var j=0; j< alignment[i][1].length; j++){
                    var bLayerID = G_childH.checkNextLayer(alignment[i][1][j])[0][0];
                    if(!compareLayer(aLayerID, bLayerID)){
                        alignment[i][1].splice(j, 1);
                    }
                } 
            }
        }
        return alignment;



    },

    /**
     * Find which vertices have bond connections differing from the given graph.
     * @param {Graph} G_new 
     * @param {Graph} G_broken 
     * @returns {[]} Array of vertices with differing bond connections. 
     */
    findBrokenBonds: function (G_new, G_broken){
        var newAdjMatrix = G_new.adjMatrix;
        var brokenAdjMatrix = G_broken.adjMatrix;
        var affectedAtoms = [];

        if(newAdjMatrix.length!=brokenAdjMatrix.length){
            return null;
        }
        else{
            for(var i=0; i<newAdjMatrix.length; i++){
                for(var j=0; j<newAdjMatrix.length; j++){
                    if(newAdjMatrix[i][j]!=0){
                        if(brokenAdjMatrix[i][j]==0){
                            affectedAtoms.push(j);
                        }
                    }
                }
            }
        }
        return affectedAtoms.sort();
    },

    /**
     * Finds a graph in the given state array with the given nodeId
     * @param {Number} nodeId 
     * @param {String} state
     * @returns {Graph} Graph with the given nodeId in the given state.
     */
    findGraph: function(nodeId, state){
        if(state=="broken"){
            for(var i = 0; i<this.molBrokenList.length; i++){
                if(this.molBrokenList[i].nodeId == nodeId){
                    return this.molBrokenList[i];
                }
            }
        }else if(state=="2d"){
            for(var i = 0; i<this.mol2dList.length; i++){
                if(this.mol2dList[i].nodeId == nodeId){
                    return this.mol2dList[i];
                }
            }
        }else if(state=="3d"){
            for(var i = 0; i<this.mol3dList.length; i++){
                if(this.mol3dList[i].nodeId == nodeId){
                    return this.mol3dList[i];
                }
            }
        }
    },

    /**
     * Translates the Hydrogen reference from the parent node to the child
     * @param {Graph} G_new
     * @param {Graph} G_child
     * @param {Graph} G_childH
     * @param {Array} alignment
     * 
     */
    translateH: function(G_new, G_child, G_childH, alignment){
        // if(G_child.visited=true){
        //     return;
        // }else G_child.visited=true;
        var parentHList = G_new.coloredHydrogens;
        // console.log(parentHList);
        var childHList = [];

        for(var i=0; i<parentHList.length; i++){ // makes the hydrogen references index-0 based
            for(var j=0; j<parentHList[i][1].length; j++){
                var tmpH = parentHList[i][1][j];
                tmpH = tmpH.replace( /^\D+/g, '');
                tmpH = parseInt(tmpH) - 1;
                tmpH = "H" + tmpH;
                parentHList[i][1][j] = tmpH;
            }
        }
        
        for(var i=0; i<alignment.length; i++){ // creates a list of how many hydrogens are colored connected to each vertex
            for(var j=0; j<parentHList.length; j++){
                var HCounter = 0;
                if(alignment[i][1][0]==parentHList[j][0]){
                    for(var k=0;k<parentHList[j][1].length;k++){
                        HCounter++;
                    }
                    var HtoAdd = [alignment[i][0], HCounter];
                    if(!JSON.stringify(childHList).includes(JSON.stringify(HtoAdd))){
                        childHList.push(HtoAdd);
                    }
                }
            }
        }
        var a = 0;
        for(var i = 0; i < childHList.length; i++){
            var cAdjList = G_childH.getAdjList(childHList[i][0]);
            var childHListTMP = [];
            for(var j = 0; j<cAdjList.length; j++){
                if(G_childH.getVertexElement(cAdjList[j]) == "H"){ //gets a list of Hydrogens connected to each vertex
                    var tmpH = "H" + (cAdjList[j]);
                    tmpH = tmpH.replace( /^\D+/g, '');
                    tmpH = parseInt(tmpH) + 1;
                    tmpH = "H" + tmpH;
                    childHListTMP.push(tmpH);
                }
            }
            if(childHListTMP.length > childHList[i][1]){ // removes Hydrogens by how many Hydrogens do not need to be colored
                while(childHListTMP.length > childHList[i][1]){
                    childHListTMP.splice(childHListTMP.length-1, 1);
                }
            }
            childHList[i][1]=childHListTMP;
        }
        if(!JSON.stringify(G_child.coloredHydrogens).includes(JSON.stringify(childHList))){
            G_child.coloredHydrogens = childHList;
            // console.log(childHList);
        }
        
    },
    // compareHydrogens: function(G_childH){
    //     if(G_childH.parentId == G_childH.nodeId){ //fill in vertexListWithHydrogens if original graph
    //        for(var i = 0; i<G_childH.vertexList.length; i++){
    //             G_childH.vertexListWithHydrogens.push([G_childH.vertexList[i], G_childH.getH(i), 0]);
    //         }
    //     }
    //     else{
    //         var originalGraph = this.findOriginalGraph(G_childH.nodeId);
    //         for(var i = 0; i<G_child.vertexList.length; i++){
    //             G_childH.vertexListWithHydrogens.push([originalGraph.vertexList[i], originalGraph.getH(0), 0]);
    //         }
    //     }
    // },

    findOriginalGraph: function(nodeId){ //returns original graph (3d)
        var node = this.findGraph(nodeId, "3d");
        var parentId = node.parentId;
        while(parentId!=nodeId){
            node = this.findGraph(parentId, "3d");
            parentId = node.parentId;
            nodeId = node.nodeId;
        }
        return this.findGraph(nodeId, "3d");

    },

    //G_new, G_newH, G_broken, G_child, G_childH
    colorHydrogens: function(nodeId){ // main function called in Tree_Actions that pulls entire MolGraph together
        // Initialize the MolGraphs
        var G_child = this.findGraph(nodeId, "2d");
        var G_childH = this.findGraph(nodeId, "3d");
        var parentId = G_child.parentId;
        var G_new = this.findGraph(parentId, "2d");
        var G_newH = this.findGraph(parentId, "3d");
        var G_broken = this.molBrokenList[G_child.brokenId-1];


        var affectedAtoms = this.findBrokenBonds(G_new, G_broken); // finds the affected atoms
        var alignment = this.alignSubgraph(G_broken, G_child);
        // console.log(alignment);
        var alignmentList = this.alignChildNodes(G_broken.nodeId, G_child.brokenId);
        // console.log(alignmentList);
        var narrowedAlignmentList = this.narrowAlignment(alignmentList);
        // console.log(narrowedAlignmentList);
        var dimensionAlignment = this.align3d(G_child, G_childH);
        for(var i=0; i<alignmentList.length; i++){
            if(alignmentList[i][0]==nodeId){
                alignment = alignmentList[i][1];
            }
        }
        var atomsWithH = [];    //represents atoms that had their bond broken and has Hydrogen atoms needed to color.
        var brokenAtomsWithH = []; 
        // console.log(alignment);
        for(var i = 0; i<alignment.length; i++){
            if(affectedAtoms.includes(alignment[i][1][0])){
                atomsWithH.push(i);
                brokenAtomsWithH.push(alignment[i][1][0]);
            }
        }
        // return atomsWithH;

        this.translateH(G_new, G_child, G_childH, alignment);

        // console.log(atomsWithH);
        // console.log(brokenAtomsWithH);
        var newDAlignment = this.align3d(G_new, G_newH);
        for(var i=0;i<atomsWithH.length;i++){
            var HtoAdd = [atomsWithH[i], []];
            var atomWithH = atomsWithH[i];
            var brokenAtomWithH = brokenAtomsWithH[i];
            var HtoColor = this.checkHydrogenLevels(G_newH, G_childH, brokenAtomWithH, atomWithH, dimensionAlignment, newDAlignment);
            // console.log(HtoColor);
            for(var j=0;j<HtoColor.length;j++){
                HtoAdd[1].push(HtoColor[j]);
            }
            if(!JSON.stringify(G_child.coloredHydrogens).includes(JSON.stringify(HtoAdd))){
                G_child.coloredHydrogens.push(HtoAdd);
                G_child.visited = true;
            }
            // Jmol.script(JSmol, "SELECT " + HtoColor + "; color orange");
        }

        for(var i=0; i<G_child.coloredHydrogens.length; i++){
            if(G_child.coloredHydrogens[i][1].length > 0){
                Jmol.script(JSmol, "SELECT " + G_child.coloredHydrogens[i][1] + "; color orange");
            }
        }
    },

    checkHydrogenLevels: function(G_newH, G_childH, brokenVID, childVID, dimensionAlignment, newDAlignment){
        childVID = dimensionAlignment[childVID][1][0];
        // console.log(dimensionAlignment);
        // console.log(childVID);
        brokenVID = newDAlignment[brokenVID][1][0];
        var originalElements = G_newH.getListOfElementsConnected(brokenVID);
        var newHCounter = 0;
        var childHCounter = 0;
        var childElements = G_childH.getListOfElementsConnected(childVID);
        // console.log(originalElements);
        // console.log(childElements);
        for(var i = 0; i<originalElements.length; i++){
            if(originalElements[i][0] == "H"){
                newHCounter++;
            }
        }
        for(var i = 0; i<childElements.length; i++){
            if(childElements[i][0] == "H"){
                childHCounter++;
            }
        }
        var HtoColor = childHCounter - newHCounter; //stores how many hydrogens were added
        var HList = [];
        var cAdjList = G_childH.getAdjList(childVID);
        for(var i = 0; i<cAdjList.length; i++){
            if(G_childH.getVertexElement(cAdjList[i]) == "H"){
                var tmpH = "H" + (cAdjList[i]);
                tmpH = tmpH.replace( /^\D+/g, '');
                tmpH = parseInt(tmpH) + 1;
                tmpH = "H" + tmpH;
                HList.push(tmpH);
            }
        }
        HList.splice(0,HList.length - HtoColor);
        return HList;
    },

    clear: function(){ // clears all arrays of Graphs
        this.mol2dList = [];
        this.mol3dList = [];
        this.molBrokenList = [];
    }


    


}

