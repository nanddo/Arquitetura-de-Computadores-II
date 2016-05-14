int turn_on = 0;
int aux_A0;
char value_A0[1000];

void setup () {
  Serial.begin(9600);
  system("/etc/init.d/networking restart");
  setLedPin();
  setMuxA0();
}

void loop () {
  controlLed ();
  sendA0ToServer ();
}

void controlLed () {
  system ("wget -qO- http://arquitetura-fernandoxlr.c9.io/getLedValue > myFile");
  turn_on = readIntFile ("myFile");
  
  if (turn_on) {
    system ("echo -n \"1\" > /sys/class/gpio/gpio3/value");
  } else {
    system ("echo -n \"0\" > /sys/class/gpio/gpio3/value");
  }
  
  //Serial.println (turn_on);
  //system ("sleep 1");
}

void sendA0ToServer () {
  system ("cat /sys/bus/iio/devices/iio\:device0/in_voltage0_raw > otherFile");

  aux_A0 = readIntFile ("otherFile");
  
  sprintf (value_A0, "wget -qO- http://arquitetura-fernandoxlr.c9.io/setAnalogic0/%d > myFile", aux_A0);

  system (value_A0);
}

void setLedPin () {
  system ("echo -n \"3\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio3/direction");
  system ("echo -n \"strong\" > /sys/class/gpio/gpio3/drive");
}

void setMuxA0 () {
  system ("echo -n \"37\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio37/direction");
  system ("echo -n \"0\" > /sys/class/gpio/gpio37/value");
}

int readIntFile (char* fileName) {
  FILE *fp;
  int value = 0;

  fp = fopen (fileName, "r");
  fscanf (fp, "%d", &value);
  fclose (fp);

  return (value);
}
