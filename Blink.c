// Utilizamos o pino 13 como o controle do LED
int led = 13;

// No setup colocamos tudo que deve ser rodado no início, sem repetição
void setup() {
  pinMode(led, OUTPUT); // O pino do LED é configurado como saída
}

// No Loop colocamos todo o resto - o que vai ser executado indefinidamente
void loop() {
  digitalWrite(led, HIGH); // Liga o LED
  delay(1000);             // Espera 1 segundo (1000 milisegundos)
  digitalWrite(led, LOW);  // Desliga o LED
  delay(1000);             // Espera 1 segundo (1000 milisegundos)
}
