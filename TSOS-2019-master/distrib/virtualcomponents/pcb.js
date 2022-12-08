var TSOS;
(function (TSOS) {
    class PCB {
        constructor(pid, startMem, endMem) {
            this.pid = pid;
            this.priority = 0;
            this.state = "resident";
            this.startMem = startMem;
            this.endMem = endMem;
            this.xreg = 0;
            this.yreg = 0;
            this.pc = startMem;
            this.ir = _MemoryAccessor.getMemory(startMem).toString();
            this.acc = 0;
            this.zflag = 0;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map