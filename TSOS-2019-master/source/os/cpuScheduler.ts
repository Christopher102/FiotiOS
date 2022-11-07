module TSOS{
    export class CpuScheduler{

        quantum: number;
        counter: number;
        executingPCB: TSOS.PCB;


        constructor(quantum){
            this.quantum = quantum;
            this.counter = 0;
            this.executingPCB = null;
        }

        schedule(){
            switch(_ScheduleType){
                case 'RR':
                    this.roundRobin()
            }
        }

        roundRobin(){
            if(this.executingPCB == null && _ReadyQueue.getSize() > 0){
                this.executingPCB = _ReadyQueue.dequeue();
                _CPU.loadProcess(this.executingPCB);
            }
            else if (_ReadyQueue.getSize() > 0){
                if(this.counter > this.quantum){
                    _CpuDispatcher.contextSwitch();
                }
            }
        }
    }
}