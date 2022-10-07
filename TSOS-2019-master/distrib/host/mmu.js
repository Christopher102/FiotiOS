var TSOS;
(function (TSOS) {
    class MMU {
        constructor(){
        }

        loadMemory(values){
            this.clearMemory();
            for(let i = 0; i < values.length; i++){
                _MemoryAccessor.setAtAddress(i, values[i]);
            }
        }

        clearMemory(){
            for(let i = 0; i < _defaultMemorySize - 1; i++){
                _MemoryAccessor.setAtAddress(i , 0x00);
            }
        }

        readMemoryByte(addr){
            return _MemoryAccessor.getAtAddress(addr);
        }

    }
   TSOS.MMU = MMU;
}
)(TSOS || (TSOS = {}));