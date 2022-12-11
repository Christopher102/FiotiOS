module TSOS{
    export class DSDD{

        emptyDataSet: string;
        constructor(){
             this.emptyDataSet = "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -";
        }

        public getAddr(string){
            let t = string[0];
            let s = string[1];
            let b = string[2];
            return t + ":" + s + ":" + b
        }

        public format(){
            for(let i = 0; i < 4; i++){
                for(let j = 0; j < 8; j++){
                    for(let k = 0; k < 8; k++){
                        sessionStorage.setItem(i + ":" + j + ":" + k, this.emptyDataSet);
                        TSOS.Control.updateHardDisk(i, j, k, "0,0,0", sessionStorage.getItem(i + ":" + j + ":" + k));
                    }
                }
            }
        }

    }
}