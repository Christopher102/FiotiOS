module TSOS{
    export class cpuScheduler{

        quantum : number;
        counter : number;

        constructor(){
            this.counter = 0
            this.quantum = _Quantum;
        }

        //Switches oldPCB and newPCB(Whatever that may be)
        public contextSwitch(oldPCB : TSOS.PCB, newPCB : TSOS.PCB){
            oldPCB.state = "READY";
            newPCB.state = "RUNNING";
            _Kernel.krnTrace("Context Switch PCB " + oldPCB.pid + " FOR PCB " + newPCB.pid);
            if(_LoadCount > 3){
                if(newPCB.location === "HDD"){
                    newPCB = _Swapper.swapFromHDD(newPCB);
                    _CPU.runPCB(newPCB);
                    _PCBController.ReadyQueue.enqueue(oldPCB);
                    TSOS.Control.updatePCBDisplay(newPCB);
                    TSOS.Control.updatePCBDisplay(oldPCB);
                } else {
                    _CPU.runPCB(newPCB);
                    TSOS.Control.updatePCBDisplay(newPCB);
                    TSOS.Control.updatePCBDisplay(oldPCB);
                    _Swapper.swap(oldPCB);

                }
            } else {
                if(newPCB.location === "HDD"){
                    newPCB = _Swapper.swapFromHDD(newPCB);
                    _CPU.runPCB(newPCB);
                    _PCBController.ReadyQueue.enqueue(oldPCB);
                    TSOS.Control.updatePCBDisplay(newPCB);
                    TSOS.Control.updatePCBDisplay(oldPCB);
                } else {
                    _CPU.runPCB(newPCB);
                    _PCBController.ReadyQueue.enqueue(oldPCB);
                    TSOS.Control.updatePCBDisplay(newPCB);
                    TSOS.Control.updatePCBDisplay(oldPCB);
                }
            }

        }

        //Checks the counter value. Increment if unequal, switch if equal
        public checkCounter(){
            if(this.counter === this.quantum && !_PCBController.ReadyQueue.isEmpty()){
                _Kernel.krnTrace("Quantum met. Switching Context");
                this.contextSwitch(_CPU.workingPCB, this.getNextPCB());
                this.counter = 0;
            } else {
                this.counter ++;
            }
        }

        //Requests the next PCB from the PCBController.
        public getNextPCB(){
            return _PCBController.requestNewPCB();
        }

    }
}