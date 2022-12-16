module TSOS{
    export class PCB{
        public pid: number;
        public priority: number;
        public state: string;
        public startMem: number;
        public endMem: number;
        public xreg: number;
        public yreg: number;
        public pc: number;
        public ir: string;
        public acc: number;
        public zflag: number;
        public location: string;
        constructor(pid, startMem, endMem){
            this.pid = pid;
            this.priority = 0;
            this.state = "resident";
            this.startMem = startMem;
            this.endMem = endMem;
            this.xreg = 0;
            this.yreg = 0;
            this.pc = 0;
            this.ir = _MemoryAccessor.getMemory(startMem).toString();
            this.acc = 0;
            this.zflag = 0;
            this.location = "MEM";

        }
    }
}