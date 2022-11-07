module TSOS{
    export class memoryManager {

        segments = [-1, -1, -1];

        // getter sand setters, plus an overall load into memory function
        public getByte(addr){
            return _MemoryAccessor.getValueAtAddr(addr);
        }

        public setByte(addr, value){
            _MemoryAccessor.setValueAtAddr(addr, value);
        }

        public loadIntoMemory(priority, valuelist){
            let startAddr = 0;
            let endAddr = 0;
            let currentVal = 0;
            for(let i = 0; i < this.segments.length; i++){
                if(this.segments[i] == -1){
                    this.segments[i] = globalPIDcount;
                }
            }
            if(globalPIDcount > 3){
                startAddr = (globalPIDcount % 3) * 256
                endAddr = ((globalPIDcount % 3) * 256) + 255
            } else {
                startAddr = (globalPIDcount) * 256
                endAddr = ((globalPIDcount) * 256) + 255
            }

            let pcb = new TSOS.PCB(priority, globalPIDcount, startAddr, endAddr);
            _ResidentQueue.push(pcb);
            // Justs loops through the value list, putting each into memory
            for(let i = startAddr; i <= endAddr; i++){
                _Memory.memorySet[i] = valuelist[currentVal];
                currentVal += 1;
            }
            return pcb.pid;
        }
    }
}