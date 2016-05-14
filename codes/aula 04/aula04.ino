/* 
  Entrada Analógica
  Arquitetura de Computadores II - Aula 04
  Fernando Melo Nascimento
  Fernando Messias dos Santos
*/

void setup() {
  Serial.begin(9600);
  //controle do mux (gpio37)
  system ("echo -n \"37\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio37/direction");
  system ("echo -n \"0\" > /sys/class/gpio/gpio37/value");
}

void loop() {
  Serial.println (system ("cat /sys/bus/iio/devices/iio\:device0/in_voltage0_raw >/dev/ttyGS0"));
  system ("sleep 1");
}
