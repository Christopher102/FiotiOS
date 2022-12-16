module TSOS {
    export class Memory{
        public memorySet: Array<string>;

        constructor(){
            // See? This is why I do the grand reset. This one line does what my previous code did over 6.
            this.memorySet = new Array(_DefaultMemorySize).fill("00");
            
        }
    }
}