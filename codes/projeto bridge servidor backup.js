/* **********************Descricao********************** */
/* Disciplina: Arquitetura de Computadores II            */
/* Professor: Marco Tulio Chella                         */
/* Projeto: Checagem de Risco em Pontes e Viadutos       */
/* Alunos:                                               */
/*   Fernando Melo Nascimento  {nascimentofm@ufs.br}     */
/*   Fernando Messias dos Santos {fernando@ufs.br}       */
/* Codigo servidor NodeJS utilizando Cloud9              */
/* Aviso: Este codigo tem fins academicos!               */
/* ***************************************************** */

/* *********************Requisicoes********************* */
/* express:                                              */
/* http:                                                 */
/* ***************************************************** */
var express = require('express');
var app = express();
var http = require('http').Server(app);
//var fs = require('fs');
//var path    = require("path");


/* ********************* ????? ********************* */
/*                                                   */
/*                                                   */
/* ************************************************* */
app.set('views', __dirname + '/public');
app.use(express.bodyParser());
app.use(express.cookieParser());
//app.use(express.static(__dirname));
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


http.listen(process.env.PORT, function() {
  console.log('listening on ' + process.env.PORT);
});


/* ***********************Banco de Dados*********************** */
/* Mongoose: modelagem de objetos do MongoDB feita para NodeJS  */
/* mongoose.connect: cria uma conexao local                     */
/* db: criacao do banco de dados                                */
/* ************************************************************ */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {});


/* ************************Tabela (Schema)************************ */
/* BrigdeSchema: tabela de dados das pontes e viadutos com ID,     */
/*               valores dos sensores e data de insercao no banco  */
/* Bridge: conversao de schema para model para acessar os dados    */
/* bridge: variavel para acesso a tabela de pontes e viadutos      */
/* *************************************************************** */
var BrigdeSchema = mongoose.Schema({
  id: String,
  acelerometerX: Number,
  acelerometerY: Number,
  acelerometerZ: Number,
  temperature:   Number,
  piezoknock:    Number,
  date: { type: Date, default: Date.now }
});
var Bridge = mongoose.model('Bridge', BrigdeSchema);
var bridge;


/* *****************************Tabela (Schema)***************************** */
/* DevicesSchema: tabela de dados das placas com ID da placa e do usuario,   */
/*                nome do usuario, valores limite dos sensores               */
/*                e data de insercao no banco                                */
/* Device: conversao de schema para model para acessar os dados              */
/* device: variavel para acesso a tabela com os dados das placas registradas */
/* ************************************************************************* */
var DevicesSchema = mongoose.Schema({
  id:   { type: String, unique: true },
  user_id: String,
  name: { type: String, default: "Nome a definir" },
  limit_acelerometerX: { type: Number, default: 0 },
  limit_acelerometerY: { type: Number, default: 0 },
  limit_acelerometerZ: { type: Number, default: 0 },
  limit_temperature:   { type: Number, default: 0 },
  limit_piezoknock:    { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});
var Device = mongoose.model('Device', DevicesSchema);
var device;


/* ***************************Tabela (Schema)*************************** */
/* UserSchema: tabela de dados dos usuarios com nome do usuario, e-mail, */
/*             url da foto, senha e data de insercao no banco            */
/* User: conversao de schema para model para acessar os dados            */
/* user: variavel para acesso a tabela com os dados dos usuarios         */
/* ********************************************************************* */
var UserSchema = mongoose.Schema({
  name: String,
  email: String,
  photo_url: String,
  password: String,
  date: { type: Date, default: Date.now }
});
var UserDB = mongoose.model('UserDB', UserSchema);
var user;


/* *******************Galileo (Arduino)******************* */
/* Descricao: variaveis utilizadas no codigo das placas    */
/* variaveis_treshold: valores limites de cada sensor      */
/* outras variaveis: valores de cada cada sensor           */
/* ******************************************************* */
var acelerometerX_threshold = 100;
var acelerometerY_threshold = 100;
var acelerometerZ_threshold = 100;
var temperature_threshold   = 100;
var piezoknock_threshold    = 100;

var acelerometerX = 0;
var acelerometerY = 0;
var acelerometerZ = 0;
var temperature   = 0;
var piezoknock    = 0;
var id = "default_id";


/* *******************Interface do Usuario******************* */
/*                                                            */
/* ********************************************************** */
function auth(req, res, func){
  var _id = req.cookies.user;
    if (_id != null && _id != ''){
    UserDB.findOne({_id: _id}, 'name email photo_url', function(err, data){
      if (err) {
        res.clearCookie('user');
        res.end(err);
        return false;
      } else {
        if (data != null){
          if (data.photo_url == null || data.photo_url == '') data.photo_url = 'https://www.drupal.org/files/profile_default.jpg';
          func(data);
          return true;
        } else {
          res.clearCookie('user');
          res.redirect('/account/login');
          return false;
        }
      }
    });
  } else {
    res.redirect('/account/login');
    return false;
  }
}

function logged(req, res){
  if (!req.cookies.user){
    res.redirect('/account/login');
    return false;
  } else return true;
}

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/account/login', function(req, res){
  if (!req.cookies.user) {
    res.render('login.ejs');
  }
  else {
    UserDB.findOne({_id: req.cookies.user}, {}, function(err, data) {
      if (err) {
        res.clearCookie('user');
        res.render('login.ejs');
      } else {
        if (data == null){
          res.clearCookie('user');
          res.render('login.ejs');
        } else {
          res.render('/devices');     
        }
      }
    });
  }
});

