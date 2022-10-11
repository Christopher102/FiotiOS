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
            alert("PCB BEGIN");
            var newPCB = new PCB(0, globalPIDcount);
            alert("PUSHING TO STACK");
            this.pcbList.push(newPCB);
            alert("RETURNING PID");
            _StdOut.putText("PROCESS PID: " + globalPIDcount);
            globalPIDcount += 1;
        }
    }
}