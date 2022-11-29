module TSOS{
    export class MemoryManager{

        public clearMemory(){
            _Memory.memorySet.fill("00");
        }

        public clearMemorySegment(start: number, endval: number){
            for(let i = start; i < endval + 1; i++){
                _Memory.memorySet[i] = "00";
            }
        }

        public loadSegment(valuelist: Array<string>, startMem: number, endMem: number){
            this.clearMemorySegment(startMem, endMem);
            valuelist.
        }
    }
}