app.get('/devices', function(req, res){
  auth(req, res, function(user){
    Device.find({user_id: user.id}, {}, function(err, device) {
      if (err) {
        res.end(err);
      } else {
        res.render('home.ejs', {user: user, devices: device});
      }
    });
  });
});

app.get('/account/profile', function(req, res) {
  auth(req, res, function(data){
    res.render('profile.ejs', {user: data});
  });
})

app.get('/account/logout', function(req, res) {
  res.clearCookie('user');
  res.redirect('/account/login');
});

app.get('/account/register', function(req, res){
  res.render('register.ejs');
});

app.post('/account/register', function(req, res){
  var name = req.body.name + '';
  var email = req.body.email + '';
  var pass = req.body.pass + '';
  
  console.log('Vai registrar: ' + name + ', ' + email + ', ' + pass);
  
  var data = {
    name: name,
    email: email,
    password: pass
  };
  
  user = new UserDB(data);

  user.save(function(err, data) {
    if (err) {
      res.end(err);
    } else {
      res.end(data);
      //aqui, na hora do registro quero fazer login e redirecionar.
    }
  });
  
  res.send('Usuário cadastrado');
});

app.get('/devices/add', function(req, res) {
    auth(req, res, function(user){
        res.render('add_device.ejs', {user: user, title: 'Adicionar dispositivo'});
    });
});

app.get('/devices/:id', function(req, res) {
  auth(req, res, function(data){
    var id = req.params.id;
    Device.findOne({id: id}, function(err, device){
      if (err) res.end(err);
      else {
        if (device != null){
          var name = device.name;
          Bridge.find({id: id}, {}, {sort: {date: -1}}, function(err, bridge) {
            if (err) {
              res.end(err);
            } else {
              res.render('device.ejs', {user: data, bridges: bridge, title: name, device: device});
            }
          });
        } else {
          res.send('Nenhum dispositivo encontrado com o id ' + id);
        }
      }
    });
  });
});

app.get('/devices/grafico/:id', function(req, res) {
  auth(req, res, function(data){
    var id = req.params.id;
    Device.findOne({id: id}, 'name', function(err, device){
      if (device != null){
        var name = device.name;
        res.render('grafico.ejs', {id: id, name: name});
      } else res.redirect('back');
    });
  });
});

//API DA INTERFACE
app.post('/api/login', function(req, res){
  var user = req.body.user;
  var pass = req.body.pass;
  
  UserDB.findOne({email: user, password: pass}, '_id', function(err, data){
    if (err){
      res.send('0');
    } else {
      if (data != null){
        console.log('Usuário logado: ' + data._id);
        res.cookie('user', data._id, { maxAge: 9000000, httpOnly: true });
        res.send('1');
      } else 
        res.send('0');
    }
  });
});

app.post('/api/renameDevice', function(req, res) {
  var id = req.body.id;
  var name = req.body.name;
  Device.update({id: id}, {name: name}).exec();
  res.end();
});

app.post('/api/setLimits', function(req, res){
  var id = req.body.id, ax = req.body.ax, ay = req.body.ay, az = req.body.az, t = req.body.t, p = req.body.p;
  if (id && ax && ay && az && t && p){
    Device.update({id: id}, {
      limit_acelerometerX: ax,
      limit_acelerometerY: ay,
      limit_acelerometerZ: az,
      limit_temperature: t,
      limit_piezoknock: p
    }).exec();
  }
  res.end();
});

app.post('/api/add_device', function(req, res) {
   var user_id = req.body.user_id, device_id = req.body.device_id;
   
   Device.findOne({id: device_id}).exec(function(err, device){
      if (err) res.end(err);
      else {
          if (device != null){
              Device.update({id: device_id}, {user_id: user_id}).exec(function(err, dev){
                res.send('Ponte adicionada à sua conta com sucesso');
              });
          } else {
              res.send('Erro: O identificador da ponte não é válido!');
          }
      }
   });
});

