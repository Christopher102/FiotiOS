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
            for(let i = 1; i < this.pcbList.length; i++){
                if(this.pcbList[i].pid = PID){
                    return this.pcbList[i];
                }
            }
        }

        public createPCB(){
            var newPCB = new TSOS.PCB(0, globalPIDcount);
            this.pcbList.push(newPCB);
            _StdOut.putText("PROCESS PID: " + globalPIDcount);
            globalPIDcount += 1;
        }
    }
}