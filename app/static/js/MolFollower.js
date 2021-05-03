// var MolFollower = {
//     newMol : "",
//     brokenMol : "",
//     childMol : "",

//     storeMol: function (mol, state){
//         if (state == "new"){
//             this.newMol = this.organizeMol(mol);
//         }
//         else if (state == "broken"){
//             this.brokenMol = this.organizeMol(mol);
//         }
//         else if (state == "child"){
//             this.childMol = this.organizeMol(mol);
//         }
//     },
//     organizeMol: function (mol){
//         // var lines = mol.split("\n");
//         // var splitMol = [];
//         // for (i = 0; i < lines.length; i++){
//         //     splitMol.push(lines[i].split(" "))
//         //     splitMol[i] = splitMol[i].filter(item => item);
//         // }
//         // var atoms = parseInt(splitMol[3][0]);
//         // var bonds = parseInt(splitMol[3][1]);

//         // var molPlus = new Array(atoms);
//         // for (i = 0; i < atoms; i++){            // Now has ["{Atomic symbol}", []] for each element
//         //     molPlus[i] = [splitMol[i+4][3], []];
//         // }

//         // for (i=0; i < atoms; i++){
//         //     for (j=0; j < bonds; j++){
//         //         if (parseInt(splitMol[j+atoms+4][0])== i+1){
//         //             var a = molPlus[parseInt(splitMol[j+atoms+4][1])-1][0];
//         //             var b = parseInt(splitMol[j+atoms+4][1]);
//         //             molPlus[i][1].push(a.concat(b));
//         //         }   
//         //     }
//         // }

//         // for (i=0; i<molPlus.length; i++){
//         //     for (j=0; j<molPlus[i][1].length; j++){
//         //         var newBond = molPlus[i][1][j];
//         //         newBond = newBond.replace(/[^0-9\.]+/g,"");
//         //         a = parseInt(newBond,10)-1;
//         //         molPlus[a][1].push(molPlus[i][0].concat((i+1).toString()));
//         //         molPlus[a][1].sort((a,b) => a.replace(/[^0-9\.]+/g,"")-b.replace(/[^0-9\.]+/g,""));
//         //     }
//         // }
        
//         // for (i=0; i<molPlus.length; i++){
//         //     var tmp = [];
//         //     for (j=0; j<molPlus[i][1].length; j++){
//         //         if (!tmp.includes(molPlus[i][1][j])){
//         //             tmp.push(molPlus[i][1][j]);
//         //         }
//         //     }
//         //     molPlus[i][1] = tmp;
//         // }
//         // return molPlus;



//     },
//     findBrokenBonds: function (newMol, brokenMol){
//         var flaggedAtoms = [];
//         if(newMol.length!=brokenMol.length){
//             return null;
//         }
//         else{
//             for(i=0;i<newMol.length;i++){
//                 if(newMol[i][1].length!=brokenMol[i][1].length){
//                     flaggedAtoms.push(i)
//                 }
//             }
//         }
//         // var bondList = []
//         // for(i=0;i<flaggedAtoms.length;i++){
//         //     var firstAtomID = flaggedAtoms[i]
//         //     for(j=0;j<flaggedAtoms.length;j++){
//         //         var secondAtom = newMol[flaggedAtoms[j]][0].concat((j+1).toString())
//         //         if(newMol[firstAtomID][1].includes(secondAtom)){
//         //             bondList.push(""+firstAtomID+":"+flaggedAtoms[j])
//         //         }
//         //     }
//         // }
//         return flaggedAtoms; // Returns a list of atoms with bonds that were broken
//     },
//     alignChild: function (newMol, brokenMol, childMol){ //WIP
//         var affectedAtoms = this.findBrokenBonds(newMol, brokenMol);
//         var allConnectionsBroken = [];
//         var allConnectionsChild = [];
//         for(i=0;i<affectedAtoms.length;i++){ //affectedAtoms loop
//             var firstConnections = brokenMol[affectedAtoms[i]][1];
//             var firstConnectionsID = [];
//             for(j=0; j<firstConnections.length; j++){ //gets ids of each element in connections
//                 var tmp = firstConnections[j];
//                 tmp = tmp.replace(/[^0-9\.]+/g,"");
//                 firstConnectionsID.push(parseInt(tmp)-1);
//             }

