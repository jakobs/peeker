const express = require('express')
const fs = require('fs')
const app = express()
const chokidar = require('chokidar')
const mime = require('mime')

require('express-ws')(app)

const port = 3001
const watchdir = process.argv.length > 2 ? process.argv[2] : "."
const max_file_size = 5000000

app.use(express.static(__dirname + '/views'));

console.log("watching " + watchdir)

mime.define({'image/g3d': ['g3d']})

app.ws('/ws', (ws, req) => {  
    console.log("Started websocket connection")

    var onWatch = (event, path) => {
	console.log(event, path);
	if( event == 'add' || event == 'change') {
	    const fstat = fs.statSync( path )
	    if( fstat.size < max_file_size ) {
		fs.readFile( path, (err, data) => {
		    var msg = { 
			'file': path, 
			'mime': mime.getType(path),
			'data': data.toString('base64') 
		    }
		    ws.send( JSON.stringify(msg) )
		});
	    }
	    else {
		console.log( path + " is too large." );
	    }
	}
    }

    var options = {awaitWriteFinish: {stabilityThreshold: 500}}
    var listener = chokidar.watch(watchdir, options).on('all', onWatch);

    ws.on('close', () => {
	console.log("closed websocket connection")
	listener.off('all', onWatch)
    });

})

app.listen(port,null,()=>{
    console.log("Server started at localhost:"+port)
})
