import { Component,ViewChild,ElementRef, NgZone, OnInit } from '@angular/core';
import { NavController, IonicPage, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operators';
import { Storage } from '@ionic/storage';

declare var google;
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  lat: any;
  long: any;
  start: any;
  end: any;
  currentMapTrack = null;
  positionSubscription: Subscription;
  isTracking = false;
  trackedRoute = [];
  previousTracks = [];
  distance: any;
  duration: any;
  //autocomplete: any;
  x: any;
  y: any;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;
  @ViewChild('searchaddress') searchElement: ElementRef;
  map: any;
  directionmap: any;
  constructor(public navCtrl: NavController, public geolocation: Geolocation, private plt: Platform, private storage: Storage, public zone: NgZone) {
  }

  ngOnInit() {
    console.log("In init");
    this.loadMap();
    this.googleautocomplete();
  }

  googleautocomplete() {
    var autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement);
    autocomplete.addListener('place_changed', () => {
      this.zone.run(() => {
        var place = autocomplete.getPlace();
        console.log("placesss =" + place);
        this.end = place.formatted_address;
        console.log("value of end =" + this.end);
        return
      });
    });
  }

  loadMap() {
    console.log("google.map");
    ///fetch current location 
    this.geolocation.getCurrentPosition().then((position) => {
      this.lat = position.coords.latitude;
      this.long = position.coords.longitude;
      //geocoder to covert latlong to address
      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(this.lat, this.long);
      console.log("fetch current location" + latlng);
      let request = {
        latLng: latlng
      }
      let self = this;
      geocoder.geocode(request, function (results, ) {
        let address = results[0].formatted_address;
        console.log("address =" + address);
        self.start = address;
      });
        
      let mapOptions = {
        center: latlng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
           
      let marker = new google.maps.Marker({
        map: this.map,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png'),
        animation: google.maps.Animation.static,
        position: latlng
      });
    })
  }

  claculatedirection() {
    console.log("start navi" + this.end);
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    //var map=this.map
    this.directionmap = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
    });
    directionsDisplay.setMap(this.directionmap);
    let self = this
    directionsService.route({
      origin: self.start,
      destination: self.end,
      travelMode: 'DRIVING'
    }, function (response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        self.distance = response.routes[0].legs[0].distance.text;
        self.duration = response.routes[0].legs[0].duration.text;
        console.log("route detais" + self.distance);
        console.log("route detais" + self.duration);
      }
    });
  }
  
  currentlocation() {
    this.geolocation.getCurrentPosition().then((position) => {
      this.lat = position.coords.latitude;
      this.long = position.coords.longitude;
      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(this.lat, this.long);
      let request = {
        latLng: latlng
      };
      let self = this;
      geocoder.geocode(request, function (results, status) {
        let address = results[0].formatted_address;
        console.log('add' + address);
        self.start = address;
      });
      let mapOptions = {
        center: latlng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.static,
        position: latlng
      });
    },
      (error) => {
        console.log("Geolocation Error : ", error);
      });
  }


  stopTracking() {
    this.isTracking = false;
    this.positionSubscription.unsubscribe();
  }
  
  startTracking() {
    this.isTracking = true;
    this.positionSubscription = this.geolocation.watchPosition().subscribe((position) => {
      let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latlng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      let self = this
      let marker = new google.maps.Marker({
        map: self.directionmap,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png'),
        position: latlng
      });
      console.log("watch direction" + latlng);
      this.directionchange(position.coords.latitude, position.coords.longitude)
    }, (err) => {
      console.log(err);
    });
  }

  
  directionchange(lat, long) {
    console.log("start location change" + lat + ' ' + long);
    let latlng = new google.maps.LatLng(lat, long);
    var starts = latlng;
    console.log("start location change" + starts);
    var directionsService = new google.maps.DirectionsService;
    let self = this
    directionsService.route({
      origin: starts,
      destination: self.end,
      travelMode: 'DRIVING'
    }, function (response, status) {
      if (status === 'OK') {
        //directionsDisplay.setDirections(response);
        self.distance = response.routes[0].legs[0].distance.text;
        self.duration = response.routes[0].legs[0].duration.text;
        console.log("route detais" + self.distance);
        console.log("route detais" + self.duration);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }
}