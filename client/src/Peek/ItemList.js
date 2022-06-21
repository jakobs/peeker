import Item from './Item'

function ItemList(props) {
  var list = [];
  for( const name in props.files ) {
    const file = props.files[name]
    list.push(<div key={name} className="item" onMouseOver={()=>props.onSelect(name)}>
      <Item file={file} preview={true}/>
      </div>)
  }
  return list;
}

export default ItemList;
