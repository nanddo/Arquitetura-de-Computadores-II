/* 
  Escrita e Leitura em Arquivos via system e controle do led (pino 13 arduino) através do pontenciômetro (valor de A0)
  Arquitetura de Computadores II - Aula 05
  Fernando Melo Nascimento
  Fernando Messias dos Santos
*/

int led = 13;

void setup() {
  // Serial initialization
  Serial.begin(9600);
  while (!Serial.available());
  
  // Write text file  
  system ("echo \"texto arquivo\" > myFile");
  readPrintFile ("myFile", 20);
  
  // MUX control
  setMux();
  
  // Set LED to be an output
  pinMode(led, OUTPUT); 
}

void loop() {
  // Record A0 value into a file
  system ("cat /sys/bus/iio/devices/iio\:device0/in_voltage0_raw > otherFile");
  
  // Read A0 value
  int value = readIntFile ("otherFile");
  Serial.println (value);
 
  // LED control
  if (value > 2000) {
    digitalWrite(led, HIGH);
  } else {
    digitalWrite(led, LOW);
  }
  
  // Delay 200ms
  system ("usleep 200000");
}

void readPrintFile (char* fileName, int len) {
  // Variables
  FILE *fp;
  char output[len];
  
  // Opening, reading and closing the file
  fp = fopen (fileName, "r");
  fgets (output, len, fp);
  fclose (fp);
  
  // Print output on serial 
  Serial.println (output);
}

int readIntFile(char* fileName) {
  // Variables
  FILE *fp;
  int value = 0;
  
  // Opening, reading and closing the file
  fp = fopen (fileName, "r");
  fscanf (fp, "%d", &value);
  fclose (fp);
  
  // Return int value
  return (value);
}

void setMux() {
  system ("echo -n \"37\" > /sys/class/gpio/export");
  system ("echo -n \"out\" > /sys/class/gpio/gpio37/direction");
  system ("echo -n \"0\" > /sys/class/gpio/gpio37/value");
}
