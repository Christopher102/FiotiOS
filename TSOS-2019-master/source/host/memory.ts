
module TSOS {
    export class Memory {

        public memory;

        constructor(length){
            this.memory = new Array(length);
        }

        public init(){
            for(var i = 0; i < this.memory.length; i++){
                this.memory[i] = '00';
            }
        }
    }
}