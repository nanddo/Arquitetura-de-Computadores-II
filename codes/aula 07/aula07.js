// reference the http module so we can create a webserver
var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');

http.listen(process.env.PORT, function(){
  console.log('listening on ' + process.env.PORT);
});

/*http.createServer(function(req, res) {
    // on every request, we'll output 'Hello world'
    if (req.url == '/turnLedOn'){
		led_value = 1;
		res.write('Valor do LED: ' + led_value);
	}
	res.end();
}).listen(process.env.PORT, process.env.IP);*/

// Note: when spawning a server on Cloud9 IDE, 
// listen on the process.env.PORT and process.env.IP environment variables

// Click the 'Run' button at the top to start your server,
// then click the URL that is emitted to the Output tab of the console

var led_value = 0; 

function showLedState(res){
  if (led_value)
    res.write('LED Ligado');
  else
    res.write('LED Desligado');
}

function showInterface(res){
  res.write('<head><link rel="stylesheet" type="text/css" href="style.css"/><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes" /></head>')
	res.write('<h1>Controle de LED do Intel Galileo</h1>');
  res.write('<div class="onoffswitch"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" onchange="window.open(\'turnLed\' + (this.checked ? \'On\' : \'Off\'), \'iframe\');" id="myonoffswitch" ' + (led_value ? 'checked' : '') + '><label class="onoffswitch-label" for="myonoffswitch"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label></div>');
  res.write('<br><iframe style="border:none;" name="iframe"></iframe>');
  res.end();
}

app.get('/style.css', function(req, res){
  fs.readFile(__dirname + '/style.css', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
});

app.get('/', function(req, res){
	showInterface(res);
});

app.get('/turnLedOn', function (req, res) {
	led_value = 1;
	showLedState(res);
	res.end();
});

app.get('/turnLedOff', function (req, res) {
	led_value = 0;
	showLedState(res);
	res.end();
});

app.get('/getLedValue', function (req, res) {
    res.end(''+led_value); //deve ser string, por isso a concatenação.
});