var TSOS;
(function (TSOS) {
    class ProcessManager {
        constructor(maxProcesses) {
            this.maxProcesses = maxProcesses;
        }
        init() {
            this.processes = [];
        }
        doesProcessExist(pid) {
            return (this.processes[pid] !== undefined && this.processes[pid] !== null);
        }
        getPCB(pid) {
            return this.processes[pid];
        }
    }
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processManager.js.map