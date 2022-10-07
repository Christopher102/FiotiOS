var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        getAtAddress(address){
            return this.memoryArray[address]
        }
        
        setAtAddress(address,value){
            this.memoryArray[address] = value;
            return this.memoryArray[address];
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor
})(TSOS || (TSOS = {}));