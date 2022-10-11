var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            this.memorySet = new Array(_DefaultMemorySize);
        }
        init() {
            for (let i = 0; i < this.memorySet.length; i++) {
                this.memorySet[i] == 0x00;
            }
            alert(this.memorySet);
            TSOS.Control.updateMemory();
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map