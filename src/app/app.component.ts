import { Component, Inject, Injector, ApplicationRef } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DOCUMENT } from '@angular/common';

import { Plugins } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { SwUpdate } from '@angular/service-worker';

import { tap, map, first } from 'rxjs/operators';
import { interval, concat } from 'rxjs';

const { Network } = Plugins;


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
    private updates: SwUpdate,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.initializeApp();
  }

  updateAvailable: boolean;
  network: {
    connected: boolean;
    connectionType: string;
  };
  private updateAvailable$ = this.updates.available.pipe(
    map(ev => ev.type === 'UPDATE_AVAILABLE'),
    tap(async available => {
      if (available) {
        this.updateAvailable = true;
        await this.updates.activateUpdate();
        const alert = await this.injector.get(AlertController).create({
          header: 'Update Ready!',
          message: 'A new version of Alt This has been installed. Hit OK to use it.',
          backdropDismiss: false,
          buttons: [
            { text: 'OK', handler: () => window.location.reload() },
            'Cancel'
          ]
        });
        alert.present();
      }
    })
  );

  async initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    if (prefersColorSchemeDark.matches) this.setDarkTheme();

    prefersColorSchemeLight.onchange = e => this.setLightTheme();
    prefersColorSchemeDark.onchange = e => this.setDarkTheme();


    this.network = await Network.getStatus();
    Network.addListener('networkStatusChange', status => {
      this.network = status;
      console.warn('Network Status Changed:', status);
    });

    if (environment.production) {
      this.updateAvailable$.subscribe();
      const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
      everySixHoursOnceAppIsStable$.subscribe(() => this.updates.checkForUpdate());
    }
  }

  setDarkTheme() {
    this.document.body.classList.toggle('dark', true);
  }

  setLightTheme() {
    this.document.body.classList.toggle('dark', false);
  }
}
