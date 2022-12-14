module TSOS{
    export class Swapper{
        outPCB: TSOS.PCB;
        inPCB : TSOS.PCB;
        constructor(){
            this.outPCB = null;
            this.inPCB = null;

        }



        public swapMemory(oldPCB: TSOS.PCB){
            this.outPCB = oldPCB;
            this.inPCB = _PCBController.ReadyQueue.popTail();
            let outdata = _MemoryManager.getSegmentAndClear(this.outPCB);
            _DSDD.rollIn(this.inPCB.pid);
            this.inPCB.location = "MEM";
            this.inPCB.startMem = this.outPCB.startMem;
            this.inPCB.endMem = this.outPCB.endMem;
            _DSDD.rollOut(this.outPCB.pid, outdata);
            this.outPCB.location = "HDD";
            this.outPCB.startMem = 0;
            this.outPCB.endMem = 0;
            _PCBController.ReadyQueue.enqueue(this.inPCB);
            _PCBController.ReadyQueue.enqueue(this.outPCB);
            TSOS.Control.updatePCBDisplay(this.outPCB);
            TSOS.Control.updatePCBDisplay(this.inPCB);
            TSOS.Control.updateMemory(this.inPCB.pid);
        }
    }
}