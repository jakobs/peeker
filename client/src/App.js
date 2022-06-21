import './App.css';
import React from 'react'
import Item from './Peek/Item'
import ItemList from './Peek/ItemList'

class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {connected: false, files: {}}

    var url = "ws://172.20.0.2:3001/ws"
    this.ws = new WebSocket(url)

    this.selectItem = this.selectItem.bind(this)
  }

  componentDidMount() {
    this.ws.addEventListener( "open", ()=> {
      this.setState( {connected: true} )
    })

    this.ws.addEventListener( "message", (ev)=> {
      var msg = JSON.parse(ev.data)
      this.setState( (prevState, props) => {
        return { ...prevState, 'files': {
          ...prevState.files,
          [msg.file]: msg
        }}
      })
    })

    this.ws.addEventListener( "close", ()=> {
      this.setState( {connected: false} )
    })
  }

  selectItem( name ) {
    console.log( name )
    this.setState( {'selected': name} );
  }

  render() {
    return (
      <div className="App">
        <div className="item-viewer">
            <div className="item-list">
              <ItemList files={this.state.files} onSelect={this.selectItem}/>
            </div>
            <div className="item-detail">
            { this.state.selected && 
              <Item file={this.state.files[this.state.selected]}/> }
            </div>
        </div>
      </div>
    );
  }
}

export default App;
