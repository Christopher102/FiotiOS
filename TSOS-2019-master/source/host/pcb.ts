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