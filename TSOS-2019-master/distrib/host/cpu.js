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
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
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
        
        decode(){
            switch (this.IR) {
                case 0xA9: //Load from constant
                    this.Acc = this._MMU.readMemory(this.PC);
                    this.PC ++;
                    this.Step = 0;
                    break;
    
                case 0xAD: // Load from Memory
                    this.setlowhigh();
                    break;
    
                case 0x8D: // Store in Memory
                    this.setlowhigh();
                    break;
                
                case 0x8A: //Load from X register
                    ///This does not need a decode
                    break;
                
                case 0x98: //Load from Y
                    //No Decode
                    break;
                
                case 0x6D: //Add wtih carry
                    this.setlowhigh();
                    break;
                
                case 0xA2: //Load X with constant
                    this.x = this._MMU.readMemory(this.PC);
                    this.PC ++;
                    this.Step = 0;
                    break;
                
                case 0xAE: //Load X from memory
                    this.setlowhigh();
                    break;
                
                case 0xAA: // Load X from Acc
                    this.x = this.Acc;
                    this.Step = 6;
                    break;
                
                case 0xA0: //Load Y with Constant
                    this.y = this._MMU.readMemory(this.PC);
                    this.PC ++;
                    this.Step = 0;
                    break;
                
                case 0xAC: //Load Y with memory
                    this.setlowhigh();
                    break;
                
                case 0xA8: //Load Y from Acc
                    this.y = this.Acc;
                    this.Step = 6;
                    break;
                
                case 0xEA: // No-OP
                    //No Decode
                    break;
                
                case 0x00: // End Program
                    process.exit();
                    break;
                
                case 0xEC: //Compare Byte to X, set Z
                    this.setlowhigh();
                    break;
                
                case 0xD0: //LOOP BACK BABBYYYYY
                    this.n = this._MMU.readMemory(this.PC);
                    this.Step = 3;
                    break;
                
                case 0xEE: // Increment Value of Byte
                    break;
    
    
                case 0xFF: //Print Babyyyyyyy
                    switch (this.x) {
                        case 1:
                            this.Step = 3;
                            break;
                        case 2:
                            this.Step = 3;
                        case 3:
                            this.setlowhigh();
                        default:
                            break;
                    }
                    break;
            
                default: 
                    this.log(this.id, this.cname, this.debug, "Error: Not a listed command!");
            }
    
        } // Decode
    
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map