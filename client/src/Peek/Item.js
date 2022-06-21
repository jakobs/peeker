import {ThreeScene} from '../ThreeScene'
import g3dToScene from './geo3d'

function Item(props) {
  var msg = props.file;
  var preview = props.preview || false;
  switch(msg.mime) {
    case('text/plain'):
      return <p>{window.atob(msg.data)}</p>;
    case('image/png'):
      return <img alt="" src={"data:"+msg.mime+";charset=utf-8;base64,"+msg.data}></img>;
    case('image/g3d'):
      if( preview )
        return <p>{window.atob(msg.data)}</p>;
      else {
        var text = window.atob(msg.data)
        var obj = JSON.parse( text )
        var scene = g3dToScene( obj )
        return <ThreeScene scene={scene}></ThreeScene>;
      }
    default:
      return <p>{msg.file} ({msg.mime}): {msg.data}</p>;
  }
}

export default Item;
