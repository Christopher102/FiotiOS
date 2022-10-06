

var TSOS;
(function (TSOS) {
    class Memory {
        constructor(size = Array(_defaultMemorySize)){
            this.memoryArray = size;
            this.clearMemory();
        }

        getMemorySize(){
            return this.memoryArray.length;
        }

        setMemorySize(newSize){
            this.memoryArray = newSize;
            for(let i = 0; i < newSize - 1; i++){
                if(this.memoryArray[i] != 0x00){
                    this.memoryArray[i] = 0x00;
                }
            }
            //I'm going to assume this will never be used, but hey. Never say never or whatever.

        }

        getAtAddress(address){
            return this.memoryArray[address]
        }
        
        setAtAddress(address,value){
            this.memoryArray[address] = value;
            return this.memoryArray[address];
        }

        clearMemory(){
            for(let i = 0; i < this.getMemorySize - 1; i++){
                if(this.memoryArray[i] != 0x00){
                    this.memoryArray[i] = 0x00;
                }
            }
        }
    }
}
)
