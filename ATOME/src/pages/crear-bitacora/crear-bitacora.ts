import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Platform, AlertController } from 'ionic-angular';
import {  AngularFireObject , AngularFireList  } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { BluetoothArduinoService } from '../../services/bluetoothArduino/bluetoothArduino.service';

/**
 * Generated class for the CrearBitacoraPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-crear-bitacora',
  templateUrl: 'crear-bitacora.html',
})
export class CrearBitacoraPage {
  lista: string = "";
  tiempo: any;
  altura: any;
  recibido: string = "";
  mensaje: string = "";
  device: any;
  items: Observable<any[]>;
  estadoConexion:string;
  isenabled: boolean;
  isenabled2: boolean;
  public selectedvalue;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private database: AngularFireDatabase,
    public menu: MenuController,
    private bluetooth: BluetoothArduinoService,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {
    this.device = this.navParams.get('deviceConectado');
    console.log('carga estaciones');   
    this.items = database.list('estacion').valueChanges();
    console.log('selecciona');
    console.log(this.selectedvalue);
  }
  ionViewDidEnter() {
    this.device = this.navParams.get('deviceConectado');
    console.log('carga');
    console.log(this.device);
    
    
    this.estadoConexion = "No Conectado";
    this.isenabled =false;
  }
  menu1Active() {
    this.menu.enable(true, 'menu1');
  }
  onChange(){
  console.log('selecciona');
  console.log(this.selectedvalue);
}

conectar(seleccion){
  
    this.bluetooth.bluetoothSerial.isConnected().then(
      isConnected => {
        let alert = this.alertCtrl.create({
          title: 'Reconectar',
          message: '¿Desea reconectar a este dispositivo?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: () => {
                this.bluetooth.desconectar();
                this.bluetooth.conectar(seleccion.id).then(success => {
                  
                  this.bluetooth.presentToast(success);
                }, fail => {
                  this.bluetooth.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
      }, notConnected => {
        let alert = this.alertCtrl.create({
          title: 'Conectar',
          message: '¿Desea conectar el dispositivo?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: () => {
                this.bluetooth.conectar(seleccion.id).then(success => {
                  this.bluetooth.presentToast(success);
                  this.estadoConexion = "conectada";
                  this.isenabled = true;
                  this.mensaje = "2";
                  this.enviarMensajes();

                }, fail => {
                  this.bluetooth.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
    });

   // this.isenabled = true;
  }

  enviarMensajes() {
    this.bluetooth.conexionMensajes = this.bluetooth.dataInOut(this.mensaje).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      if (entrada != ">") {
        if (entrada != "") {
          this.recibido = entrada;
          if(entrada.substr(0,2)==="a:"){
            this.isenabled2 = true;
            this.lista = "PRACTICA LISTA"
            this.altura = entrada.substr(2,entrada.length - 1);
            //this.altura = entrada.length;
          }else if(entrada.substr(0,2)==="t:"){
            this.isenabled2 = true;
            this.lista = "PRACTICA LISTA"
            this.tiempo = entrada.substr(2,entrada.length - 1);
          }else if(entrada==="PRACTICA NO LISTA"){
            this.lista = entrada;
            this.isenabled2 = false;
          }
          
          console.log(`Entrada: ${entrada}`);
          this.bluetooth.presentToast(entrada);
        }
      } else {
        this.bluetooth.conexionMensajes.unsubscribe();
      }
      this.mensaje = "";
      //this.recibido = "";
    });
  }

  desconectar(){
    this.bluetooth.desconectar();
    this.isenabled = false;
  }

iniciarPractica(){
  console.log('inicia la practica');
  this.mensaje = "1"
  this.enviarMensajes();
}
pedirAltura(){
  this.mensaje = "2"
  this.enviarMensajes();
}

  ionViewDidLoad() {
  }

}
