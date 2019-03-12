import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GridDataResult, PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Song } from './model';
import { process, State } from '@progress/kendo-data-query';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { ChartComponent } from '@progress/kendo-angular-charts';
import { saveAs } from '@progress/kendo-file-saver';


   @Component({
       selector: 'app-grid',
       templateUrl: './grid.component.html',
       styleUrls: ['./grid.component.css']
   })
   export class GridComponent {
        @ViewChild('chart')
        private chart: ChartComponent; 
        formGroup: FormGroup;
        private editedRowIndex: number;
        show = false;
        response: any=[];
        res: any=[];
        gridData: GridDataResult;
        pageSize = 15;
        pageSizes = true;
        skip = 0;
        allowUnsort = true;
        sort: SortDescriptor[] = [];
        private data: Object;
        filter: any;
        state: any;
        api_key = "AIzaSyDXAz0m9Fp7wSIu2ANrRxGJjaoQNcEhkkU";
        utube = "https://www.googleapis.com/youtube/v3/";
        opened = false;
        iframeUrl = '';
        result;
        
        count={"popCount":0, "rockCount":0,"slowCount":0, "countryCount":0, "edmCount":0, "hiphopCount":0, "rapCount":0, "folkCount":0, "jazzCount":0, "rnbCount":0};
        pieData;
        genre: Array<string> = ["Pop", "Rock",  "Country",  "EDM",  "Hip Hop",  "Rap",  "Folk",  "Jazz",  "R&B",  "Slow"];

       constructor(public http: HttpClient,public element: ElementRef, private dialogService: DialogService) {}

       ngOnInit() {
        this.count={"popCount":0, "rockCount":0,"slowCount":0, "countryCount":0, "edmCount":0, "hiphopCount":0, "rapCount":0, "folkCount":0, "jazzCount":0, "rnbCount":0};
        let obs=this.http.get('https://webhooks.mongodb-stitch.com/api/client/v2.0/app/app-adplz/service/http/incoming_webhook/get');
        obs.subscribe((response)=> {
          this.response= response;
          for(let i in Array.from(this.response)){
            this.response[i].rating=(parseFloat(response[i].rating));
            let k=response[i].genre;
            if(k==='Pop')this.count.popCount++;
            else if(k==='Rock')this.count.rockCount++;
            else if(k==='Country') this.count.countryCount++;
            else if(k==='EDM') this.count.edmCount++;
            else if(k==='Hip Hop') this.count.hiphopCount++;
            else if(k==='Rap') this.count.rapCount++;
            else if(k==='Folk') this.count.folkCount++;
            else if(k==='Jazz') this.count.jazzCount++;
            else if(k==='R&B') this.count.rnbCount++;
            else if(k==='Slow') this.count.slowCount++;
          }
          this.show = true;
          this.loadItems();
          this.pieData=[{category:'Pop', value: this.count.popCount },
          {category:'Rock', value: this.count.rockCount },
          {category:'Country', value: this.count.countryCount },
          {category:'EDM', value: this.count.edmCount },
          {category:'Hip Hop', value: this.count.hiphopCount },
          {category:'Rap', value: this.count.rapCount },
          {category:'Folk', value: this.count.folkCount },
          {category:'Jazz', value: this.count.jazzCount },
          {category:'R&B', value: this.count.rnbCount },
          {category:'Slow', value: this.count.slowCount }];
          
        })
      }

      exportChart(): void {
        this.chart.exportImage({
          width: 1200,
          height: 800
        }).then((dataURI) => {
          saveAs(dataURI, 'pie-chart.png');
        });
      }
    

      allData = (): ExcelExportData => {
        const result: ExcelExportData =  {
            data: process(this.response, { sort: [{ field: 'song', dir: 'asc' }] }).data,
        };
        return result;
      }

      sortChange(sort: SortDescriptor[]): void {
        this.sort = sort;
        this.loadItems();
      }

      dataStateChange(event: DataStateChangeEvent): void {
        this.skip = event.skip;
        this.sort=event.sort;
        this.filter=event.filter;
        this.loadItems();
    }
      
      pageChange({skip, take}: PageChangeEvent): void {
        this.skip = skip;
        this.pageSize= take;
        this.loadItems();
    }
    
    loadItems(): void {
      this.gridData = process(this.response, {
            skip: this.skip,
            take:this.pageSize,
            sort:this.sort,
            filter:this.filter
          });
      }
    



       public addHandler({sender}) {
           this.closeEditor(sender);
          

           this.formGroup = new FormGroup({
               'song': new FormControl("", Validators.compose([Validators.required, Validators.pattern( "[a-zA-Z0-9!@#\$%\^\&*\'][a-zA-Z0-9!@#\$%\^\&*\' ]*")])),
               'artist': new FormControl("",Validators.compose([Validators.required, Validators.pattern( "[a-zA-Z0-9!@#\$%\^\&*\'][a-zA-Z0-9!@#\$%\^\&*\' ]*")])),
               'genre': new FormControl("",Validators.required),
               'rating': new FormControl("", Validators.compose([Validators.required, Validators.pattern("^[0-9](\.[0-9])?$|^10$")]))
           });
         
           sender.addRow(this.formGroup);
       }

       public editHandler({sender, rowIndex, dataItem}) {
        dataItem.rating = dataItem.rating.toString();
        
           this.closeEditor(sender);
           

           this.formGroup = new FormGroup({
               'song': new FormControl(dataItem.song, Validators.compose([Validators.required, Validators.pattern( "[a-zA-Z0-9!@#\$%\^\&*\'][a-zA-Z0-9!@#\$%\^\&*\' ]*")])),
               'artist': new FormControl(dataItem.artist, Validators.compose([Validators.required, Validators.pattern( "[a-zA-Z0-9!@#\$%\^\&*\'][a-zA-Z0-9!@#\$%\^\&*\' ]*")])),
               'genre': new FormControl(dataItem.genre, Validators.required),
               'rating': new FormControl(dataItem.rating, Validators.compose([Validators.required, Validators.pattern("^[0-9](\.[0-9])?$|^10$")]))
           });
           this.editedRowIndex = rowIndex;
           sender.editRow(rowIndex, this.formGroup);
    
       }

       public cancelHandler({sender, rowIndex}) {
            sender.closeRow(rowIndex);
       }

       public saveHandler({sender, rowIndex, isNew, dataItem}) {
         if(isNew){
           let jsong = (dataItem);
           const postUrl="https://webhooks.mongodb-stitch.com/api/client/v2.0/app/app-adplz/service/http/incoming_webhook/post";
           sender.closeRow(rowIndex);
           this.http.post<Song>(postUrl, jsong)
           .subscribe(res => {
            this.ngOnInit();
          },
           err=>{console.log(err);});
       }

       else{
        dataItem.rating = dataItem.rating.toString();
        if(this.formGroup.value.genre.genre){
          this.formGroup.value.genre=this.formGroup.value.genre.genre;
        }
        let edit = [ dataItem, this.formGroup.value ];
        const putUrl="https://webhooks.mongodb-stitch.com/api/client/v2.0/app/app-adplz/service/http/incoming_webhook/put";
        sender.closeRow(rowIndex);
        this.http.post<Song>(putUrl, edit)
        .subscribe(res => {this.ngOnInit();},
        err=>{console.log(err);});
       }
       
      }

       public removeHandler({dataItem}){
         
        const dialog: DialogRef = this.dialogService.open({
          title: 'This action cannot be undone.',
          content: 'Are you sure you want to delete \''+dataItem.song+'\'?',
          actions: [
              { text: 'Cancel' },
              { text: 'Delete', primary: true }
          ],
          width: 450,
          height: 200,
          minWidth: 250
      });

      dialog.result.subscribe((result) => {
        this.result = JSON.stringify(result);

        if (this.result === '{"text":"Delete","primary":true}' ) {
          dataItem.rating = dataItem.rating.toString();
            let body = JSON.stringify(dataItem);
            const removeUrl="https://webhooks.mongodb-stitch.com/api/client/v2.0/app/app-adplz/service/http/incoming_webhook/delete";
            this.http.post<void>(removeUrl, body)
            .subscribe(res => {
             this.ngOnInit();
           },
            err=>{console.log(err);}); 
        } 
    });
        }

       private closeEditor(grid, rowIndex = this.editedRowIndex) {
           grid.closeRow(rowIndex);
           this.editedRowIndex = undefined;
           this.formGroup = undefined;
       }


        public close() {
          this.opened = false;
          this.ngOnInit();
        }
    
        public open({dataItem, columnIndex, rowIndex}) {
          if(columnIndex!==4 && !this.editedRowIndex && rowIndex!== -1){
          this.opened = true;
          let query=dataItem.song+' '+dataItem.artist;
          let utube=this.http.get<any>(`${this.utube}search?q=${query}&maxResults=1&type=video&part=snippet,id&key=${this.api_key}&videoEmbeddable=true`);
          utube.subscribe((response)=> {
          this.response= response;
          let ids = response.items[0].id.videoId;
          let iframe = document.getElementById('myIframe').setAttribute('src','http://www.youtube.com/embed/'+ids+'?autoplay=1&mute=1&enablejsapi=1');
        })
      }
    }
   }