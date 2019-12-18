import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreTaskModule } from 'projects/core-task/src/lib/core-task.module';




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
CoreTaskModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
