
module TSOS {
    export class Memory {
        public memorySet: Array<string>;
        constructor(){
            this.memorySet = new Array(_DefaultMemorySize);
        }

        init(){
            for(let i = 0; i < _DefaultMemorySize; i++){
                this.memorySet[i] = '00';
                TSOS.Control.updateMemory();
            }
        }
    }
}