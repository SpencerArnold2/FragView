//These MolNodes will be held in the MolList and store the data to be loaded by Sketcher.js and Model.js
class MolNode{
    constructor(mol3d, mol2d, smile=""){
        this.mol2d = mol2d;
        this.mol3d = mol3d;
        this.smile = smile;
    }
    set2d(data){
        this.mol2d = data;
    }
    set3d(data){
        this.mol3d = data;
    }
    get2d(){
        return this.mol2d;
    }
    get3d(){
        return this.mol3d;
    }
    getSmile() {
        return this.smile;
    }
}
class MolList{
    constructor(){
        this.molList = [];
    }
    addNode(smile){
        let newNode = new MolNode(smile);
        this.molList.push(newNode);
    }
    delNode(node) {
        this.molList.pop(node);
    }
    pushNode(node){
        this.molList.push(node);
    }
    getMolList(){
        let list = this.molList;
        return list;
    }
    getNode(index){
        let node = this.molList[index];
        return node;
    }
}
