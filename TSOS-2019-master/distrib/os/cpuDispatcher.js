var TSOS;
(function (TSOS) {
    class CpuDispatcher {
        contextSwitch() {
            if (_CPU.workingPCB != null && _ReadyQueue.length > 0) {
                let currentPCB = _CPU.workingPCB;
                let nextPCB = _ReadyQueue.reverse().pop();
                _ReadyQueue.push(currentPCB);
                _CpuScheduler.executingPCB = nextPCB;
                _CPU.loadProcess(nextPCB);
            }
        }
    }
    TSOS.CpuDispatcher = CpuDispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuDispatcher.js.map