/* 
  Escrita e Leitura em Arquivos via system 
  Arquitetura de Computadores II - Aula 05
  Fernando Melo Nascimento
  Fernando Messias dos Santos
*/

// Biblioteca para inicialização do cartão SD
#include <SD.h> 

int value = 0;

void setup() {
  // Inicialização do Serial
  Serial.begin(9600);
  //Inicialização do cartão SD
  initSDCard(); 
  // Controle do MUX
  setMux();
}

void loop() {
  system ("cat /sys/bus/iio/devices/iio\:device0/in_voltage0_raw > /media/realroot/sensor.txt");
  system ("sleep 1");
  
  int digits = 0;
  char atoii[255];
  /*
  File arq = SD.open("sensor.txt");
  
  while ((digits < 1) && (arq.available()))
    atoii[digits++] = arq.read();
  
  atoii[digits] = '\0';
  value = atoi(atoii);

  if (arq) Serial.println("li");
  else Serial.println("nao li");
  
  Serial.println(atoii);
  */
  Serial.println (system("cat /media/realroot/sensor.txt > /dev/ttyGS0"));
  //system (ls /media/realroot > /dev/ttyGS0);
}
 
void initSDCard(){
  SD.begin();
}

void setMux() {
  system ("echo -n \"37\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio37/direction");
  system ("echo -n \"0\" > /sys/class/gpio/gpio37/value");
}

