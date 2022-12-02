/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, workingPCB = null, currentInstruction = '') {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.workingPCB = workingPCB;
            this.currentInstruction = currentInstruction;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        runPCB(newPCB) {
            if (this.workingPCB != null) {
                let oldPCB = this.workingPCB;
                this.workingPCB = newPCB;
                //this.isExecuting = true;
                this.refreshCPU();
                return oldPCB;
            }
            else {
                this.workingPCB = newPCB;
                alert(this.workingPCB);
                //this.isExecuting = true;
                this.refreshCPU();
            }
        }
        refreshCPU() {
            alert(6);
            this.PC = this.workingPCB.pc;
            alert(7);
            this.Acc = this.workingPCB.acc;
            alert(8);
            this.Xreg = this.workingPCB.xreg;
            alert(9);
            this.Yreg = this.workingPCB.yreg;
            alert(10);
            this.Zflag = this.workingPCB.zflag;
            alert(11);
            this.currentInstruction = this.workingPCB.ir;
            alert(12);
            TSOS.Control.updateCPUDisplay();
            alert(13);
        }
        refreshWorkingPCB() {
            this.workingPCB.pc = this.PC;
            this.workingPCB.acc = this.Acc;
            this.workingPCB.xreg = this.Xreg;
            this.workingPCB.yreg = this.Yreg;
            this.workingPCB.zflag = this.Zflag;
            this.workingPCB.ir = this.currentInstruction;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
        fetchdecodeexecute() {
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map