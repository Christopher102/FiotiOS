module TSOS{
    export class PCB{
        
        // All the basic parts of the PCB block
        public prio: number;          
        public pid: number;           
        public acc: number;           
        public xreg: number;           
        public yreg: number;           
        public zflag: number;           
        public pc: number;           
        public state;
        public startAddr;

        constructor(priority: number, processid: number){
            this.prio = priority;
            this.pid = processid;
            this.acc = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
            this.pc = 0;
            this.state = "New";
            this.startAddr = 0;
        }
    }
}