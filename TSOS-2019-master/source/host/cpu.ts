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

        private updateCPU(): void {
            alert("UPDATING CPU!");
            this.PC    = this.workingPCB.pc;
            this.Acc   = this.workingPCB.acc;
            this.Xreg  = this.workingPCB.xreg;
            this.Yreg  = this.workingPCB.yreg;
            this.Zflag = this.workingPCB.zflag;
        }

        public runPid(pid : number): void{
            alert("RUNNING PID");
            this.workingPCB = _ProcessManager.getPCB(pid);
            this.workingPCB.state = "RUNNING";
            this.isExecuting = true;
            this.updateCPU();

        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            if(this.isExecuting = true){
                this.fetchdecodeexecute()
            }
            TSOS.Control.updateCPUDisplay();
            
        }

        public fetchdecodeexecute(){
            switch(this.currentInstruction){
                case 'A9': // Load acc with constant 
                    this.PC ++;
                    this.Acc = parseInt(_MemoryManager.getByte(this.PC), 16)
                    this.PC ++;
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
                    this.PC++;
                    if(this.Zflag === 0){
                        var hex = _MemoryManager.getByte(this.PC);
                        this.PC++;
                        var jump = parseInt(hex, 16);
                        this.PC += jump;
                    } else {
                        this.PC++;
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
                    if (this.Xreg === 1){
                        var params = { output: this.Yreg.toString() };
                    } else {
                        var output = '';
                        var addr = this.Yreg;
                        var code = _MemoryManager.getByte(addr);
                        while(code !== '00'){
                            var letter = String.fromCharCode(parseInt(code,16));
                            output += letter;
                            addr++;
                            var code = _MemoryManager.getByte(this.PC);
                        }
                    }
                    _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, []));
                    this.PC++;
                    break;
                case 'EA': // Skip
                    this.PC++;
                    break;
                case '00': // Break Out
                    this.isExecuting = false;
                    this.workingPCB.state = "Terminated";
                    this.workingPCB = null;
                    this.Acc = 0;
                    this.Xreg = 0;
                    this.Yreg = 0;
                    this.Zflag = 0;
                    this.PC = 0;
                default:
                    alert('Incorrect instruction');
                    this.isExecuting = false;
                    break;
            }
        }
    }
}
