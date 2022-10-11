var TSOS;
(function (TSOS) {
    class memoryAccessor {
        getValueAtAddr(addr) {
            return _Memory.memorySet[addr];
        }
        setValueAtAddr(addr, value) {
            _Memory.memorySet[addr] = value;
        }
    }
    TSOS.memoryAccessor = memoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map