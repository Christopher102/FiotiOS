/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }


        // Like hell I'm not using cheap string fixes. The fact that string[index] = value doesn't work in typescript makes me very very very annoyed. I refuse to accept this.
        public static replaceAtIndex(string: string, index, replacement){
            let startsub = string.substring(0, index);
            let endsub = string.substring(index, string.length);
            return startsub + replacement + endsub;
        }
        // I realize this is almost illegible due to me naming to the variable string. So, it basically splits the string at the index, then puts in the replacement at that index.

        public static stringToHexArray(str: string){
            let charArray = [];
            for(let i = 0; i < str.length; i++){
                charArray.push(str.charCodeAt(i));
            }
            let hexArray = [];
            for(let i = 0; i < charArray.length; i++){
                hexArray.push(charArray[i].toString(16));
            }
            return hexArray;
        }

        public static stringFromHexArray(hexArray : Array<string>){
            let charArray = [];
            for(let i = 0; i < hexArray.length; i++){
                charArray.push(String.fromCharCode(parseInt(hexArray[i], 16)));
            }
            return charArray.join("");
        }

    }
}
