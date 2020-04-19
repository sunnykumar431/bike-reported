import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { fromUnixTime, getUnixTime } from 'date-fns';

export interface CaseDetail {
  title: string;
  description: string;
  address: string;
  stolen_date: Date;
  report_id: number;
  bike_image_thumb: string;
}

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})

export class ReportListComponent implements OnInit {
  displayedColumns: string[] = ['bike_image_thumb', 'title'];
  CASE_DATA: CaseDetail[] = [];
  dataSource = new MatTableDataSource<CaseDetail>(this.CASE_DATA);
  searchForm: FormGroup;
  noDataState: string;
  maxDate: Date;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.maxDate = new Date();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.getReportedIncidents();
    this.searchForm = this.fb.group({
      searchText: [''],
      searchFromDate: [''],
      searchToDate: ['']
    });
  }

  getReportedIncidents() {
    const serchKey = 'page=1&proximity=Delhi&proximity_square=200';
    this.apiService.getIncidents(serchKey)
      .subscribe(response => {
        if (response) {
          this.formCaseReportsData(response);
        } else {
          this.noDataState = 'error';
        }
      });
  }

  onFormSubmit(formData) {
    this.noDataState = null;
    const searchArray = ['page=1', 'proximity=Delhi', '&proximity_square=200'];
    if (formData.searchText) {
      searchArray.push(`query=${formData.searchText}`);
    }
    if (formData.searchFromDate) {
      const getSerchFromUnixtTime = getUnixTime(formData.searchFromDate);
      searchArray.push(`occurred_after=${getSerchFromUnixtTime}`);
    }
    if (formData.searchToDate) {
      const getSerchToUnixtTime = getUnixTime(formData.searchToDate);
      searchArray.push(`occurred_before=${getSerchToUnixtTime}`);
    }
    const searchKey = searchArray.join('&');
    this.apiService.getIncidents(searchKey)
      .subscribe(response => {
        if (response) {
          this.formCaseReportsData(response);
        } else {
          this.noDataState = 'error';
        }
      });
  }

  formCaseReportsData(response) {
    this.CASE_DATA = [];
    this.dataSource = new MatTableDataSource<CaseDetail>(this.CASE_DATA);
    const incidents = response.incidents;
    if (incidents && incidents.length) {
      incidents.forEach(element => {
        const elementObj = {
          title: element.title,
          description: element.description,
          address: element.address,
          report_id: element.id,
          bike_image_thumb: element.media.image_url_thumb ? element.media.image_url_thumb : 'https://10infos.com/wp-content/uploads/2018/12/Best-bikes-under-60000.jpg',
          stolen_date: fromUnixTime(element.occurred_at)
        };
        this.CASE_DATA.push(elementObj);
      });
      this.dataSource.paginator = this.paginator;
    } else {
      if (incidents) {
        this.noDataState = 'noData';
      } else {
        this.noDataState = 'error';
      }
    }
  }

}
