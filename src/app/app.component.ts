import { Component, Inject } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DOCUMENT } from '@angular/common';


const prefersColorSchemeLight = window.matchMedia(`(prefers-color-scheme: light)`);
const prefersColorSchemeDark = window.matchMedia(`(prefers-color-scheme: dark)`);
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    if(prefersColorSchemeDark.matches) this.setDarkTheme();

    prefersColorSchemeLight.onchange = e => this.setLightTheme();
    prefersColorSchemeDark.onchange = e => this.setDarkTheme()
  }

  setDarkTheme(){
    this.document.body.classList.toggle('dark', true);
  }

  setLightTheme(){
    this.document.body.classList.toggle('dark', false);
  }
}
