class Graph {
    constructor(numOfVertices){
        this.numOfVertices = numOfVertices; // stores number of vertices
        this.adjMatrix = new Array(numOfVertices).fill(0).map(() => new Array(numOfVertices).fill(0)); //creates empty adjMatrix
        this.vertexList = new Array(numOfVertices); // stores all vertices
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

}

var MolGraph = {
    newMol : "",
    brokenMol : "",
    childMol : "",

    storeMol: function (mol, state){
        if (state == "new"){
            this.newMol = this.organizeMol(mol);
        }
        else if (state == "broken"){
            this.brokenMol = this.organizeMol(mol);
        }
        else if (state == "child"){
            this.childMol = this.organizeMol(mol);
        }
    },

    organizeMol: function (mol){
        var lines = mol.split("\n");
        var splitMol = [];
        for (i = 0; i < lines.length; i++){ // After loop, splitMol = array with all lines with all emptiness filtered
            splitMol.push(lines[i].split(" "))
            splitMol[i] = splitMol[i].filter(item => item);
        }
        var numOfVertices = parseInt(splitMol[3][0]);
        var numOfEdges = parseInt(splitMol[3][1]);

        var MolGraph = new Graph(numOfVertices);
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

    alignSubgraph: function (G_broken, G_subgraph){

        
        function compareVertices(brokenVID, childVID){ //compares the two vertices' connections at one level
            var brokenConnections = G_broken.getListOfElementsConnected(brokenVID);
            var childConnections = G_subgraph.getListOfElementsConnected(childVID);
            var brokenVElement = G_broken.getVertexElement(brokenVID);
            var childVElement = G_subgraph.getVertexElement(childVID); 
            if(JSON.stringify(brokenConnections) == JSON.stringify(childConnections) && brokenVElement==childVElement){
                return true;
            }
            else{
                return false;
            }
        }

        // Create list of all possible matching vertices
        var possibleMatches = new Array(G_subgraph.numOfVertices);
        for(i=0;i<possibleMatches.length;i++){
            possibleMatches[i] = [i, []]; // i is first element and second element is empty array on each row
        }
        for(i=0;i<G_subgraph.numOfVertices;i++){
            var brokenV = G_broken.numOfVertices;
            for(j=0; j<brokenV; j++){
                if(compareVertices(j, i)){
                    possibleMatches[i][1].push(j);
                }
            }
        }
        // possibleMatches == [allVerticesInChild][possibleVerticesInBroken]

        


        
        // var finished = true;
        // checkIfFinished();
        // function checkIfFinished(){
        //     for(i = 0; i< possibleMatches.length; i++){
        //         if(possibleMatches[i][1].length!=1){
        //             finished = false;
        //         }
        //     }
        // }

        function compareLayer(brokenVID, childVID){
            var brokenLayer = G_broken.checkNextLayer(brokenVID);
            var childLayer = G_subgraph.checkNextLayer(childVID);
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
        

        // // var checkListChild = new Array(G_subgraph.numOfVertices).fill(0);
        // // var checkListParent = new Array(G_broken.numOfVertices).fill(0);
        for(var i=0; i<possibleMatches.length; i++){
            var confirmed = [];
            for(var j=0; j<possibleMatches[i][1].length; j++){
                if(compareLayer(possibleMatches[i][1][j], i)){
                    confirmed.push(possibleMatches[i][1][j]);
                }
            }
            possibleMatches[i][1]=confirmed;


            // possible solution
            if(confirmed.length>1){
                var nextChildLayer = G_subgraph.checkNextLayer(i)[0][0];
                var nextBrokenLayer = G_broken.checkNextLayer(confirmed[0])[0][0];
                var previousCLayers = [i];
                var currentConfirmedID = 0;
                var currentBLayer = G_broken.checkNextLayer(confirmed[0]);
                var currentCLayer = G_subgraph.checkNextLayer(i);  
                for(var l=0; l<confirmed.length; l++){
                    previousCLayers = [i];
                    for(var j=0;j<G_broken.numOfVertices;j++){
                        if(compareLayer(nextBrokenLayer, nextChildLayer)){
                            currentBLayer = G_broken.checkNextLayer(nextBrokenLayer);
                            currentCLayer = G_subgraph.checkNextLayer(nextChildLayer);
                            var cID = currentCLayer.length-1;
                            for(var k=0;k<currentBLayer.length;k++){
                                if(previousCLayers.includes(currentCLayer[cID][0]) && cID!=0){
                                    cID= cID-1;
                                }
                                if((JSON.stringify(currentBLayer[k][1])==JSON.stringify(currentCLayer[cID][1]))){ // makes page unresponsive???
                                    previousCLayers.push(nextChildLayer);
                                    nextChildLayer = currentCLayer[cID][0];
                                    nextBrokenLayer = currentBLayer[k][0];
                                    console.log(currentCLayer);
                                    console.log(currentBLayer);
                                    console.log(previousCLayers);
                                    console.log(nextChildLayer);
                                    console.log(nextBrokenLayer);
                                }
                            }
                        }
                        else{
                            confirmed.splice(currentConfirmedID, 1);
                        }
                    }
                    currentConfirmedID++;
                }
            }
            
            possibleMatches[i][1]=confirmed;
            confirmed=[];



            // if(confirmed.length>1){
            //     var bLayer;
            //     var cLayer = G_subgraph.checkNextLayer(i);
            //     while(confirmed.length>1){
            //         for(var j=0; j<confirmed.length; j++){
            //             bLayer= G_broken.checkNextLayer(confirmed[j]);
            //             for(var k = 0; k < bLayer.length; k++){
            //                 if(JSON.stringify(bLayer[k][1])==JSON.stringify(cLayer[0][1])){
            //                     if(compareLayer(bLayer[k][0], cLayer[0][0])){
            //                         bLayer = G_broken.checkNextLayer(bLayer[k][0]);
            //                         cLayer = G_subgraph.checkNextLayer(cLayer[0][0]);
            //                     }
            //                     else{
            //                         confirmed.splice(j,1);
            //                         console.log(confirmed);
            //                         console.log(bLayer);
            //                         console.log(cLayer);
            //                     }
            //                 }
            //             }


            //         }
            //     }
                    // for(var j=0; j<confirmed.length; j++){ // for each element in confirmed
                    //     for(var k = 0; k<G_broken.checkNextLayer(confirmed[j]).length;k++){     // for each element to look for
                    //         if(JSON.stringify(connectionToLookFor)==JSON.stringify(G_broken.checkNextLayer(confirmed[j])[0][1])){
                    //             currentBVID = 
                    //             if(compareLayer())
                    //         }
                            
                    //     }
                    // }  
                    




                
            
        }


        
        // var unconfirmed = possibleMatches;
        // var currentChildVID = 0;
        // var currentBrokenVID = possibleMatches[0][1][0];
        // // return possibleMatches;
        // while(!finished){
        //     // console.log(currentBrokenVID + "  " + currentChildVID);
        //     if (possibleMatches[currentChildVID][1].length>1){
        //         for(i=0;i<possibleMatches[currentChildVID][1].length;i++){
        //             currentBrokenVID = possibleMatches[currentChildVID][1][i];
        //             if(compareVertices(currentBrokenVID, currentChildVID)){
        //                 unconfirmed[currentChildVID][1].splice(i, 1);
        //             }else{
        //                 possibleMatches[currentChildVID][1].splice(i, 1);
        //             }
        //             console.log(unconfirmed);
        //             console.log(possibleMatches[currentChildVID]);
        //         }
        //     }
        //     checkIfFinished();
        //     if(currentChildVID<possibleMatches.length-1){
        //         currentChildVID++;
        //     }
        //     else{
        //         finished=true;
        //     }
            
        // }
        
        return possibleMatches;
    }

    


}
