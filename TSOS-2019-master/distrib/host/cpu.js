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
        updateCPU() {
            this.PC = this.workingPCB.pc;
            this.Acc = this.workingPCB.acc;
            this.Xreg = this.workingPCB.xreg;
            this.Yreg = this.workingPCB.yreg;
            this.Zflag = this.workingPCB.zflag;
        }
        runPid(pid) {
            this.updateCPU();
            this.workingPCB = _ProcessManager.getPCB(pid);
            this.workingPCB.state = "RUNNING";
            this.isExecuting = true;
        }
        loadProcess(executingPCB) {
            this.workingPCB = executingPCB;
            this.updateCPU();
            this.isExecuting = true;
            TSOS.Control.updateCpuDisplay();
        }
        updatePCB() {
            this.workingPCB.acc = this.Acc;
            this.workingPCB.pc = this.PC;
            this.workingPCB.xreg = this.Xreg;
            this.workingPCB.yreg = this.Yreg;
            this.workingPCB.zflag = this.Zflag;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            this.fetchdecodeexecute();
            if (this.workingPCB != null) {
                this.updatePCB();
            }
        }
        fetchdecodeexecute() {
            this.currentInstruction = _MemoryManager.read(this.workingPCB, this.PC);
            _Kernel.krnTrace(this.currentInstruction);
            switch (this.currentInstruction) {
                case 'A9': // Load acc with constant 
                    this.PC++;
                    this.Acc = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    break;
                case 'AD': // Load acc from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    this.Acc = parseInt(_MemoryManager.getByte(addr), 16);
                    this.PC++;
                    break;
                case '8D': // Store acc in memory
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    _MemoryManager.setByte(addr, this.Acc.toString(16));
                    this.PC++;
                    break;
                case '6D': // Add with carry
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    this.Acc += parseInt(_MemoryManager.getByte(addr), 16);
                    this.PC++;
                    break;
                case 'A2': // Load X Register with constant 
                    this.PC++;
                    this.Xreg = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    break;
                case 'AE': // Load X Register from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    this.Xreg = parseInt(_MemoryManager.getByte(addr), 16);
                    this.PC++;
                    break;
                case 'A0': // Load Y Register with constant 
                    this.PC++;
                    this.Yreg = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    break;
                case 'AC': // Load Y Register from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    this.Yreg = parseInt(_MemoryManager.getByte(addr), 16);
                    this.PC++;
                    break;
                case 'EC': // Compare byte at addr to xreg, if equal set Z true
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    this.Zflag = (this.Xreg === parseInt(_MemoryManager.getByte(addr), 16)) ? 1 : 0;
                    this.PC++;
                    break;
                case 'D0': // Branch N if Z true
                    if (this.Zflag === 0) {
                        let n = parseInt(_MemoryManager.read(this.workingPCB, this.PC + 1), 16);
                        this.PC = (this.PC + n + 2) % 256;
                    }
                    else {
                        this.PC += 2;
                    }
                    break;
                case 'EE': // Increment byte
                    this.PC++;
                    var addr = parseInt(_MemoryManager.getByte(this.PC), 16);
                    this.PC++;
                    var value = parseInt(_MemoryManager.getByte(addr), 16);
                    value++;
                    _MemoryManager.setByte(addr, value.toString(16));
                    this.PC++;
                    break;
                case 'FF': // System call
                    if (this.Xreg === 1) {
                        var params = { output: this.Yreg.toString() };
                    }
                    else {
                        var output = '';
                        var addr = this.Yreg;
                        var code = _MemoryManager.getByte(addr);
                        while (code !== '00') {
                            var letter = String.fromCharCode(parseInt(code, 16));
                            output += letter;
                            addr++;
                            var code = _MemoryManager.getByte(this.PC);
                        }
                    }
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSCALL_IRQ, [output]));
                    this.PC++;
                    break;
                case 'EA': // Skip
                    this.PC++;
                    break;
                case '00': // Break Out
                    this.workingPCB.state = "Terminated";
                    this.Acc = 0;
                    this.Xreg = 0;
                    this.Yreg = 0;
                    this.Zflag = 0;
                    this.PC = 0;
                    this.updatePCB();
                    _CpuScheduler.executingPCB = this.workingPCB;
                    this.workingPCB = null;
                    this.isExecuting = false;
                default:
                    alert('Incorrect instruction');
                    alert(this.currentInstruction);
                    this.isExecuting = false;
                    break;
            }
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map