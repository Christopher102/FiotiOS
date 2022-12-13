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

        //Won't work without this. No idea why. Going to ignore.
        init(){

        }

        //Generates a new PCB, and sets the memory segment. If you get an error here, dear god in heaven help you.
        public newPCB(PID, startMem, endMem, location = "MEM"){
            let freshPCB = new TSOS.PCB(PID, startMem, endMem);
            freshPCB.location = location;
            this.ResidentQueue.enqueue(freshPCB);
        }

        //Moves a PCB from Resident to ready
        public moveToReady(){
            let movingPCB: TSOS.PCB = this.ResidentQueue.dequeue();
            movingPCB.state = "READY";
            TSOS.Control.updatePCBDisplay(movingPCB);
            this.ReadyQueue.enqueue(movingPCB);
        }


        // Grabs a resident PCB by it's PID by moving all PCBs between two queues until it finds the correct one.
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


        //Honestly? Could remove this. But it's fine for now.
        public grabReadyByPID(PID: string){
            let numPID = parseInt(PID);
            return this.ReadyQueue[numPID];
        }

        //Empties out both queues entirely
        public emptyQueues(){
            for(let i = 0; i < this.ReadyQueue.getSize(); i++){
                this.ReadyQueue.dequeue();
            }
            for(let i = 0; i < this.ResidentQueue.getSize(); i++){
                this.ResidentQueue.dequeue();
            }
        }
        
        //Empties only resident
        public emptyResidentQueue(){
            for(let i = 0; i < this.ResidentQueue.getSize(); i++){
                this.ResidentQueue.dequeue();
            }
        }

        // Requests a new PCB from controller. If ReadyQueue is empty, returns null
        public requestNewPCB(){
            if(this.ReadyQueue.isEmpty()){
                return null;
            } else {
                return this.ReadyQueue.dequeue();
            }
        }

        // Moves all PCBs in resident to Ready and updates status
        public moveAllToReady(){
            while(!this.ResidentQueue.isEmpty()){
                this.moveToReady();
            }           
        }
    }
}