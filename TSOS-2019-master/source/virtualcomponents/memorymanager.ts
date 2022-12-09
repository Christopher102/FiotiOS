module TSOS{
    export class MemoryManager{
        public segments: Array<number>
        public startMem: number;
        public endMem: number;

        constructor(){
            this.segments = [-1, -1, -1];
            this.startMem = 0;
            this.endMem = 255;
        }

        public clearMemory(){
            _Memory.memorySet.fill("00");
        }

        public clearMemorySegment(start: number, endval: number){
            for(let i = start; i < endval + 1; i++){
                _Memory.memorySet[i] = "00";
            }
        }

        public loadSegment(valuelist: Array<string>){
            let startMem = 0;
            let endMem =  0;
            //  checking segments by checking PID number
            switch (globalPIDCount % 3) {
                case 0:
                    startMem = 0;
                    endMem = 255;
                    break;
                
                case 1:
                    startMem = 256;
                    endMem = 511;
                    break;
                
                case 2:
                    startMem = 512;
                    endMem = 767;
                    break;
            
                default:
                    alert("You managed to break a mod. Congrats.");
                    _Kernel.krnTrapError("GLOBAL PID MEMORY ERROR: OUT OF RANGE MOD");
                    break;
            }
            this.clearMemorySegment(startMem, endMem);
            switch (startMem) {
                case startMem = 0:
                    for(let i = 0; i < valuelist.length; i ++){
                        _MemoryAccessor.setMemory(valuelist[i], i)
                    }
                    this.segments[0] = 1;
                    break;
                
                case startMem = 256:
                    for(let i = 0; i < valuelist.length; i ++){
                        _MemoryAccessor.setMemory(valuelist[i], i + 256)
                    }
                    this.segments[1] = 1;
                    break;
                
                case startMem = 512:
                    for(let i = 0; i < valuelist.length; i ++){
                        _MemoryAccessor.setMemory(valuelist[i], i + 512)
                    }
                    this.segments[2] = 1;
                    break;
            
                default:
                    alert("ERROR: START VALUE NOT 0, 256, or 712");
                    break;
            }
        }

        public readByte(location){
            if(location > _CPU.workingPCB.endMem || location < _CPU.workingPCB.startMem){
                _Kernel.krnTrapError("ERROR: OUT OF BOUNDS MEMORY ACCESS");
            } else {
                return _MemoryAccessor.getMemory(location);
            }
        }

        public writeByte(location, value){
            if(location > _CPU.workingPCB.endMem || location < _CPU.workingPCB.startMem){
                _Kernel.krnTrapError("ERROR: OUT OF BOUNDS MEMORY ACCESS");
            } else {
                return _MemoryAccessor.setMemory(value, location);
            }
        }

        public read(pcb : TSOS.PCB, addr){
            if(pcb.startMem + addr > _CPU.workingPCB.endMem || pcb.endMem + addr < _CPU.workingPCB.startMem){
                _Kernel.krnTrapError("ERROR: OUT OF BOUNDS MEMORY ACCESS");
            } else {
                return _MemoryAccessor.getMemory(pcb.startMem + addr);
            }
        }
    }
}