//             var connectedElementsListA = [];
//             for(j=0;j<brokenMol[affectedAtoms[i]][1].length;j++){
//                 var tmp = affectedAtoms[i];
//                 connectedElementsListA.push(brokenMol[tmp][1][j][0]);
//             }
//             connectedElementsListA.sort();

//             for(j=0;j<childMol.length;j++){
//                 if(childMol[j][0]==brokenMol[affectedAtoms[i]][0]){
//                     var connectedElementsListB = [];
//                     for(k=0;k<childMol[j][1].length;k++){
//                         connectedElementsListB.push(childMol[j][1][k][0])
//                     }
//                     connectedElementsListB.sort();
//                     if (JSON.stringify(connectedElementsListB)==JSON.stringify(connectedElementsListA)){
//                         allConnectionsBroken.push(affectedAtoms[i]);
//                         allConnectionsChild.push(j);
//                     }
//                 }
//             }
//         }

//         // Second layer check
//         var verifiedConnections = [];
//         for(i=0;i<allConnectionsChild.length;i++){
//             var currentConnectionChildID = allConnectionsChild[i]; //current element id that needs to be found in child mol
//             var currentConnectionBrokenID = allConnectionsBroken[i]; // current element id that needs to be found in broken mol

//             var currentConnectionChild = childMol[currentConnectionChildID][1]; //current connection array in child
//             var currentConnectionBroken = brokenMol[currentConnectionBrokenID][1]; //current connection array in broken

//             currentConnectionChild.sort(); //sorts both arrays so that both are in same order
//             currentConnectionBroken.sort();

//             if(currentConnectionChild.length==currentConnectionBroken.length){ //makes sure that the arrays are the same length
//                 for(j=0;j<currentConnectionChild.length;j++){

//                     var childConnectionsID = []; // holds ids of each element in connections
//                     for(k=0; k<currentConnectionChild.length; k++){ //gets ids of each element in connections
//                         var tmp = currentConnectionChild[k]; 
//                         tmp = tmp.replace(/[^0-9\.]+/g,"");
//                         childConnectionsID.push(parseInt(tmp)-1);
//                     }

//                     var brokenConnectionsID = []; // holds ids of each element in connections
//                     for(k=0; k<currentConnectionBroken.length; k++){ //gets ids of each element in connections
//                         var tmp = currentConnectionBroken[k]; 
//                         tmp = tmp.replace(/[^0-9\.]+/g,"");
//                         brokenConnectionsID.push(parseInt(tmp)-1);
//                     }

//                     for(k=0;k<childConnectionsID.length;k++){
//                         var nextConnectionsChild = [];
//                         for(l=0;l<childMol[childConnectionsID[k]][1].length;l++){
//                             nextConnectionsChild.push(childMol[childConnectionsID[k]][1][l][0]); //pushes the atomic symbol for the connection
//                         }

//                         for(l=0;l<currentConnectionBroken.length;l++){
//                             var nextConnectionsBroken = [];
//                             for(m=0;m<brokenMol[brokenConnectionsID[l]][1].length;m++){
//                                 nextConnectionsBroken.push(brokenMol[brokenConnectionsID[l]][1][m][0])
//                             }
//                             if(JSON.stringify(nextConnectionsBroken)==JSON.stringify(nextConnectionsChild)){
//                                 verifiedConnections.push(allConnectionsChild[i]);
//                             }
//                         }

//                     }
//                 }
//             }
//         }
//         var uniqueConnections=[];
//         for(i=0;i<verifiedConnections.length;i++){ // removes duplicate values
//             if(!uniqueConnections.includes(verifiedConnections[i])){
//                 uniqueConnections.push(verifiedConnections[i]);
//             }
//         }
//         verifiedConnections = uniqueConnections.sort();
//         return verifiedConnections; // returns a list of where the affected atoms are in the child mol.
//     }
    

// }


// class Graph {
//     constructor(vertices)
// }