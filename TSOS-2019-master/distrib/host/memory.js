var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            this.memorySet = new Array(_DefaultMemorySize);
        }
        init() {
            for (let i = 0; i < _DefaultMemorySize; i++) {
                this.memorySet[i] = '00';
                TSOS.Control.updateMemory();
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map