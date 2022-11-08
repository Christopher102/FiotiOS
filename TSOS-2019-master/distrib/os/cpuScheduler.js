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
            alert("MADE IT TO ROUND ROBIN");
            alert(this.executingPCB);
            alert(_ReadyQueue.getSize());
            if (this.executingPCB == null && _ReadyQueue.getSize() > 0) {
                this.executingPCB = _ReadyQueue.dequeue();
                alert("Loading PCB");
                _CPU.loadProcess(this.executingPCB);
            }
            else if (_ReadyQueue.getSize() > 0) {
                alert("MADE IT TO QUANTUM CHECK");
                if (this.counter > this.quantum) {
                    _CpuDispatcher.contextSwitch();
                }
            }
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map