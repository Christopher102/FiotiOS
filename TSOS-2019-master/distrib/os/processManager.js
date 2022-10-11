var TSOS;
(function (TSOS) {
    class processManager {
        constructor() {
        }
        init() {
            this.pcbList = [];
        }
        // Gets the PCB from the list of PCBs
        getPCB(PID) {
            for (let i = 1; i < this.pcbList.length; i++) {
                if (this.pcbList[i].pid = PID) {
                    return this.pcbList[i];
                }
            }
        }
        createPCB() {
            alert("PCB BEGIN");
            var newPCB = new TSOS.PCB(0, globalPIDcount);
            alert("PUSHING TO STACK");
            this.pcbList.push(newPCB);
            alert("RETURNING PID");
            _StdOut.putText("PROCESS PID: " + globalPIDcount);
            globalPIDcount += 1;
        }
    }
    TSOS.processManager = processManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processManager.js.map