unsigned int i = 0;

void setup() {
  Serial.begin(9600);
  setMux();
}

void loop() {
  if (i > 128) {
    system ("echo -n \"1\" > /sys/class/gpio/gpio39/value")
  } else {
    system ("echo -n \"0\" > /sys/class/gpio/gpio39/value");
  }
  //captura o evento de envio do valor de i
  if (Serial.available()) {
    //recebe o valor inteiro digitado
    i = Serial.parseInt();
    Serial.println(i);
  }
}

void setMux() {
  //controle do mux (gpio55)
  system ("echo -n \"55\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio55/direction");
  system ("echo -n \"strong\" > /sys/class/gpio/gpio55/drive");
  system ("echo -n \"1\" > /sys/class/gpio/gpio55/value");
  //sinal para o pino 13 (gpio39)
  system ("echo -n \"39\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio39/direction");
  system ("echo -n \"strong\" > /sys/class/gpio/gpio39/drive");
}
