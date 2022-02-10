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
                    var min_area = 1000;
                    var max_area = 0;
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
                        var area = 0;
                        var bary = [0,0];
                        base.moveTo(coords[0][0], coords[0][1]);
                        for (var j = 0 ; j < coords.length - 1 ; j++) {
                            base.lineTo(coords[j+1][0], coords[j+1][1])
                            // Function that calcul the area of the building
                            bary[0] += coords[j+1][0];
                            bary[1] += coords[j+1][1];
                        }
                        bary[0] = bary[0]/(coords.length - 1);
                        bary[1] = bary[1]/(coords.length - 1);

                        // Calc "area"
                        for (var j = 0 ; j < coords.length - 1 ; j++) {
                            area += Math.sqrt((coords[j+1][0] - bary[0])**2 + (coords[j+1][1] - bary[1])**2)
                        }
                        area = area/(coords.length - 1);
                
                        var  extrudeSettings = {
                            steps: 1,
                            depth: 50,
                            bevelEnabled: true,
                            bevelThickness: 0,
                            bevelSize: 0,
                            bevelOffset: 0,
                            bevelSegments: 1
                        };

                        var color = new THREE.Color( 0xffffff );
                        color.setHex( Math.random() * 0xffffff );
                
                        var geometry = new THREE.ExtrudeGeometry( base , extrudeSettings);
                        var geometry2 = new THREE.EdgesGeometry(geometry);
                        var material = new THREE.MeshLambertMaterial({color: 0x000000});
                        var material2 = new THREE.LineBasicMaterial( { color: color, linewidth: 1} );
                        var building = new THREE.Group();
                        var building1 = new THREE.Mesh( geometry, material ) ;
                        var building2 = new THREE.LineSegments( geometry2, material2 ) ;
                        building.add(building1, building2);

                        building.basic_position = Math.floor(Math.random() * 10) + 10 - 50;
                        building.position.z = building.basic_position;
                        building.area = area;

                        if (area > max_area) {
                            max_area = area;
                        }
                        
                        if (area < min_area) {
                            min_area = area;
                        }
                
                        Buildings.add(building);
                    }


                    for (var i = 0 ; i < Buildings.children.length ; i++) {
                        Buildings.children[i].id_area = Math.floor(20 * Math.random())
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