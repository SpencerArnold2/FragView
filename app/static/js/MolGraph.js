class Graph {
    constructor(numOfVertices, parentId, nodeId){
        this.numOfVertices = numOfVertices; // stores number of vertices
        this.adjMatrix = new Array(numOfVertices).fill(0).map(() => new Array(numOfVertices).fill(0)); //creates empty adjMatrix
        this.vertexList = new Array(numOfVertices); // stores all vertices
        this.parentId = parentId;
        this.nodeId = nodeId;
        this.coloredHydrogens = [];
    }

    addVertex (v, id){
        this.vertexList[id] = v; // adds the vertex to the list
    }

    addEdge (v1ID, v2ID){
        this.adjMatrix[v1ID][v2ID] = 1; // indicates the connection in both places on the adjmatrix
        this.adjMatrix[v2ID][v1ID] = 1;
    }

    checkConnection(v1ID, v2ID){
        return this.adjMatrix[v1ID][v2ID] == 1; // Checks if two vertices are connected
    }

    checkNumOfConnections(vID){
        var connectionCounter = 0;
        for(i=0;i<this.numOfVertices;i++){
            if(this.adjMatrix[vID][i]==1){
                connectionCounter++;
            }
        }
        return connectionCounter;
    }
    getListOfElementsConnected(vID){
        var a = this.adjMatrix[vID];
        var connectedElements = [];
        var l = 0;
        for(l = 0; l < a.length; l++){
            if(a[l]==1){
                connectedElements.push(this.vertexList[l][0])
            }
        }
        return connectedElements.sort();
    }
    getVertexElement(vID){
        return this.vertexList[vID][0];
    }
    checkNextLayer(vID){
        var connections = [];
        for(var i=0; i<this.adjMatrix[vID].length;i++){
            if(this.adjMatrix[vID][i]==1){
                connections.push(i);
            }
        }
        var elementList = [];
        for(var i=0; i < connections.length; i++){
            elementList.push([connections[i], this.getListOfElementsConnected(connections[i])]);
        }
        return elementList.sort();
    }
    getAdjList(vID){
        var adjList = [];
        for(var i=0;i<this.adjMatrix[vID].length;i++){
            if(this.adjMatrix[vID][i]==1){
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

    storeMol: function (mol, state, parentId, nodeId){
        var tmpMol = this.organizeMol(mol, parentId, nodeId);
        if(state=="broken" && tmpMol.numOfVertices > 0 && !this.includesGraph(nodeId, "broken")){
            this.molBrokenList.push(tmpMol);
        }else if(state == "2d" && tmpMol.numOfVertices > 0 && !this.includesGraph(nodeId, "2d")){
            this.mol2dList.push(tmpMol);
        }else if(state == "3d" && tmpMol.numOfVertices > 0 && !this.includesGraph(nodeId, "3d")){
            this.mol3dList.push(tmpMol);
        }
    },

    includesGraph: function (nodeId, state){
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

    organizeMol: function (mol, parentId, nodeId){
        var lines = mol.split("\n");
        var splitMol = [];
        for (i = 0; i < lines.length; i++){ // After loop, splitMol = array with all lines with all emptiness filtered
            splitMol.push(lines[i].split(" "))
            splitMol[i] = splitMol[i].filter(item => item);
        }
        var numOfVertices = parseInt(splitMol[3][0]);
        var numOfEdges = parseInt(splitMol[3][1]);

        var MolGraph = new Graph(numOfVertices, parentId, nodeId);
        for(i=0; i<numOfVertices;i++){
            var v = splitMol[i+4][3];
            v = v + i;
            MolGraph.addVertex(v, i); // Vertex = "<element><id>"
        }
        for (i=0; i<numOfEdges; i++){
            MolGraph.addEdge((splitMol[i+numOfVertices+4][0] - 1) , ((splitMol[i+numOfVertices+4][1] - 1)));
        }
        return MolGraph;
    },

    getListOfChildNodes: function (parentId){ //returns list of graphs that share the same parentId
        var childList = [];
        for(var i=0; i<this.mol2dList.length; i++){
            if(this.mol2dList[i].parentId==parentId && this.mol2dList[i].nodeId != parentId){
                childList.push(this.mol2dList[i]);
            }
        }
        return childList;
    },

    alignChildNodes: function(parentId){
        var childList = this.getListOfChildNodes(parentId);
        var G_broken = this.findGraph(parentId, "broken");
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
                    else{ // if(j==0)
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
        return alignmentList;
    },

    alignSubgraph: function (G_broken, G_child){

        
        function compareVertices(brokenVID, childVID){ //compares the two vertices' connections at one level
            var brokenConnections = G_broken.getListOfElementsConnected(brokenVID);
            var childConnections = G_child.getListOfElementsConnected(childVID);
            var brokenVElement = G_broken.getVertexElement(brokenVID);
            var childVElement = G_child.getVertexElement(childVID); 
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
                if(!visited.includes(adjList[i])){
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
                    if(newAdjMatrix[i][j]==1){
                        if(brokenAdjMatrix[i][j]==0){
                            affectedAtoms.push(j);
                        }
                    }
                }
            }
        }
        return affectedAtoms.sort();
    },

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

    translateH: function(G_new, G_child, G_childH, alignment){
        var parentHList = G_new.coloredHydrogens;
        var childHList = [];

        for(var i=0; i<parentHList.length; i++){
            for(var j=0; j<parentHList[i][1].length; j++){
                var tmpH = parentHList[i][1][j];
                tmpH = tmpH.replace( /^\D+/g, '');
                tmpH = parseInt(tmpH) - 1;
                tmpH = "H" + tmpH;
                parentHList[i][1][j] = tmpH;
            }
        }
        
        for(var i=0; i<alignment.length; i++){
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
        for(var i = 0; i < childHList.length; i++){
            var cAdjList = G_childH.getAdjList(childHList[i][0]);
            var childHListTMP = [];
            for(var j = 0; j<cAdjList.length; j++){
                if(G_childH.getVertexElement(cAdjList[j]) == "H"){
                    var tmpH = "H" + (cAdjList[j]);
                    tmpH = tmpH.replace( /^\D+/g, '');
                    tmpH = parseInt(tmpH) + 1;
                    tmpH = "H" + tmpH;
                    childHListTMP.push(tmpH);
                }
            }
            // if(childHListTMP.length > childHList[i][1]){
            //     while(childHListTMP.length > childHList[i][1]){
            //         childHListTMP.splice(0, 1);
            //     }
            // }
            childHList[i][1]=childHListTMP;
        }
        if(!JSON.stringify(G_child.coloredHydrogens).includes(JSON.stringify(childHList))){
            G_child.coloredHydrogens = childHList;
        }
        
    },

    //G_new, G_newH, G_broken, G_child, G_childH
    colorHydrogens: function(nodeId){
        var G_child = this.findGraph(nodeId, "2d");
        var G_childH = this.findGraph(nodeId, "3d");
        var parentId = G_child.parentId;
        var G_new = this.findGraph(parentId, "2d");
        var G_newH = this.findGraph(parentId, "3d");
        var G_broken = this.findGraph(parentId, "broken");


        var affectedAtoms = this.findBrokenBonds(G_new, G_broken);
        var alignment = this.alignSubgraph(G_broken, G_child);
        var alignmentList = this.alignChildNodes(G_broken.nodeId);
        for(var i=0; i<alignmentList.length; i++){
            if(alignmentList[i][0]==nodeId){
                alignment = alignmentList[i][1];
            }
        }
        // console.log(alignment);
        var atomsWithH = [];    //represents atoms that had their bond broken and has Hydrogen atoms needed to color.
        var brokenAtomsWithH = []; 
        for(var i = 0; i<alignment.length; i++){
            if(affectedAtoms.includes(alignment[i][1][0])){
                atomsWithH.push(i);
                brokenAtomsWithH.push(alignment[i][1][0]);
            }
        }
        // return atomsWithH;

        this.translateH(G_new, G_child, G_childH, alignment);
        
        for(var i=0;i<atomsWithH.length;i++){
            var HtoAdd = [atomsWithH[i], []];
            var atomWithH = atomsWithH[i];
            var brokenAtomWithH = brokenAtomsWithH[i];
            var HtoColor = this.checkHydrogenLevels(G_newH, G_childH, brokenAtomWithH, atomWithH);
            for(var j=0;j<HtoColor.length;j++){
                HtoAdd[1].push(HtoColor[j]);
            }
            if(!JSON.stringify(G_child.coloredHydrogens).includes(JSON.stringify(HtoAdd))){
                G_child.coloredHydrogens.push(HtoAdd);
            }
            // Jmol.script(JSmol, "SELECT " + HtoColor + "; color orange");
        }

        for(var i=0; i<G_child.coloredHydrogens.length; i++){
            if(G_child.coloredHydrogens[i][1].length > 0){
                Jmol.script(JSmol, "SELECT " + G_child.coloredHydrogens[i][1] + "; color orange");
            }
        }
    },

    checkHydrogenLevels: function(G_newH, G_childH, brokenVID, childVID){
        var originalElements = G_newH.getListOfElementsConnected(brokenVID);
        var newHCounter = 0;
        var childHCounter = 0;
        var childElements = G_childH.getListOfElementsConnected(childVID);
        for(var i = 0; i<originalElements.length; i++){
            if(originalElements[i] == "H"){
                newHCounter++;
            }
        }
        for(var i = 0; i<childElements.length; i++){
            if(childElements[i] == "H"){
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
    }


    


}
