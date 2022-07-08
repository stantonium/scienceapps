/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function SaveAOItoDB() {
      // console.log(typeof(longitudes));
        let name = document.getElementById("AOINameBox").value;
        //console.log(name);


        $.ajax({
                url: 'PopulateAOI.php',
                data: {
                        'name': name,
                        'longitudes': longitudes,
                        'latitudes': latitudes,
                        'user_id': user.user_id
                },
                type: 'POST'
        }).then(reply => {
               // console.log("saved the area");
                AOIPrompt.hide();
                let yellowRectangleCords = new Array;
                longitudes = longitudes.split(':');
                latitudes = latitudes.split(':');
                yellowRectangleCords[0] = longitudes[0];
                yellowRectangleCords[1] = longitudes[1];
                yellowRectangleCords[2] = latitudes[0];
                yellowRectangleCords[3] = latitudes[1];
                //console.log(yellowRectangleCords);
                
                drawSavedAOI(yellowRectangleCords, name);
                /* console.log(reply)
                  let AreaPoints = JSON.parse(reply);
                  
          
          var userAOI = viewer.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(LONGITUDE, LATITUDE),
                  point: {
                      pixelSize: 10,
                      color: Cesium.Color.GREEN,
                  },
                  label: {
                      text: PointName,
                      font: '14pt monospace',
                      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                      outlineWidth: 2,
                      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                      pixelOffset: new Cesium.Cartesian2(0, -9)
          
                  }
              })
              */
        });


}



