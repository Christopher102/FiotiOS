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

        public create(filename : string){
            var emptyblock = this.findEmptyBlock(0, 0);
            if(emptyblock === "Sector Full"){
                _Kernel.krnTrace("Tried Creation, Sector Full");
            } else if(emptyblock === "Track Full"){
                _Kernel.krnTrace("Tried Creation, Track Full");
            } else if(emptyblock === "Disk Full"){
                _Kernel.krnTrace("Tried Creation, Disk Full");
                _Kernel.krnTrace("Please delete some files.");
            } else {
                let charCodeArray = [];
                for(let i = 0; i < filename.length; i++){
                    let char = filename.charCodeAt(i);
                    let stringchar = char.toString(16);
                    charCodeArray.push(stringchar);
                }
                this.write(emptyblock, this.findEmptyBlock(1, 0), charCodeArray);
                _Console.putText("File " + filename + " Successfully Created!");
            }
        }

        public write(addr, nextaddr, values: Array<string>){
            let newData = this.emptyDataSet;
            for(let i = 0; i < values.length; i++){
                // Custom string replacement. See my insane comments in Utils to understand my madness
                newData = TSOS.Utils.replaceAtIndex(newData, i, " " + values[i] + " ");
            }
            sessionStorage.setItem(addr, newData);
            TSOS.Control.updateHardDisk(addr[0], addr[2], addr[4], nextaddr, newData);
            _Kernel.krnTrace("Created file");
            

            
        }

        public findEmptyBlock(track?: number, sector?: number){
            var returntrack = 0;
            var returnsector = 0;
            if(track != undefined){
                if(sector != undefined){
                    returntrack = track;
                    returnsector = sector;
                    for(let i = 0; i < 8; i++){
                        let addr = returntrack + ":" + returnsector + ":" + i;
                        let block = sessionStorage.getItem(addr);
                        if(block === this.emptyDataSet){
                            return addr;
                        } else if (i === 7 && block != this.emptyDataSet){
                            return "Sector Full";
                        }
                    }
                } else {
                    returntrack = track;
                    for(let j =  0; j < 8; j++){
                        for(let i = 0; i < 8; i++){
                            let addr = this.getAddr(returntrack + j + i.toString());
                            // This line is going to cause problems. Double check it.
                            let block = sessionStorage.getItem(addr);
                            if(block === this.emptyDataSet){
                                return addr;
                            } else if (i === 7 && block != this.emptyDataSet && j === 7){
                                return "Track Full";
                            }
                        }
                    }
                }
            } else {
                for(let k = 0; k < 4; k++){
                    for(let j =  0; j < 8; j++){
                        for(let i = 0; i < 8; i++){
                            let addr = this.getAddr(k + j + i.toString());
                            // This line is going to cause problems. Double check it.
                            let block = sessionStorage.getItem(addr);
                            if(block === this.emptyDataSet){
                                return addr;
                            } else if (i === 7 && block != this.emptyDataSet && j === 7 && k === 3){
                                return "Disk Full";
                            }
                        }
                    }
                }
            }
        }

    }
}