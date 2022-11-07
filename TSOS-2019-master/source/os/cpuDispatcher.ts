module TSOS{
    export class CpuDispatcher{
        public contextSwitch(){
            if(_CPU.workingPCB != null && _ReadyQueue.getSize() > 0){
                let currentPCB = _CPU.workingPCB;
                let nextPCB = _ReadyQueue.dequeue();
                _ReadyQueue.enqueue(currentPCB);
                _CpuScheduler.executingPCB = nextPCB;
                _CPU.loadProcess(nextPCB);
            }
        }
    }
}