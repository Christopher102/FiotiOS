module TSOS{
    export class cpuScheduler{

        quantum : number;
        counter : number;

        constructor(){
            this.counter = 0
            this.quantum = _Quantum;
        }

        public contextSwitch(oldPCB : TSOS.PCB, newPCB : TSOS.PCB){
            oldPCB.state = "READY";
            newPCB.state = "RUNNING";
            _Kernel.krnTrace("Context Switch PCB " + oldPCB.pid + " FOR PCB " + newPCB.pid);
            _PCBController.ReadyQueue.enqueue(oldPCB);
            _CPU.runPCB(newPCB);
            TSOS.Control.updatePCBDisplay(newPCB);
            TSOS.Control.updatePCBDisplay(oldPCB);

        }

        public checkCounter(){
            if(this.counter === this.quantum){
                _Kernel.krnTrace("Quantum met. Switching Context");
                this.contextSwitch(_CPU.workingPCB, this.getNextPCB());
            } else {
                this.counter ++;
            }
        }

        public getNextPCB(){
            return _PCBController.ReadyQueue.dequeue();
        }

    }
}