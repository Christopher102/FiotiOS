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
        //Runs a new passed PCB. Figure it fits here because it'll set all CPU info for us.
        runPCB(newPCB) {
            if (this.workingPCB != null) {
                let oldPCB = this.workingPCB;
                this.workingPCB = newPCB;
                this.workingPCB.state = "RUNNING";
                oldPCB.state = "READY";
                this.isExecuting = true;
                this.refreshCPU();
                return oldPCB;
            }
            else {
                this.workingPCB = newPCB;
                this.isExecuting = true;
                this.workingPCB.state = "RUNNING";
                this.refreshCPU();
            }
        }
        //Updates CPU
        refreshCPU() {
            this.PC = this.workingPCB.pc;
            this.Acc = this.workingPCB.acc;
            this.Xreg = this.workingPCB.xreg;
            this.Yreg = this.workingPCB.yreg;
            this.Zflag = this.workingPCB.zflag;
            this.currentInstruction = this.workingPCB.ir;
            TSOS.Control.updateCPUDisplay();
        }
        //Refreshes currently used PCB
        refreshWorkingPCB() {
            this.workingPCB.pc = this.PC;
            this.workingPCB.acc = this.Acc;
            this.workingPCB.xreg = this.Xreg;
            this.workingPCB.yreg = this.Yreg;
            this.workingPCB.zflag = this.Zflag;
            this.workingPCB.ir = this.currentInstruction;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle: Instruction: ' + this.currentInstruction);
            //Updates Memory. Happens before next cycle because reasons (I have none)
            TSOS.Control.updateMemory(this.workingPCB.pid);
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.isExecuting) {
                if (_SingleStep) {
                }
                this.currentInstruction = _MemoryManager.read(this.workingPCB, this.PC);
                this.fetchdecodeexecute();
                //Updates displays and PCB itself.
                this.refreshWorkingPCB();
                TSOS.Control.updatePCBDisplay(this.workingPCB);
                TSOS.Control.updateCPUDisplay();
            }
        }
        fetchdecodeexecute() {
            switch (this.currentInstruction) {
                case 'A9': // Load acc with constant 
                    this.PC++;
                    this.Acc = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    this.PC++;
                    break;
                case 'AD': // Load acc from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    this.Acc = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    this.PC++;
                    break;
                case '8D': // Store acc in memory
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    _MemoryManager.writeByte(newaddr, this.Acc.toString(16));
                    this.PC++;
                    break;
                case '6D': // Add with carry
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    this.Acc += parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    this.PC++;
                    break;
                case 'A2': // Load X Register with constant 
                    this.PC++;
                    this.Xreg = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    this.PC++;
                    break;
                case 'AE': // Load X Register from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    this.Xreg = parseInt(_MemoryManager.readByte(newaddr), 16);
                    this.PC++;
                    break;
                case 'A0': // Load Y Register with constant 
                    this.PC++;
                    this.Yreg = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    this.PC++;
                    break;
                case 'AC': // Load Y Register from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.read(this.workingPCB, this.PC), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    this.Yreg = parseInt(_MemoryManager.readByte(newaddr), 16);
                    this.PC++;
                    break;
                case 'EC': // Compare byte at addr to xreg, if equal set Z true
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    this.Zflag = (this.Xreg === parseInt(_MemoryManager.readByte(newaddr), 16)) ? 1 : 0;
                    this.PC++;
                    break;
                case 'D0': // Branch N if Z true
                    this.PC++;
                    if (this.Zflag === 0) {
                        let n = parseInt(_MemoryManager.read(this.workingPCB, this.PC), 16);
                        this.PC += n;
                        if (this.PC > 256) {
                            this.PC = this.PC % 256;
                        }
                        this.PC++;
                    }
                    else {
                        this.PC++;
                    }
                    break;
                case 'EE': // Increment byte
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC + this.workingPCB.startMem), 16);
                    var newaddr = this.adjustAddr(addr);
                    this.PC++;
                    var value = parseInt(_MemoryManager.readByte(newaddr), 16);
                    value++;
                    _MemoryManager.writeByte(newaddr, value.toString(16));
                    this.PC++;
                    break;
                case 'FF': // System call
                    if (this.Xreg === 1) {
                        var output = this.Yreg.toString();
                        _Kernel.krnInterruptHandler(SYSCALL_IRQ, output);
                    }
                    else if (this.Xreg === 2) {
                        var output = "";
                        var code = parseInt(_MemoryManager.readByte(this.Yreg + this.workingPCB.startMem), 16);
                        var addr = this.Yreg + this.workingPCB.startMem;
                        while (code != 0x00) {
                            output = String.fromCharCode(code);
                            _Kernel.krnInterruptHandler(SYSCALL_IRQ, output);
                            addr = addr + 1;
                            var code = parseInt(_MemoryManager.readByte(addr), 16);
                        }
                    }
                    this.PC++;
                    break;
                case 'EA': // Skip
                    this.PC++;
                    break;
                case '00': // Break Out
                    // Resets the CPU and sets PCB status to terminated
                    this.workingPCB.state = "Terminated";
                    this.Acc = 0;
                    this.Xreg = 0;
                    this.Yreg = 0;
                    this.Zflag = 0;
                    this.PC = 0;
                    //Console Output
                    _Console.advanceLine();
                    _Console.putText("PCB " + this.workingPCB.pid + " EXECUTED TO COMPLETION.");
                    ///Updates PCB display
                    TSOS.Control.updatePCBDisplay(this.workingPCB);
                    //Clears working PCB and sets executiong to false.
                    this.workingPCB = null;
                    this.isExecuting = false;
                    //Updates CPU display
                    TSOS.Control.updateCPUDisplay();
                    // Newline for either next input or next function
                    _Console.advanceLine();
                    _OsShell.putPrompt();
                    // Requests new PCB
                    var nextPCB = _PCBController.requestNewPCB();
                    //If recieved, assume Runall command. If not, ends execution cycle.
                    if (nextPCB === null) {
                        this.isExecuting = false;
                    }
                    else {
                        this.isExecuting = true;
                        this.runPCB(nextPCB);
                    }
                    break;
                default:
                    // Pray if you get here.
                    _Kernel.krnTrace("ERROR: Incorrect Instruction " + this.currentInstruction);
                    this.isExecuting = false;
                    break;
            }
        }
        //Adjusts the addr to match the startMem point. It won't work without this, and I don't understand why. But here we are.
        adjustAddr(addr) {
            return addr + this.workingPCB.startMem;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map