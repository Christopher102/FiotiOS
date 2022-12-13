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
            // Before you get upset at the triple nested loop, understand that I originally wanted to do either hashing or a tree, but ran out of time
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

        public writeFile(filename: string, data: string, inHex = false){
            let hexArray = [];
            if(inHex){
                hexArray = data.split(" ");
            } else {
                hexArray = TSOS.Utils.stringToHexArray(data);
            }
            let filenameaddr = this.findFile(filename);
            let nextAddr = this.getNext(filenameaddr);
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


        public deleteFile(filename:string){
            let filenameaddr = this.findFile(filename);
            let nextAddr = this.getNext(filenameaddr);
            sessionStorage.setItem(filenameaddr, this.createEmptyDataset().join(" "));
            sessionStorage.setItem(nextAddr, this.createEmptyDataset().join(" "));
            TSOS.Control.updateHardDisk(nextAddr, sessionStorage.getItem(nextAddr));
            TSOS.Control.updateHardDisk(filenameaddr, sessionStorage.getItem(filenameaddr));
        }

        public renameFile(oldfilename: string, newfilename: string){
            let filenameaddr = this.findFile(oldfilename);
            let hexArray = TSOS.Utils.stringToHexArray(newfilename);
            let olddata = sessionStorage.getItem(filenameaddr).split(" ");
            for(let i = 0; i < hexArray.length; i ++){
                olddata[i + 4] = hexArray[i];
            }
            for(let i = hexArray.length + 4; i < olddata.length; i++){
                olddata[i] = "--";
            }
            sessionStorage.setItem(filenameaddr, olddata.join(" "));
            TSOS.Control.updateHardDisk(filenameaddr, olddata.join(" "));


        }

        public listFiles(){
            let list = [];
            for(let i = 0; i < 4; i++){
                for(let j = 0; j < 8; j++){
                    for(let k = 0; k < 8; k++){
                        let addr = this.createAddr(i,j,k);
                        let data = sessionStorage.getItem(addr).split(" ");
                        if(this.checkNext(data, "*") || this.checkNext(data, "0")){
                            //ignore
                        } else {
                            list.push(this.getFileName(data).join(""));
                        }
                    }
                }
            }
            return list;
        }

        public checkNext(data: string[], checkValue: string){
            let value = false;
            if(data[0] === checkValue && data[1] === checkValue && data[2] === checkValue){
                value = true;
            }
            return value;
        }

        public getFileName(data: string[]){
            let nameArray = [];
            for(let i = 4; i < data.indexOf("--"); i++){
                nameArray.push(String.fromCharCode(parseInt(data[i], 16)));
            }
            return nameArray;
        }

        public rollOut(PID, data: string[]){
            let filename = "~" + PID;
            this.create(filename);
            this.writeFile(filename, data.join(" "), true);
        }

        public rollIn(PID){

        }
    }

}
