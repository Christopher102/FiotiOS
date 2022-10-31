module TSOS {
    export class processManager{
        pcbList: TSOS.PCB[];

        constructor(){
        }

        public init(): void{
            this.pcbList = [];
        }

        // Gets the PCB from the list of PCBs
        public getPCB(PID: number): TSOS.PCB{
            for(let i = 0; i < this.pcbList.length; i++){
                if(this.pcbList[i].pid = PID){
                    return this.pcbList[i];
                }
            }
        }

        // creates a PCB and pushes it to the list.
        public createPCB(){
            var newPCB = new PCB(0, globalPIDcount);
            this.pcbList.push(newPCB);
            _StdOut.putText("PROCESS PID: " + globalPIDcount);
            globalPIDcount += 1;
        }
    }
}