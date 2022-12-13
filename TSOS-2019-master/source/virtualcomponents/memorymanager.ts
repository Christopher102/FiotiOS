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

        public checkEmptySegment(){
            let segmentIndex = this.segments.indexOf(-1);
            return segmentIndex;
        }

        public loadSegment(valuelist: Array<string>){
            let segmentSelection = this.checkEmptySegment();
            let startMem = 0;
            let endMem = 0;
            switch (segmentSelection) {
                case 0:
                    startMem = 0;
                    endMem = 255;
                    this.segments[0] = 1;
                    break;
                case 1:
                    startMem = 256
                    endMem = 511;
                    this.segments[1] = 1;
                    break;
                case 2:
                    startMem = 512;
                    endMem = 767
                    this.segments[2] = 1;
                    break;
                case -1:
                    startMem = -1;
                    endMem = -1;
                    break;
                default:
                    break;
            }
            if(startMem === -1){
                //Roll out into HDD. Something Something Useful Comment
            } else {
                for(let i = 0; i < valuelist.length; i++){
                    _Memory.memorySet[i + startMem] = valuelist[i];
                }
                return [startMem, endMem];
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