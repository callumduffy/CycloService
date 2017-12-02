var http = require('http');
var express = require('express');

//code must be ran with a port num
const PORT_NUM = process.argv[2];

var workerNode = express();
var req;
var manager = {
    hostname: 'localhost',
    port: 3000,
    path: '',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
  };

//probably wont use but leaving for the minute
workerNode.get('/', (req,res) => {

});

//method for the worker to handle post requests from the manager
workerNode.post('/', (req,res) => {
	console.log('gotten it');
	req = http.request(manager);
	req.write('send');
	req.end();
});

workerNode.listen(PORT_NUM, (err) => {
	if(err){
		return console.log('Worker cannot listen on port ' + PORT_NUM);
	}
	console.log('Worker listening on port '  + PORT_NUM);
});