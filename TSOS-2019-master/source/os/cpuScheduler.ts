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
            if(this.executingPCB === null && _ReadyQueue.length > 0){
                this.executingPCB = _ReadyQueue.shift();
                _CPU.loadProcess(this.executingPCB);
            }
            else if (_ReadyQueue.length > 0 && this.counter == this.quantum){
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, []))
            }
            this.counter ++;
        }

        contextSwitch(){
            // Grab the net PCB off the list
            let nextPCB = _ReadyQueue.shift();
            // Grab the current PCB
            let currentPCB = _CPU.workingPCB;
            // Set the currently executing PCB to the next PCB
            this.executingPCB = nextPCB;
            // Push the previous PCB to the queue
            _ReadyQueue.push(currentPCB);
            // Load new PCB onto CPU
            _CPU.loadProcess(currentPCB);
            _CPU.workingPCB = currentPCB;
            this.counter = 0;
        }


    }
}