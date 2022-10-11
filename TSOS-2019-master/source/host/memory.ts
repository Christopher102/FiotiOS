
module TSOS {
    export class Memory {
        public memorySet: Array<string>;
        constructor(){
            // Memory set is just the me marray
            this.memorySet = new Array(_DefaultMemorySize);
        }

        init(){
            for(let i = 0; i < _DefaultMemorySize; i++){
                // Sets all values to 0 by default
                this.memorySet[i] = '00';
                TSOS.Control.updateMemory();
            }
        }
    }
}