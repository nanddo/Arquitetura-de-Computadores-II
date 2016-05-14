// reference the http module so we can create a webserver
var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');


http.listen(process.env.PORT, function(){
  console.log('listening on ' + process.env.PORT);
});

// Note: when spawning a server on Cloud9 IDE, 
// listen on the process.env.PORT and process.env.IP environment variables

// Click the 'Run' button at the top to start your server,
// then click the URL that is emitted to the Output tab of the console

var led_value = 0, valor_analogico = 0; 

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
  res.write('<br><iframe style="border:none; height: 20px; overflow: hidden;" name="iframe"></iframe>');
  res.write('<br><iframe src="/potenciometro.html" style="overflow: hidden; border:none; width: 470px; height: 470px;" name="iframe"></iframe>');
  res.end();
}

app.use(express.static(__dirname));
app.use(express.bodyParser());

app.get('/setAnalogic0/:value', function(req, res) {  
  valor_analogico = req.params.value;
  res.end();
});

app.get('/getA0', function(req, res){
  res.end('<script>window.setInterval(function(){window.open(\'getAnalogic0\', \'iframe\');}, 1000);</script><iframe name="iframe" style="border:none;height:30px;width:200px;" src="/getAnalogic0"></iframe>');
});

app.get('/getAnalogic0', function(req, res){
  res.end(''+valor_analogico);
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