module TSOS{
    export class MemoryAccessor{
        constructor(){
            
        }
        
        public setMemory(value, addr){
            _Memory.memorySet[addr] = value;
        }

        public getMemory(addr){
            return _Memory.memorySet[addr];
        }

    }
}