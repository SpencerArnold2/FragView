
class Node{
    constructor(data_3D, data_2D, id, parent = null, left = null, right = null){
        this.data_3D = data_3D;
        this.data_2D = data_2D;
        this.parent = parent;
        this.left = left;
        this.right = right;
        this.id = id;
    }
    getMol3D(){
        return this.data_3D;
    }
    getMol2D(){
        return this.data_2D;
    }
    getLeft(){
        return this.left;
    }
    getRight(){
        return this.right;
    }
    getID(){
        return this.id;
    }
    isRight(){
        return (this.id === this.parent.right.getID());
    }
    isLeft(){
        return (this.id === this.parent.left.getID());
    }
    setLeft(node){
        this.left = node;
    }
    setRight(node){
        this.right = node;
    }
}
class BinaryTree{
    constructor(mol3d, mol2d){
        this.idCount = 0;
        this.molecules = [];
        let newNode = new Node(mol3d, mol2d, this.idCount);
        this.molecules.push(newNode);
        this.root = this.molecules[0];

    }
    getMolList(){
        return this.molecules;
    }
    getHeight(node){
            if(!node) return 0;
            var leftHeight = this.getHeight(node.left);
            var rightHeight = this.getHeight(node.right);
         
            return Math.max(leftHeight, rightHeight) + 1;
    }
    insert(node, mol_3d1, mol_3d2, mol_2d1, mol_2d2, id){
        let h = this.getHeight(this.root);
        let currentLength = this.molecules.length;
        let maxLength = (Math.pow(2, (h+1)) -1);
        for (let i = currentLength; i< maxLength; i++){
            this.molecules.push(null);
        }
        let newID_1 = ((2 * id) + 1);
        let newID_2 = ((2 * id) + 2);
        let newNode_1 = new Node(mol_3d1, mol_2d1, newID_1, parent = node);
        let newNode_2 = new Node(mol_3d2, mol_2d2, newID_2, parent = node);
        node.setLeft(newNode_1);
        node.setRight(newNode_2);
        this.molecules[newID_1] = newNode_1;
        this.molecules[newID_2] = newNode_2;
        updateGrid(this);
    }
    deleteNode(node){
        let index = node.getID();
        if (index == 0){
            this.clearAll();
            return node;
        }
        else{
           if (node.left === null){
            node = null;
            this.molecules[index] = null;
            return node;
            }
            else{
                this.deleteNode(node.left);
                this.deleteNode(node.right);
                node = null;
                this.molecules[index] = null;
                return node;
            } 
        }
        
    }
    clearAll(){
        this.deleteNode(this.root.getLeft());
        this.deleteNode(this.root.getRight());
    }

    
}
var BST = new BinaryTree(defaultMol3D, defaultMol2D);