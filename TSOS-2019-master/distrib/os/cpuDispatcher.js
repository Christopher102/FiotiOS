var TSOS;
(function (TSOS) {
    class CpuDispatcher {
        constructor() {
        }
        contextSwitch() {
            // alert("SWITCH");
            //     let currentPCB = _CPU.workingPCB;
            // alert("CURRENT PCB PID: " + currentPCB.pid);
            //     let nextPCB = _ReadyQueue[_ReadyQueue.length - currentPCB.pid - 1];
            // alert("NEXT PCB PID: " + nextPCB.pid);
            //     _ReadyQueue.push(currentPCB);
            //     _CpuScheduler.executingPCB = nextPCB;
            //     alert(nextPCB.pid);
            //     _CPU.loadProcess(nextPCB);
        }
    }
    TSOS.CpuDispatcher = CpuDispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuDispatcher.js.map