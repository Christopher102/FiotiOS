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
        constructor(PC = 0, Acc = 0, IR = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.IR = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }

        fetchdecodeexecute(){

            this.IR = _MemoryAccessor.getAtAddress(_CPU.PC).toUpperCase();

            switch (this.IR) {
                case "A9":
                    this.loadConstant();
                    break;
                case "AD":
                    this.loadMemory();
                    break;
                case "8D":
                    this.storeMemory();
                    break;
                case "6D":
                    this.addwithCarry();
                    break;
                case "A2":
                    this.loadXConstant();
                    break;
                case "AE":
                    this.loadXMemory();
                    break;
                case "A0":
                    this.loadYConstant();
                    break;
                case "AC":
                    this.loadYMemory();
                    break;
                case "EA":
                    _CPU.incrementPC();
                    break;
                case "00":
                    this.break();
                    this.isExecuting = false;
                    break;
                case "EC":
                    this.compareX();
                    break;
                case "D0":
                    this.branchNBytes();
                    break;
                case "EE":
                    this.incrementPC();
                    break;
                case "FF":
                    this.systemCall();
                    break;
                default:
                    _Kernel.krnTrapError(`ERROR: NOT A COMMAND`);
                    this.isExecuting = false;
                    break;
            }
    
        } // Decode
    
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map