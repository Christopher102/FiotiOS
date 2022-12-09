module TSOS{
    export class ProcessController {

        public ResidentQueue: Queue;
        public ReadyQueue: Queue;
        public tempQueue: Queue;

        constructor(){
            this.ResidentQueue = new TSOS.Queue();
            this.ReadyQueue = new TSOS.Queue();
            this.tempQueue = new TSOS.Queue();
        }

        init(){

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
            alert(movingPCB.pid);
            movingPCB.state = "READY";
            TSOS.Control.updatePCBDisplay(movingPCB);
            this.ReadyQueue.enqueue(movingPCB);
        }

        public grabResidentByPID(PID: string){
            var toRun : TSOS.PCB;
            var i = 0;
            while (i < this.ResidentQueue.getSize()) {
                var tempPCB : TSOS.PCB = this.ResidentQueue.dequeue();
                if(tempPCB.pid.toString() === PID){
                    toRun = tempPCB;
                } else {
                    this.tempQueue.enqueue(tempPCB);
                }
            }
            for(let i = 0; i < this.tempQueue.getSize(); i ++){
                this.ResidentQueue.enqueue(this.tempQueue.dequeue());
            }
            return toRun;
        }

        public grabReadyByPID(PID: string){
            let numPID = parseInt(PID);
            return this.ReadyQueue[numPID];
        }

        public emptyQueues(){
            for(let i = 0; i < this.ReadyQueue.getSize(); i++){
                this.ReadyQueue.dequeue();
            }
            for(let i = 0; i < this.ResidentQueue.getSize(); i++){
                this.ResidentQueue.dequeue();
            }
        }
        
        public emptyResidentQueue(){
            for(let i = 0; i < this.ResidentQueue.getSize(); i++){
                this.ResidentQueue.dequeue();
            }
        }

        public requestNewPCB(){
            if(this.ReadyQueue.isEmpty()){
                return null;
            } else {
                return this.ReadyQueue.dequeue();
            }
        }

        public moveAllToReady(){
            while(!this.ResidentQueue.isEmpty()){
                this.moveToReady();
            }           
        }
    }
}