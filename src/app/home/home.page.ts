import { Component } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  img: string;
  labels: string[] = [];
  showOtherLabels: boolean;
  operationStage = '';
  error: string;

  constructor(
    private aff: AngularFireFunctions,
    private afs: AngularFireStorage
  ) { }



  async imageUploadEvent(imageInput: HTMLInputElement) {
    this.operationStage = '';
    this.labels = [];
    this.showOtherLabels = false;
    this.error = null;

    const file = imageInput.files.item(0),
      filename = `${new Date().toISOString()}${file.name}`,
      reader = new FileReader();

    reader.onload = async e => {
      this.img = e.target.result as string;

      try {
        this.operationStage = 'Uploading';
        await this.afs.upload(`uploadedImages/${filename}`, file).snapshotChanges().toPromise();
        this.operationStage = 'Analysing';

        this.labels = [...new Set((await this.aff.httpsCallable('genAltText')({ filename }).toPromise())?.map(l => l.description))] as string[];

      } catch (e) {
        console.error(e);
        this.error = 'Something went wrong. Please refresh the page and try again.';
      }

      this.operationStage = '';
      imageInput.value = '';
    }
    reader.readAsDataURL(file);
  }

  setPrimaryLabel(label: string) {
    this.showOtherLabels = false;
    const newOrder = [label];
    for (const l of this.labels) if (l !== label) newOrder.push(l);
    this.labels = newOrder;
  }

}

