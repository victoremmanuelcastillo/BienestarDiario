import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carga-csv',
  templateUrl: './cargaCSV1.component.html',
  styleUrls: ['./cargaCSV1.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CargaCSVComponent {
  columnNames: string[] = [];
  rows: string[][] = [];
  isLoading: boolean = false;
  error: string | null = null;
  fileLoaded: boolean = false;

  onFileSelected(event: Event): void {
    this.isLoading = true;
    this.error = null;
    this.fileLoaded = false;
    this.columnNames = [];
    this.rows = [];
    
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.error = "No se seleccionó ningún archivo";
      this.isLoading = false;
      return;
    }

    const file = input.files[0];
    if (!file.name.endsWith('.csv')) {
      this.error = "Por favor, seleccione un archivo CSV válido";
      this.isLoading = false;
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        
        if (!text || text.trim() === '') {
          throw new Error("El archivo está vacío");
        }
        
        // Dividir por líneas y limpiar
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (lines.length < 2) {
          throw new Error("El archivo no contiene datos suficientes");
        }
        
        // Extraer encabezados (primera línea)
        const headers = lines[0].split(',').map(col => col.trim());
        this.columnNames = headers;
        
        // Procesar filas de datos (resto de líneas)
        this.rows = lines.slice(1)
          .map(line => {
            // Dividir por comas, pero respetando comillas si existen
            const values = line.split(',').map(cell => cell.trim());
            
            // Asegurarse de que cada fila tenga la misma cantidad de columnas
            while (values.length < headers.length) {
              values.push('');
            }
            
            return values;
          });
        
        console.log('CSV cargado correctamente');
        console.log('Columnas:', this.columnNames);
        console.log('Filas:', this.rows.length);
        
        this.fileLoaded = true;
      } catch (error) {
        console.error('Error al procesar el CSV:', error);
        this.error = error instanceof Error ? error.message : "Error al procesar el archivo CSV";
      } finally {
        this.isLoading = false;
      }
    };
    
    reader.onerror = () => {
      console.error('Error al leer el archivo');
      this.error = "Error al leer el archivo";
      this.isLoading = false;
    };
    
    reader.readAsText(file);
  }
}