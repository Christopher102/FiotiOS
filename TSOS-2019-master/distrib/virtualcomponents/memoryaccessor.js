var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        setMemory(value, addr) {
            _Memory.memorySet[addr] = value;
        }
        getMemory(addr) {
            return _Memory.memorySet[addr];
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryaccessor.js.map