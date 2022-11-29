module TSOS{
    export class PCB{
        public pid: number;
        public startMem: number;
        public endMem: number;
        public xreg: number;
        public yreg: number;
        public pc: number;
        public ir: string;
        public acc: number;
        public zflag: boolean;
        constructor(pid, startMem, endMem){
            this.pid = pid;
            this.startMem = startMem;
            this.endMem = endMem;
            this.xreg = 0;
            this.yreg = 0;
            this.pc = startMem;
            this.ir = "";
            this.acc = 0;
            this.zflag = false;

        }
    }
}