var http = require('http');
var express = require('express');
var request = require('request');
const bodyParser = require('body-parser');
const escomplex = require('escomplex');
const fs = require('fs');
var esprima = require('esprima');


//code must be ran with a port num
const PORT_NUM = process.argv[2];

var workerNode = express();
workerNode.use(bodyParser.json());
workerNode.use(bodyParser.urlencoded({ extended: true }));

var req;
var manager = {
    hostname: 'localhost',
    port: 3000,
    path: '',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
    }
  };

//probably wont use but leaving for the minute
workerNode.get('/', (req,res) => {

});

//method for the worker to handle post requests from the manager
workerNode.post('/work', (req,res) => {
	if(req.body.status == 200){
		console.log('Examining file: ' + req.body.index + '\n');
		var filePath = '' + req.body.path;
		if(!fs.existsSync(filePath)){
			console.log('file doesnt exist fam.');
			request.post(
				'http://localhost:3000',
			    { json: {
					port : PORT_NUM,
					status : 'invalid',
					score : -1,
					path: req.body.path,
					index : req.body.index
				} },
		   		function (error, response, body) {
		       		if (!error && response.statusCode == 200) {
		            	console.log(body);
		        	}
		    	}
			);
		}
		else{
			var jsToString = fs.readFileSync(filePath, 'utf8');
			const result = escomplex.analyse(jsToString);
			console.log('Analysis complete.');
			request.post(
				'http://localhost:3000',
			    { json: {
					port : PORT_NUM,
					status : 'done',
					score : result.aggregate.cyclomatic,
					path: req.body.path,
					index : req.body.index
				} },
		   		function (error, response, body) {
		       		if (!error && response.statusCode == 200) {
		            	console.log(body);
		        	}
		    	}
			);
		}
	}
	else{
		console.log('work finito');
		process.exit();
	}
});

//method for when the manager initialises the nodes
//nodes tell the manager they are ready to receive work
workerNode.post('/init', (req,res) => {
	console.log('Worker ready to work @ port: ' + PORT_NUM);

	request.post(
    'http://localhost:3000',
    { json: {
		port : PORT_NUM,
		status : 'ready'
	} },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
	);
});

workerNode.listen(PORT_NUM, (err) => {
	if(err){
		return console.log('Worker cannot listen on port ' + PORT_NUM);
	}
	console.log('Worker listening on port '  + PORT_NUM);
});