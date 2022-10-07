var TSOS;
(function (TSOS) {
    class PCB {
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
} TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));