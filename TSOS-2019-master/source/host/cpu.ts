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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public workingPCB: TSOS.PCB = null,
                    public currentInstruction: string = '') {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public runPCB(newPCB: TSOS.PCB){
            if(this.workingPCB != null){
                let oldPCB: TSOS.PCB = this.workingPCB;
                this.workingPCB = newPCB;
                this.isExecuting = true;
                this.refreshCPU();
                return oldPCB;
            } else {
                this.workingPCB = newPCB;
                this.isExecuting = true;
                this.refreshCPU();
            }
        }

        public refreshCPU(){
            this.PC = this.workingPCB.pc;
            this.Acc = this.workingPCB.acc;
            this.Xreg = this.workingPCB.xreg;
            this.Yreg = this.workingPCB.yreg;
            this.Zflag = this.workingPCB.zflag;
            this.currentInstruction = this.workingPCB.ir;
            TSOS.Control.updateCPUDisplay();
        }

        public refreshWorkingPCB(){
            this.workingPCB.pc = this.PC
            this.workingPCB.acc = this.Acc
            this.workingPCB.xreg = this.Xreg
            this.workingPCB.yreg = this.Yreg
            this.workingPCB.zflag = this.Zflag
            this.workingPCB.ir = this.currentInstruction;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle: Instruction: ' + this.currentInstruction);
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if(this.isExecuting){
                this.currentInstruction = _MemoryManager.read(this.workingPCB, this.PC);
                this.fetchdecodeexecute();
                this.refreshWorkingPCB();
                TSOS.Control.updateCPUDisplay();
            }
        }

        public fetchdecodeexecute(){
            switch (this.currentInstruction) {
                case 'A9': // Load acc with constant 
                    this.PC ++;
                    this.Acc = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC ++;
                    break;
                case 'AD': // Load acc from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    this.Acc = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    break;
                case '8D': // Store acc in memory
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    _MemoryManager.writeByte(addr, this.Acc.toString(16));
                    this.PC++;
                    break;
                case '6D': // Add with carry
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    this.Acc += parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    break;
                case 'A2': // Load X Register with constant 
                    this.PC++;
                    this.Xreg = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    break;
                case 'AE': // Load X Register from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    this.Xreg = parseInt(_MemoryManager.readByte(addr), 16);
                    this.PC++;
                    break;
                case 'A0': // Load Y Register with constant 
                    this.PC++;
                    this.Yreg = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    break;
                case 'AC': // Load Y Register from memory 
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    this.Yreg = parseInt(_MemoryManager.readByte(addr), 16);
                    this.PC++;
                    break;
                case 'EC': // Compare byte at addr to xreg, if equal set Z true
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    this.Zflag = (this.Xreg === parseInt(_MemoryManager.readByte(addr), 16)) ? 1 : 0;
                    this.PC++;
                    break;
                case 'D0': // Branch N if Z true
                    if(this.Zflag === 0){
                        let n = parseInt(_MemoryManager.read(this.workingPCB, this.PC + 1), 16);
                        this.PC = (this.PC + n + 2) % 256;
                    } else {
                        this.PC += 2;
                    }
                    break;
                case 'EE': // Increment byte
                    this.PC++;
                    var addr = parseInt(_MemoryManager.readByte(this.PC), 16);
                    this.PC++;
                    var value = parseInt(_MemoryManager.readByte(addr), 16);
                    value++;
                    _MemoryManager.writeByte(addr, value.toString(16));
                    this.PC++;
                    break;
                case 'FF': // System call
                    if(this.Xreg === 1){
                        var output = this.Yreg.toString();
                        _Kernel.krnInterruptHandler(SYSCALL_IRQ, output);
                    } else if(this.Xreg === 2){
                        var output = "";
                        var code = parseInt(_MemoryManager.readByte(this.Yreg + this.workingPCB.startMem), 16);
                        var addr = this.Yreg + this.workingPCB.startMem;
                        while(code != 0x00){
                            output = String.fromCharCode(code);
                            _Kernel.krnInterruptHandler(SYSCALL_IRQ, output);
                            addr = addr + 1;
                            var code = parseInt(_MemoryManager.readByte(addr), 16);
                        }
                    }
                    this.PC ++;
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
                    this.workingPCB = null;
                    this.isExecuting = false;
                    break;

                default:
                    alert('Incorrect instruction');
                    alert(this.currentInstruction);
                    this.isExecuting = false;
                    break;
            }
        }
            
    }
}
