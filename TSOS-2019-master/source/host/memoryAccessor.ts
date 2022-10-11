module TSOS{
    export class memoryAccessor{

        //setters and getters for now. Will need more complexity later
        public getValueAtAddr(addr){
            return _Memory.memorySet[addr];
        }

        public setValueAtAddr(addr, value){
            _Memory.memorySet[addr] = value;
        }
    }
}