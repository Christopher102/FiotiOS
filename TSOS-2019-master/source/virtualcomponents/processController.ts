module TSOS{
    export class ProcessController {

        public ResidentQueue: Queue;
        public ReadyQueue: Queue;

        constructor(){
            this.ResidentQueue = new TSOS.Queue();
            this.ReadyQueue = new TSOS.Queue();
        }

        public newPCB(PID){
            let startMem = 0;
            let endMem =  0;
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

        public moveToReady(){
            let movingPCB: TSOS.PCB = this.ResidentQueue.dequeue();
            movingPCB.state = "READY";
            this.ReadyQueue.enqueue(movingPCB);
        }
    }
}