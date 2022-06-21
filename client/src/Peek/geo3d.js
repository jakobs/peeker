import * as THREE from 'three'
import { Lut } from "three/examples/jsm/math/Lut"

function hashCode(str,seed=0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
};

class G3DParser {
  frames = {};
  sets = {};
  lut = new Lut('rainbow', 512);

  parseRect(rect) {
    var set = this.getSet(rect.set);

    var geo = new THREE.PlaneGeometry( rect.width, rect.height );
    const material = new THREE.MeshLambertMaterial( {color: set.color, side: THREE.DoubleSide, opacity: 0.3, transparent: true} );
    const mesh = new THREE.Mesh( geo, material );

    var points = []
    points.push( new THREE.Vector3( -rect.width/2, -rect.height/2, 0 ) );
    points.push( new THREE.Vector3( rect.width/2, -rect.height/2, 0 ) );
    points.push( new THREE.Vector3( rect.width/2, rect.height/2, 0 ) );
    points.push( new THREE.Vector3( -rect.width/2, rect.height/2, 0 ) );
    points.push( new THREE.Vector3( -rect.width/2, -rect.height/2, 0 ) );
    const ogeo = new THREE.BufferGeometry().setFromPoints( points );
    const omaterial = new THREE.LineBasicMaterial( { color: set.color } );
    const line = new THREE.Line( ogeo, omaterial );
    mesh.add( line );

    return mesh;
  }

  getSet(name) {
    if( name in this.sets ) {
      return this.sets[name];
    }
    var value = 0;
    if( name ) {
      value = hashCode(name); 
    }
    var color = new THREE.Color( (value % 255)/255, ((value / 255) % 255)/255, ((value / 255 / 255 ) % 255)/255 );
    var set = {color: color}
    this.sets[name] = set;
    return set;
  }

  parseFrame(msg) {
    var frame = new THREE.Group();
    if( msg.rotation ) {
      frame.quaternion.set( msg.rotation.x, msg.rotation.y, msg.rotation.z, msg.rotation.w );
    }
    if( msg.translation ) {
      frame.position.set( msg.translation.x, msg.translation.y, msg.translation.z );
    }
    return frame;
  }

  parseList(list) {
    var root = new THREE.Group();

    for( const li of list ) {
      var obj;
      switch(li.type) {
        case 'rect':
          obj = this.parseRect( li );
          break;
        case 'frame':
          obj = this.parseFrame( li );
          this.frames[li.name] = obj;
          break;
        default:
          break;
      }
      if( obj ) {
        if( li.frame in this.frames ) {
          this.frames[li.frame].add( obj );
        } else {
          root.add( obj );
        }
      }
    }
    return root;
  }

  parse( obj ) {
    return this.parseList( obj );
  }
}

function g3dToScene(obj) {
  var g3dp = new G3DParser();
  return g3dp.parse(obj);
}

export default g3dToScene;
