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
                    this.roundRobin();
            }
        }

        roundRobin(){
            if(this.executingPCB == null && _ReadyQueue.length > 0){
                this.executingPCB = _ReadyQueue.reverse().pop();
                _CPU.loadProcess(this.executingPCB);
            }
            else if (_ReadyQueue.length > 0){
                if(this.counter > this.quantum){
                    _CpuDispatcher.contextSwitch();
                }
            }
        }
    }
}