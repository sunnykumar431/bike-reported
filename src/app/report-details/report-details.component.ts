import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { fromUnixTime } from 'date-fns';


export interface CaseDetail {
  title: string;
  description: string;
  address: string;
  stolen_date: Date;
  reported_date: Date;
  bike_image: string;
}

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit {
  caseDetails: CaseDetail;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  center = { lat: 28.7040592, lng: 77.1024902 };
  markerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 9;
  display?: google.maps.LatLngLiteral;
  errorState: boolean;

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const reportId = +params.get('productId');
      this.getReportedIncidents(reportId);
    });
  }

  getReportedIncidents(reportId) {
    this.apiService.getIncidentDetails(reportId)
      .subscribe(response => {
        if (response && response.incident) {
          const incidentObj = response.incident;
          this.caseDetails = {
            title: incidentObj.title,
            description: incidentObj.description,
            address: incidentObj.address,
            stolen_date: fromUnixTime(incidentObj.occurred_at),
            reported_date: fromUnixTime(incidentObj.updated_at),
            bike_image: incidentObj.media.image_url ? incidentObj.media.image_url : 'https://10infos.com/wp-content/uploads/2018/12/Best-bikes-under-60000.jpg'
          };
          this.drawAddressOnMap(incidentObj.address);
        } else {
          this.errorState = true;
        }
      });
  }

  drawAddressOnMap(address) {
    this.apiService.getAddressGeoCoding(address)
      .subscribe(response => {
        if (response && response.results && response.results.length) {
          const results = response.results[0];
          if (results.geometry && results.geometry.location) {
            const postionObj = { lat: results.geometry.location.lat, lng: results.geometry.location.lng };
            this.markerPositions.push(postionObj);
          }
        }
      });
  }

}
