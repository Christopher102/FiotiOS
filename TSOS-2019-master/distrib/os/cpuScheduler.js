var TSOS;
(function (TSOS) {
    class CpuScheduler {
        constructor(quantum) {
            this.quantum = quantum;
            this.counter = 0;
            this.executingPCB = null;
        }
        schedule() {
            switch (_ScheduleType) {
                case 'RR':
                    this.roundRobin();
            }
        }
        roundRobin() {
            alert("RR");
            alert(_ReadyQueue.length);
            if (this.executingPCB == null && _ReadyQueue.length > 0) {
                alert("NO SWITCH");
                this.executingPCB = _ReadyQueue.reverse().pop();
                _CPU.loadProcess(this.executingPCB);
            }
            else if (_ReadyQueue.length > 0) {
                alert("CONTEXT SWITCH");
                if (this.counter > this.quantum) {
                    _CpuDispatcher.contextSwitch();
                }
                else {
                    this.counter++;
                }
            }
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map