module TSOS{
    export class memoryAccessor{

        public getValueAtAddr(addr){
            return _Memory.memorySet[addr];
        }

        public setValueAtAddr(addr, value){
            _Memory.memorySet[addr] = value;
        }
    }
}