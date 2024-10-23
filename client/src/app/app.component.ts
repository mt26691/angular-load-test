import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';

@Component({
  selector: 'app-root',
  template: `<app-file-uploader></app-file-uploader>`, // Use the FileUploaderComponent here
  standalone: true, // Mark this component as standalone
  imports: [FileUploaderComponent], // Import the FileUploaderComponent
})
export class AppComponent {
  title = 'videoUploaderApp';
}
