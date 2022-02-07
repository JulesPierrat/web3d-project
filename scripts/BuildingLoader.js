import * as THREE from "../lib/threejs/build/three.module.js"

class BuildingLoader {
    constructor(){
        this.m_lon = 0;
        this.m_lat = 0;
        this.ok = false;
        this.load = function(path , nb){
            this.ok = false;
            return new Promise((resolve, reject) => {
                return fetch(path).then(a => a.json()).then(a => {
                    // Get bary point
                    var x = 0;
                    var y = 0;
                    var c = 0;
                    for (var i = 0 ; i < nb ; i++) {
                        let arr = a.features[i].geometry.coordinates[0][0];
                        for (var j = 0 ; j < arr.length ; j++) {
                            c++;
                            x += arr[j][0];
                            y += arr[j][1];
                        }
                    }
                    this.m_lon = x/c;
                    this.m_lat = y/c;

                    let Buildings = new THREE.Group();
                    for (var i = 0 ; i < nb ; i++){
                        var coords = this.transform(a.features[i].geometry.coordinates[0][0]);
                        //var coords = [[0,0],[1,0],[1,1],[0,1],[0,0]]
                        var base = new THREE.Shape();
                        base.moveTo(coords[0][0], coords[0][1]);
                        for (var j = 0 ; j < coords.length - 1 ; j++) {
                            base.lineTo(coords[j+1][0], coords[j+1][1])
                        }

                        var height = Math.random() * 10;
                
                        var extrudeSettings = {
                            depth: height
                        }

                        var color = new THREE.Color( 0xffffff );
                        color.setHex( Math.random() * 0xffffff );
                
                        var geometry = new THREE.ExtrudeGeometry( base , extrudeSettings);
                        var material = new THREE.MeshLambertMaterial( { color: color } );
                        var building = new THREE.Mesh( geometry, material ) ;
                
                        Buildings.add(building);
                    }
                    resolve(Buildings);
                    this.ok = true;
                });
            })
        };

        this.transform = function(coords){

            for (var i = 0 ; i < coords.length ; i++) {
                coords[i][0] = (coords[i][0] - this.m_lon)*10000;
                coords[i][1] = (coords[i][1] - this.m_lat)*10000;
            }

            return coords;
        }
    }
}

export {BuildingLoader};