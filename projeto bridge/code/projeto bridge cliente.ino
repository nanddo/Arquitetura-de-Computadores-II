/* **********************Descricao********************** */
/* Disciplina: Arquitetura de Computadores II            */
/* Professor: Marco Tulio Chella                         */
/* Projeto: Checagem de Risco em Pontes e Viadutos       */
/* Alunos:                                               */
/*   Fernando Melo Nascimento  {nascimentofm@ufs.br}     */
/*   Fernando Messias dos Santos {fernando@ufs.br}       */
/* Codigo cliente para Intel Galileo Gen1                */
/* Aviso: Este codigo tem fins academicos!               */
/* ***************************************************** */


/* **************Bibliotecas************** */
/* time.h: uso de rand e time(NULL)        */
/* EEPROM.h escrita na EEPROM da Galileo   */
/* *************************************** */
#include <time.h>
#include <EEPROM.h>


/* ******************Constantes***************** */
/* sensor_acelerometer_x: conexao na porta A0    */
/* sensor_acelerometer_y: conexao na porta A1    */
/* sensor_acelerometer_z: conexao na porta A2    */
/* sensor_piezo_knock:    conexao na porta A3    */
/* sensor_temperature:    conexao na porta A4    */
/* url: string com o endereco base do servidor   */
/* ********************************************* */
const int sensor_acelerometer_x = 0;
const int sensor_acelerometer_y = 1;
const int sensor_acelerometer_z = 2;
const int sensor_piezo_knock    = 3;
const int sensor_temperature    = 4;
const char *url = "http://bridges-fernandoxlr.c9.io";


/* **********************Variaveis********************* */
/* id: string com o ID da placa gravado na EEPROM       */
/* cmd: string com comando a ser executado via system   */
/* last_time: tempo da ultima medicao                   */
/* curr_time: tempo da medicao atual                    */
/* limit: struct com os valores limite dos sensores     */
/* **************************************************** */
char id[255];
char cmd[255];
long int last_time = 0;
long int curr_time = 0;

struct Values {
	int acelerometer_x = 0; 
	int acelerometer_y = 0; 
	int acelerometer_z = 0; 
	int piezo_knock    = 0;
	int temperature    = 0;
};

struct Values limit;


/* *************************************SETUP************************************* */
/* Serial.begin(9600): requisicao do Serial                                        */
/* system("/etc/init.d/networking restart"): reinicia o servico de rede            */
/* initializeSensors: seta os pinos com saida (OUTPUT)                             */
/* initializeID: gera um ID para a placa, caso nao haja algum  gravado na EEPROM   */
/* registerDevice: registra a placa no servidor                                    */
/* ******************************************************************************* */
void setup () {
	Serial.begin(9600);
	system("/etc/init.d/networking restart");
	initializeSensors();
	initializeID();
	registerDevice();
}


/* *************************************LOOP************************************* */
/* Serial.begin(9600): requisicao do Serial                                       */
/* system("/etc/init.d/networking restart"): reinicia o servico de rede           */
/* initializeSensors: seta os pinos com saida (OUTPUT)                            */
/* initializeID: gera um ID para a placa, caso nao haja algum  gravado na EEPROM  */
/* registerDevice: registra a placa no servidor                                   */
/* ****************************************************************************** */
void loop () {
	/* Leituras analogicas dos sensores */
	struct Values value;
	value.acelerometer_x = analogRead(sensor_acelerometer_x);
	value.acelerometer_y = analogRead(sensor_acelerometer_y);
	value.acelerometer_z = analogRead(sensor_acelerometer_z);
	value.piezo_knock    = analogRead(sensor_piezo_knock);
	value.temperature    = analogRead(sensor_temperature);

	/* Atualiza a configuracao do servidor a cada hora */
	curr_time = static_cast<long int> (time(NULL));
	if (curr_time - last_time > 3600){
		getServerConfig(true);
	}

	/* Envia os dados pro servidor, caso eles sejam maiores que o limite estipulado */
	if (valuesGreaterThanLimits(value)){
		sprintf (cmd, "wget -qO- %s/sendData/%s/%d/%d/%d/%d/%d > last_config", url, id, acelerometer_x, acelerometer_y, acelerometer_z, temperature, piezoknock);
		getServerConfig(false);
		system (cmd);
	}

	/* Espera 1 segundo ate a proxima leitura*/
	delay (1000);
}


/* *****************************SETUP FUNCTIONS***************************** */
void initializeSensors(){
	pinMode(sensor_acelerometer_x, OUTPUT);
	pinMode(sensor_acelerometer_y, OUTPUT);
	pinMode(sensor_acelerometer_z, OUTPUT);
	pinMode(sensor_piezo_knock, OUTPUT);
	pinMode(sensor_temperature, OUTPUT);
}

void initializeID(){
	int IDsum = 0;
	/* Leitura dos primeiros 255 bytes da EEPROM 
	   Uma leitura retorna 255 caso a posicao nunca tenha sido escrita */
	for (int i=0; i<255; i++) {
		id[i] = EEPROM.read(i);
		IDsum += EEPROM.read(i);
	}
	/* Verifica se a EEPROM ja foi escrita (255 * 255 = 65025) */
	if (IDsum == 65025) {
		randomSeed(time(NULL));
		while(IDsum) {
			for (int i=0; i<255; i++) {
				id[i] = random(256);
			}
			sprintf (cmd, "wget -qO- %s/checkID/%s > checkIDfile", url, id);
			system (cmd);
			/* Checa se o ID ja existe no servidor */
			if (checkID("checkIDfile")) {
				for (int i=0; i<255; i++) {
					EEPROM.write(i,id[i]);
				}
				IDsum = 0;
			}
		}
	}
}

bool checkID (char* checkIDfile) {
	int exists;
	FILE* f = fopen(checkIDfile, "r");
	fscanf (f, "%d", &exists);
	if (exists) {
		return false;
	} else {
		return true;
	}
}

void registerDevice(){
	char cmd[1000];
	sprintf (cmd, "wget -qO- %s/registerDevice/%s", url, id);
	system (cmd);
}


/* *****************************LOOP FUNCTIONS***************************** */
void getServerConfig(bool getFromInternet){
	if (getFromInternet) {
		char cmd[1000];
		sprintf (cmd, "wget -qO- %s/getServerConfig/%s > last_config", url, id);
		system (cmd);
	}
	FILE* f = fopen("last_config", "r");
	fscanf(
		f, "%d %d %d %d %d",
		&limit.acelerometer_x,
		&limit.acelerometer_y,
		&limit.acelerometer_z,
		&limit.piezo_knock,
		&limit.temperature
	);

	last_time = curr_time;
}

bool valuesGreaterThanLimits(struct Values value){
	if (value.acelerometer_x < limit.acelerometer_x) {
		return false;
	} else if (value.acelerometer_y < limit.acelerometer_y) {
		return false;
	} else if (value.acelerometer_z < limit.acelerometer_z) {
		return false;
	} else if (value.temperature < limit.temperature) {
		return false;
	} else if (value.piezo_knock < limit.piezo_knock) {
		return false;
	} else {
		return true;
	}
}