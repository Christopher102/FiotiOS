var TSOS;
(function (TSOS) {
    class memoryManager {
        getByte(addr) {
            return _MemoryAccessor.getValueAtAddr(addr);
        }
        setByte(addr, value) {
            _MemoryAccessor.setValueAtAddr(addr, value);
        }
        loadIntoMemory(startaddr, valuelist) {
            let currentVal = 0;
            for (let i = startaddr; i < startaddr + valuelist.length; i++) {
                _Memory.memorySet[i] = valuelist[currentVal];
                currentVal += 1;
            }
        }
    }
    TSOS.memoryManager = memoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map