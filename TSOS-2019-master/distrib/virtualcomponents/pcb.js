var TSOS;
(function (TSOS) {
    class PCB {
        constructor(pid, startMem, endMem) {
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
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map