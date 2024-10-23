import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environment/environment';

interface UploadedFile {
  jobId: string;
  name: string;
  createdTime: Date;
  duration: number;
  width: number;
  height: number;
  convertedFilePath: string;
  status: string;
  reason?: string;
}

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css'],
  standalone: true,
  imports: [HttpClientModule, MatSnackBarModule, CommonModule],
})
export class FileUploaderComponent implements OnInit, OnDestroy {
  files: UploadedFile[] = [];
  paginatedFiles: UploadedFile[] = [];
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  private intervalId: any;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchFiles(); // Fetch files on component initialization

    // Set up an interval to fetch files every 5 seconds
    this.intervalId = setInterval(() => {
      this.fetchFiles();
    }, 5000);
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    this.handleFile(file ?? null);
  }

  handleFile(file: File | null) {
    if (file && file.type === 'video/mp4') {
      console.log('MP4 file uploaded:', file);
      this.uploadFile(file);
    } else {
      this.showErrorToast();
    }
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Make an HTTP POST request to upload the file
    this.http.post('http://localhost:3000/v1/convert', formData).subscribe({
      next: (response) => {
        console.log('File uploaded successfully', response);
        this.snackBar.open('File uploaded successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-toast'],
        });
        this.fetchFiles(); // Refresh files after a successful upload
      },
      error: (error) => {
        console.error('Error uploading file', error);
        this.snackBar.open('Error uploading file', 'Close', {
          duration: 3000,
          panelClass: ['error-toast'],
        });
      },
    });
  }

  fetchFiles() {
    this.http.get<any[]>(`${environment.API_URL}/json/files`).subscribe({
      next: (data) => {
        // Convert the data from the API to match the UploadedFile format
        this.files = data
          .sort((a, b) => b.jobId - a.jobId)
          .map((file) => ({
            jobId: file.jobId,
            name: this.extractFileName(file.filePath),
            createdTime: new Date(file.createdTime),
            duration: file.duration,
            width: file.width,
            height: file.height,
            reason: file.reason || '', // Include the failure reason if present,
            convertedFilePath: `${environment.API_URL}/${file.convertedFilePath}`, // Use API_URL from environment
            status: file.status,
          }));

        console.log(this.files);
        this.totalPages = Math.ceil(this.files.length / this.pageSize);
        this.paginateFiles();
      },
      error: (error) => {
        console.error('Error fetching files', error);
        this.snackBar.open('Error fetching files', 'Close', {
          duration: 3000,
          panelClass: ['error-toast'],
        });
      },
    });
  }

  extractFileName(filePath: string): string {
    return filePath.split('/').pop() || 'Unknown';
  }

  paginateFiles() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedFiles = this.files.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateFiles();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateFiles();
    }
  }

  showErrorToast() {
    this.snackBar.open('Only MP4 files are allowed', 'Close', {
      duration: 3000,
      panelClass: ['error-toast'],
    });
  }
}
