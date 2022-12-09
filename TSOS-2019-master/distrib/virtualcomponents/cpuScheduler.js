var TSOS;
(function (TSOS) {
    class cpuScheduler {
        constructor() {
            this.counter = 0;
            this.quantum = _Quantum;
        }
        contextSwitch(oldPCB, newPCB) {
            oldPCB.state = "READY";
            newPCB.state = "RUNNING";
            _Kernel.krnTrace("Context Switch PCB " + oldPCB.pid + " FOR PCB " + newPCB.pid);
            _PCBController.ReadyQueue.enqueue(oldPCB);
            _CPU.runPCB(newPCB);
            TSOS.Control.updatePCBDisplay(newPCB);
            TSOS.Control.updatePCBDisplay(oldPCB);
        }
        checkCounter() {
            if (this.counter === this.quantum) {
                _Kernel.krnTrace("Quantum met. Switching Context");
                this.contextSwitch(_CPU.workingPCB, this.getNextPCB());
            }
            else {
                this.counter++;
            }
        }
        getNextPCB() {
            return _PCBController.ReadyQueue.dequeue();
        }
    }
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map