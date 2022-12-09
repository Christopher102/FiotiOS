var TSOS;
(function (TSOS) {
    class ProcessController {
        constructor() {
            this.ResidentQueue = new TSOS.Queue();
            this.ReadyQueue = new TSOS.Queue();
            this.tempQueue = new TSOS.Queue();
        }
        init() {
        }
        newPCB(PID) {
            let startMem = 0;
            let endMem = 0;
            //  checking segments by checking PID number
            switch (PID % 3) {
                case 0:
                    startMem = 0;
                    endMem = 255;
                    break;
                case 1:
                    startMem = 256;
                    endMem = 511;
                    break;
                case 2:
                    startMem = 512;
                    endMem = 767;
                    break;
                default:
                    alert("You managed to break a mod. Congrats.");
                    _Kernel.krnTrapError("GLOBAL PID PCB ERROR: OUT OF RANGE MOD");
                    break;
            }
            let freshPCB = new TSOS.PCB(PID, startMem, endMem);
            this.ResidentQueue.enqueue(freshPCB);
        }
        moveToReady() {
            let movingPCB = this.ResidentQueue.dequeue();
            movingPCB.state = "READY";
            this.ReadyQueue.enqueue(movingPCB);
        }
        grabResidentByPID(PID) {
            var toRun;
            var i = 0;
            while (i < this.ResidentQueue.getSize()) {
                var tempPCB = this.ResidentQueue.dequeue();
                if (tempPCB.pid.toString() === PID) {
                    toRun = tempPCB;
                }
                else {
                    this.tempQueue.enqueue(tempPCB);
                }
            }
            for (let i = 0; i < this.tempQueue.getSize(); i++) {
                this.ResidentQueue.enqueue(this.tempQueue.dequeue());
            }
            return toRun;
        }
        grabReadyByPID(PID) {
            let numPID = parseInt(PID);
            return this.ReadyQueue[numPID];
        }
    }
    TSOS.ProcessController = ProcessController;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processController.js.map