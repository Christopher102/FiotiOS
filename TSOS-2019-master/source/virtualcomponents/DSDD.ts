module TSOS{
    export class DSDD{

        constructor(){
        }


        public createEmptyDataset(){
            let set = ["0", "0", "0", "0"];
            let i = 0;
            while(i < 64){
            set.push("--")
            i++;
            }
            return set;
        }

        public createAddr(t, s, b){
            return t + ":" + s + ":" + b;
        }

        public getTSB(addr: string){
            let t = addr[0];
            let s = addr[2];
            let b = addr[4];
            return [t,s,b];
        }
        
        public createDataArray(data: string){
            let set = data.split(" ");
            return set;
        }

        public format(){
            for(let i = 0; i < 4; i ++){
                for(let j = 0; j < 8; j ++){
                    for(let k = 0; k < 8; k ++){
                        let addr = i + ":" + j + ":" + k;
                        let dataset = this.createEmptyDataset();
                        sessionStorage.setItem(addr, dataset.join(" "));
                        TSOS.Control.updateHardDisk(addr, sessionStorage.getItem(addr));
                    }
                }
            }
        }


        public create(filename: string){
            let hexArray = TSOS.Utils.stringToHexArray(filename);
            let fileblock = this.findEmptyBlock();
            let writeblock = this.findEmptyBlock();
            if(fileblock === "" || writeblock === ""){
                _Kernel.krnTrace("No space availible. Please delete before continuing to add.");
            } else {
                let filedata = this.updateData(hexArray, writeblock, "1");
                sessionStorage.setItem(fileblock, filedata.join(" "));
                TSOS.Control.updateHardDisk(fileblock, filedata.join(" "));
                let writedata = this.updateData([], '*:*:*', "1");
                sessionStorage.setItem(writeblock, writedata.join(" "));
                TSOS.Control.updateHardDisk(writeblock, writedata.join(" "));
            }
        }


        public updateData(hexArray: Array<string>, writeaddr, allocation){
            let newData = this.createEmptyDataset();
            let tsb = this.getTSB(writeaddr);
            newData[0] = tsb[0];
            newData[1] = tsb[1];
            newData[2] = tsb[2];
            newData[3] = allocation;
            if(hexArray.length != 0){
                for(let i = 0; i < hexArray.length; i++){
                    newData[i + 4] = hexArray[i];
                }
            }
            return  newData;

        }

        public findEmptyBlock(){
            for(let i = 0; i < 4; i++){
                for(let j = 0; j < 8; j++){
                    for(let k = 0; k < 8; k++){
                        let addr = this.createAddr(i, j, k);
                        let block = sessionStorage.getItem(addr).split(" ");
                        if(block[3] === "0"){
                            // This is only temporary, otherwise the next find would overwrite this one during a create.
                            sessionStorage.setItem(addr, this.updateData([], "*.*.*", "1").join(" "));
                            return addr;
                        } else if (block[3] === "1" && i === 3 && j === 7 && k === 7){
                            return "";
                        }
                    }
                }
            
            }

        }

        public getNext(addr){
            let file = sessionStorage.getItem(addr).split(" ");
            let t = file[0];
            let s = file[1];
            let b = file[2];
            return this.createAddr(t,s,b);

        }

        public findFile(filename: string){
            let hexArray = TSOS.Utils.stringToHexArray(filename);
            let compareData = this.updateData(hexArray, "*.*.*", "1").join(" ");
            for(let i = 0; i < 4; i++){
                for(let j = 0; j < 8; j++){
                    for(let k = 0; k < 8; k++){
                        let addr = this.createAddr(i,j,k);
                        let block = sessionStorage.getItem(addr);
                        if(block.substring(8) === compareData.substring(8)){
                            return addr;
                        }


                    }
                }
            }
        }

        public writeFile(filename: string, data: string){
            let filenameaddr = this.findFile(filename);
            let nextAddr = this.getNext(filenameaddr);
            let hexArray = TSOS.Utils.stringToHexArray(data);
            let pulledData = sessionStorage.getItem(nextAddr).split(" ");
            for(let i = 0; i < hexArray.length; i++){
                pulledData[i + 4] = hexArray[i];
            }
            sessionStorage.setItem(nextAddr, pulledData.join(" "));
            TSOS.Control.updateHardDisk(nextAddr, pulledData.join(" "));
            _Console.putText("Successfully wrote to file " + filename);
        }

        public readFile(filename:string){
            let filenameaddr = this.findFile(filename);
            let nextAddr = this.getNext(filenameaddr);
            let pulledData = sessionStorage.getItem(nextAddr).split(" ");
            let returnArray = [];
            let i = 4;
            while(pulledData[i] != "--"){
                returnArray.push(String.fromCharCode(parseInt(pulledData[i], 16)));
                i++;
            }
            _Console.putText("Contents of file " + filename + ":")
            _Console.advanceLine();
            _Console.putText(returnArray.join(""));
        }
    }

}
