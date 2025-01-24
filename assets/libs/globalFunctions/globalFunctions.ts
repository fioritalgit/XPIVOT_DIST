
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment'
import { SAPconnectorService } from '../../../app/services/sapconnector.service'

@Injectable({
  providedIn: 'root'
})
export class GlobalFunctions {
  data = [
    // Your Data Here
  ]
  deviceToken: string;

  constructor(private httpClient: HttpClient,
    private toastController: ToastController) { };

  public async changeStatus(newStatus, order) {
    var callUrl = environment.MOBEE_BASE_STATUS_URL + order;
    var httpHeaders = {
      'content-type': 'application/json',
      authorization: `Bearer ${environment.MOBEE_AUTH_TOKEN}`,
    };

    var callResponse = await fetch(callUrl, {
      method: 'POST',
      headers: httpHeaders,
      body: JSON.stringify({
        "idstatus": parseInt(newStatus)
      })
    });

    if (callResponse.ok == true) {
      return 'OK';
    } else {
      return 'KO';
    }
  }

  public dateFormatter(date = new String) {
    if (date.toString() != "") {
      if (date.toString().indexOf('.') == -1) {
        return date.split('-').reverse().join('/');
      } else {
        if (date.split('.')[0].length != 4) {
          return date.split('.').join('/');
        } else {
          return date.split('.').reverse().join('/');
        }
      }
    }
  }

  public priceFormatter(price) {
    if (price.toString() != "") {
      if (price.toString().indexOf(':') > -1) {
        price = parseFloat(price.split(':')[1].replace(/\s/g, ''));
      }

      const formatter = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
      });

      return formatter.format(parseInt(price));
    }
  }

  public setDeviceToken(token){
    this.deviceToken = token;
  }

  public getDeviceToken(){
    return this.deviceToken;
  }

}


