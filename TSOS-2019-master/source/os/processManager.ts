module TSOS {
    export class processManager{
        pidQueue: any[];

        constructor(){
        }

        public init(): void{
            this.pidQueue = [];
        }
    }
}