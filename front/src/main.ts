import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/modules/root/app.config';
import { AppComponent } from './app/modules/root/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
