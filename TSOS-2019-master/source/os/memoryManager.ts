module TSOS{
    export class memoryManager {

        // getter sand setters, plus an overall load into memory function
        public getByte(addr){
            return _MemoryAccessor.getValueAtAddr(addr);
        }

        public setByte(addr, value){
            _MemoryAccessor.setValueAtAddr(addr, value);
        }

        public loadIntoMemory(startaddr, valuelist){
            let currentVal = 0;
            // Justs loops through the value list, putting each into memory
            for(let i = startaddr; i < startaddr + valuelist.length; i++){
                _Memory.memorySet[i] = valuelist[currentVal];
                currentVal += 1;
            }
        }
    }
}