var TSOS;
(function (TSOS) {
    class memoryManager {
        // getter sand setters, plus an overall load into memory function
        getByte(addr) {
            return _MemoryAccessor.getValueAtAddr(addr);
        }
        setByte(addr, value) {
            _MemoryAccessor.setValueAtAddr(addr, value);
        }
        loadIntoMemory(startaddr, valuelist) {
            let currentVal = 0;
            // Justs loops through the value list, putting each into memory
            for (let i = startaddr; i < startaddr + valuelist.length; i++) {
                _Memory.memorySet[i] = valuelist[currentVal];
                currentVal += 1;
            }
        }
    }
    TSOS.memoryManager = memoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map