async function populateHRRR(ForecastTemp, ForecastTime) {
        console.log(PointName);
        console.log(ForecastTemp);
        console.log(ForecastTime);
        console.log(GWPeriodBegin);
        await getoffset(LATITUDE, LONGITUDE, GWPeriodBegin).then(function () {
                //console.log("finished getoffset");



                let tableheaders = Object.assign({}, allResultColumns, DBResultColumns);
                let Keys = Object.keys(tableheaders);
                //create the db, structure the same as before 
                let today = new Date();
                let yyyy = today.getFullYear();
                let DexieName = yyyy + PointName;
                console.log(DexieName);
                var db = new Dexie(DexieName);
                db.version(1).stores({
                        'weatherdata': Keys.toString(),
                        'metadata': Object.keys(stationMetadata).toString()
                });
                let elevation = 'get this from somewhere'
                // Put the metadata into it
                db.metadata.put({
                        name: PointName,
                        latitude: LATITUDE,
                        longitude: LONGITUDE,
                        elevation: elevation
                });
                //populate forecast database
                var beginDate = ForecastTime[0].split('=');
                beginDate = beginDate[1].substring(0, 8);
                ForecastTime.forEach((val, index) => {
                        let time = val.split('=');
                        let UTCDate = time[1].substring(0, 8);
                        // we need this format 2019-07-01T11:57:00Z
                        let formatedDate = time[1].substring(0, 4) + '-' + time[1].substring(4, 6) + '-' + time[1].substring(6, 8) + 'T' + time[1].substring(8) + ':00:00Z'
                        let myDate = new Date(formatedDate);
                        //console.log(myDate);
                        let UTCtime = time[1].substring(8);
                        UTCtime = UTCtime + ':00:00';
                        let localdate = myDate.toLocaleString('en-US', { timeZone: timezone });
                        localdate = localdate.split(',');
                        let hr = localdate[1].trim().split(":");
                        hr[0] = parseInt(hr[0]);
                        if (hr[2].includes("P")) { hr = parseInt(hr[0] + 12); if (hr == 24) { hr = 12; } } else {
                                hr = parseInt(hr[0]);
                                //console.log(typeof (hr));
                                //console.log(hr);
                                if (hr == 12) { hr = 0; }
                        }
                        /*let d = data[x].DATE.split("-");
                         let T = d[2].split("T");
                         let D = T[0].trim();
                         let ND = parseInt(D, 10);
                         */
                        //console.log(localdate);
                        let localdate2 = localdate[0].split('/');
                        //console.log(localdate2);
                        let jd = dayNo(parseInt(localdate2[2]), parseInt(localdate2[0]), parseInt(localdate2[1]));


                        // console.log(time[1]);
                        db.weatherdata.put({
                                UTC_Timestamp: time[1],
                                UTC_Time: UTCtime,
                                UTC_Date: UTCDate,
                                Local_Date: localdate[0],
                                Local_Time: localdate[1],
                                Day_of_Year: jd,
                                Hour_of_Day: hr + 1,
                                Air_Temperature: ForecastTemp[index]
                        });
                        PeriodEnd = UTCDate;
                })

                PeriodBegin = beginDate.substring(0, 4) + "-" + beginDate.substring(4, 6) + "-" + beginDate.substring(6, 8);
                PeriodEnd = PeriodEnd.substring(0, 4) + "-" + PeriodEnd.substring(4, 6) + "-" + PeriodEnd.substring(6, 8);


                selectedStation = document.getElementById("Station").value = PointName;
                document.getElementById("PeriodBegin").value = PeriodBegin;
                document.getElementById("PeriodEnd").value = PeriodEnd;
                getWeather(selectedStation);



        });

}
function populateIndexDB(rows, stationid, PeriodBegin, name, latitude, longitude, elevation) {

        //console.log(PeriodBegin);
        let year = PeriodBegin.split('-');
        year = year[0];
        //console.log(year);
        let dexiestation = year + stationid;
        //console.log(dexiestation);
        // Remove first two elements, which are just html tags
        rows.shift();
        rows.shift();
        let splitdata = [];

        // For each row, split into elements and remove remaining tags
        rows.forEach(function (value, index) {

                rows[index] = rows[index].replace('</tr>', ''); // Remove trailing </tr>
                let splitrow = rows[index].split('</td><td>'); // Split along </td><td>
                // Remove the tags at the begining and end of the row
                splitrow[0] = splitrow[0].replace('<td>', '');
                splitrow[20] = splitrow[splitrow.length - 1].replace('</td>', '');

                splitrow.unshift(splitrow[0] + splitrow[1]); // Splice UTC_Date and UTC_Time together to make UTC_Timestamp

                splitdata.push(splitrow); // Add to splitdata array
        });


        //console.log(dexiestation);
        //concatenate allResultColumns and DBResultColumns together
        let tableheaders = Object.assign({}, allResultColumns, DBResultColumns);
        //get keys
        let Keys = Object.keys(tableheaders);
        //console.log(Keys.toString());
        // Parse selectedStation JSON object

        // Create the database
        var db = new Dexie(dexiestation);
        db.version(1).stores({
                'weatherdata': Keys.toString(),
                'metadata': Object.keys(stationMetadata).toString()
        });

        // Put the metadata into it
        console.log(name, latitude, longitude, elevation);
        db.metadata.put({
                name: name,
                latitude: latitude,
                longitude: longitude,
                elevation: elevation
        });
        let reply = splitdata;
        //console.log(reply);
        reply.forEach(function (value) {
                //    console.log(value);
                db.weatherdata.put({
                        UTC_Timestamp: value[0],
                        UTC_Date: value[1],
                        UTC_Time: value[2],
                        Local_Date: value[3],
                        Local_Time: value[4],
                        Day_of_Year: value[5],
                        Hour_of_Day: value[6],
                        Sea_Level_Pressure: value[7],
                        Station_Pressure: value[8],
                        Air_Temperature: value[9],
                        Dew_Point: value[10],
                        Wet_Bulb: value[11].wet_bulb,
                        Relative_Humidity: value[12],
                        Incoming_Solar_Radiation: value[13],
                        Cloud_Cover: value[14],
                        Wind_Direction: value[15],
                        Wind_Speed: value[16],
                        Precipitation: value[17],
                        Open_Water_Evaporation: value[18],
                        Snowfall: value[19],
                        Snow_Depth: value[20],
                        Snow_water_equivalent: value[21]

                });

        })
        console.log("Dexie is populated");
        //getWeather(stationid);


}
function populateSQLDB(rows, stationid, GWPeriodBegin) {
        console.log(GWPeriodBegin);
        console.log(stationid);
        let year = GWPeriodBegin.split('-');
    year = year[0];
        // Remove first two elements, which are just html tags
        rows.shift();
        rows.shift();
        let splitdata = [];

        // For each row, split into elements and remove remaining tags
        rows.forEach(function (value, index) {

                rows[index] = rows[index].replace('</tr>', ''); // Remove trailing </tr>
                let splitrow = rows[index].split('</td><td>'); // Split along </td><td>
                // Remove the tags at the begining and end of the row
                splitrow[0] = splitrow[0].replace('<td>', '');
                splitrow[20] = splitrow[splitrow.length - 1].replace('</td>', '');

                splitrow.unshift(splitrow[0] + splitrow[1]); // Splice UTC_Date and UTC_Time together to make UTC_Timestamp

                splitdata.push(splitrow); // Add to splitdata array
        });

        //console.log(splitdata);

        $.ajax({
                url: 'PopulateSQLDB.php',
                data: {
                        'stationid': stationid,
                        'splitdata': splitdata,
                        'year': year
                },
                type: 'POST'
        }).then(function () {
                console.log("Postgres is populated");
               // getDataFromPostgresql(selectedStation, PeriodBegin, PeriodEnd);

        })
}
