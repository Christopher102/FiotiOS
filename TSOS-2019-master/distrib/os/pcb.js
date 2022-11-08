var TSOS;
(function (TSOS) {
    class PCB {
        constructor(priority, processid, baseAddr, limitAddr) {
            this.prio = priority;
            this.pid = processid;
            this.acc = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
            this.pc = 0;
            this.state = "New";
            this.baseAddr = baseAddr;
            this.limitAddr = limitAddr;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map