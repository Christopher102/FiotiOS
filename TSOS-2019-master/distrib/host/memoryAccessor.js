var TSOS;
(function (TSOS) {
    class memoryAccessor {
        //setters and getters for now. Will need more complexity later
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