app.get('/getData/:id', function(req, res) {
  var id = req.params.id;
  Bridge.findOne({id: id}).sort({date: -1}).exec(function(err, doc){
    if (err) res.send(err);
    else {
      if (doc == null) res.send('0,0,0'); else
      res.send(doc.acelerometerX + ',' + doc.temperature + ',' + doc.piezoknock);
    }
  }); 
});

function getServerConfig(device_id, res){
  Device.findOne({id: device_id}).sort({date: -1}).exec(function(err, device){
  //Device.find({id: device_id}, 'limit_acelerometerX limit_acelerometerY limit_acelerometerZ limit_temperature limit_piezoknock', {sort: {date: -1}}, function(err, device) {
    if (err) {
      res.end(err);
    } else {
      if (device == null) 
        res.send('1 1 1 1 1')
      else
        res.send(device.limit_acelerometerX + ' ' + device.limit_acelerometerY + ' ' + device.limit_acelerometerZ + ' ' + device.limit_piezoknock + ' ' + device.limit_temperature);
    }
  });
}


/* *******************Funcoes Referentes as Pontes e Viadutos******************* */
/* sendData: envio dos valores dos sensores por uma placa juntamente com o ID    */
/* getServerConfig: envia a configuracao atual do servidor para a placa          */
/* ***************************************************************************** */
app.get('/sendData/:id/:acelerometerX/:acelerometerY/:acelerometerZ/:temperature/:piezoknock', function(req, res) {
  id = req.params.id;
  acelerometerX = Number(req.params.acelerometerX);
  acelerometerY = Number(req.params.acelerometerY);
  acelerometerZ = Number(req.params.acelerometerZ);
  temperature   = Number(req.params.temperature);
  piezoknock    = Number(req.params.piezoknock);

  var data = {
    id: id,
    acelerometerX: acelerometerX,
    acelerometerY: acelerometerY,
    acelerometerZ: acelerometerZ,
    temperature: temperature,
    piezoknock: piezoknock
  };
  bridge = new Bridge(data);

  bridge.save(function(err, data) {
    if (err) {
      res.end(err);
    } else {
      getServerConfig(id, res);
      //res.send(data);
    }
  });
});

app.get('/getServerConfig/:id', function(req, res) {
    getServerConfig(req.params.id, res);
})


/* ****************Funcoes Referentes as Placas**************** */
/* registerDevice: registra o ID da placa na tabela de placas   */
/* checkID: checa se o ID enviado ja existe na tabela de placas */
/* ************************************************************ */
app.get('/registerDevice/:id', function(req, res) {
  id = req.params.id;
  var data = { id: id };
  device = new Device(data);

  device.save(function(err, data) {
    if (err) {
      res.end(err);
    } else {
      res.end(data);
    }
  });

  res.send('ID recebido!\n');
});

app.get('/checkID/:id', function(req, res) {
  id = req.params.id;
  Device.count({ id: id }, function(err, count) {
    res.send(''+count);
  });
});


/* ***********************Funcoes de Debug*********************** */
/* debugGetLastData: imprime os valores do acelerometro na tela   */
/* debugGetBridgesData: lista todo o conteudo da tabela de pontes */
/* debugGetDevicesData: lista todo o conteudo da tabela de placas */
/* debugRemoveBridgesData: remove a base de dados das pontes      */
/* debugRemoveDevicesData: remove a base de dados das placas      */
/* debugRemoveUserData: remove a base de dados dos usuarios       */
/* ************************************************************** */
app.get('/debugGetLastData', function(req, res) {
  res.send(acelerometerX + ',' + acelerometerY + ',' + acelerometerZ);
});

app.get('/debugGetBridgesData', function(req, res) {
  Bridge.find({}, {}, function(err, bridge) {
    if (err) {
      res.end(err);
    } else {
      res.send(bridge);
    }
  });
});

app.get('/debugGetDevicesData', function(req, res) {
  Device.find({}, {}, function(err, device) {
    if (err) {
      res.end(err);
    } else {
      res.send(device);
    }
  });
});

app.get('/debugRemoveBridgesData', function(req, res) {
  Bridge.remove({}, function(err) {
    if (err) {
      res.end(err);
    } else {
      res.send('Base de Bridges Removida!\n');
    }
  });
});

app.get('/debugRemoveDevicesData', function(req, res) {
  Device.remove({}, function(err) {
    if (err) {
      res.end(err);
    } else {
      res.send('Base de Devices Removida!\n');
    }
  });
});

app.get('/debugRemoveUserData', function(req, res) {
  UserDB.remove({}, function(err) {
    if (err) {
      res.end(err);
    } else {
      res.send('Base de usuários removida!\n');
    }
  });
});


/* **********Captura de urls nao listadas acima********** */
app.get('/*', function(req, res){
  if (logged(req, res)) res.redirect('/devices');
});