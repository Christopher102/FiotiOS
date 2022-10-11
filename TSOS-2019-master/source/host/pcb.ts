module TSOS{
    export class PCB{
        public prio:       number;           // Importance
        public pid:      number;           // Int
        public acc:            number;           // Number from 0-255
        public xreg:      number;           // Number from 0-255
        public yreg:      number;           // Number from 0-255
        public zflag:          number;           // 0 or 1
        public pc: number;           // Location of current program execution
        public state;
        constructor(){
            
        }
    }
}