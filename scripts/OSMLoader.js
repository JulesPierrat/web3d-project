import * as THREE from "../lib/threejs/build/three.module.js";

class OSMLoader {
    constructor(){
        this.load = function(x , y , n){
            var nn = Math.pow(2,n-1);
            var dx = 360/nn;
            var dy = 180/nn;
            var kx = Math.floor((x+180)/dx);
            console.log((x+180)/dx);
            console.log(kx);
            var ky = Math.floor((90-y)/dy);
            console.log((90-y)/dy);
            console.log(ky);
            console.log("https://tile.openstreetmap.org/"+(n-1)+"/"+kx+"/"+ky+".png")
        };
    }
}

export {OSMLoader};