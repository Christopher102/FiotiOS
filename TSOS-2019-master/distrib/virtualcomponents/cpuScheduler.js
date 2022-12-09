var TSOS;
(function (TSOS) {
    class cpuScheduler {
        constructor() {
            this.counter = 0;
            this.quantum = _Quantum;
        }
        //Switches oldPCB and newPCB(Whatever that may be)
        contextSwitch(oldPCB, newPCB) {
            oldPCB.state = "READY";
            newPCB.state = "RUNNING";
            _Kernel.krnTrace("Context Switch PCB " + oldPCB.pid + " FOR PCB " + newPCB.pid);
            _PCBController.ReadyQueue.enqueue(oldPCB);
            _CPU.runPCB(newPCB);
            TSOS.Control.updatePCBDisplay(newPCB);
            TSOS.Control.updatePCBDisplay(oldPCB);
        }
        //Checks the counter value. Increment if unequal, switch if equal
        checkCounter() {
            if (this.counter === this.quantum && !_PCBController.ReadyQueue.isEmpty()) {
                _Kernel.krnTrace("Quantum met. Switching Context");
                this.contextSwitch(_CPU.workingPCB, this.getNextPCB());
            }
            else {
                this.counter++;
            }
        }
        //Requests the next PCB from the PCBController.
        getNextPCB() {
            return _PCBController.requestNewPCB();
        }
    }
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map