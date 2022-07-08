/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-global-assign */
async function findStation(stationId) {
	//console.log(stationId)
	// query the database for the station id
	$.ajax({
		url: 'FindStation.php',
		data: {
			'station_id': stationId
		},
		type: 'POST'
	}).done(function (reply) {
		//console.log(reply);
		return reply;
	});
}

async function getWeatherFromNOAA(currentStation) {
	/*global GWselectedstation*/
	GWselectedstation = currentStation;
	//GWPeriodBegin = "2020-12-01"; 
	//For testing only, comment out next line
	GWPeriodBegin = document.getElementById("PeriodBegin").value;
	//Regardless of what the user put in we are going to get the whole year
	GWPeriodBegin = GWPeriodBegin.split('-');
	GWPeriodBegin[1] = '01';
	GWPeriodBegin[2] = '01';
	GWPeriodBegin = GWPeriodBegin.join('-');
	//GWPeriodEnd = "2020-12-10"; 
	//For testing cnly, comment out next line
	GWPeriodEnd = document.getElementById("PeriodEnd").value;
	GWPeriodEnd = GWPeriodEnd.split('-');
	GWPeriodEnd[1] = '12';
	GWPeriodEnd[2] = '31';
	GWPeriodEnd = GWPeriodEnd.join('-');

	//let n = Number(GwPeriodBegin.replace(/-/g,""));
	//let m = Number(GwPeriodEnd.replace(/-/g,""));
	//if (n>m){alert("Period Begin date cannot be later than Period End date")}; 
	console.log("Prefetch");
	var fetchstring = "https://www.ncei.noaa.gov/access/services/data/v1?dataset=global-hourly&dataTypes=NAME,LONGITUDE,LATITUDE,ELEVATION,CO1,CO2,SLP,MA1,TMP,DEW,KG1,KG2,RH1,RH2,RH3,GH1,GA1,WND,AA1,IC1,AL1,AJ1&stations="
	//AA1,AJ1,GA1,GF1,GK1,GO1,GR1,IC1,
	fetchstring += GWselectedstation + "&units=metric&startDate=" + GWPeriodBegin + "&endDate=" + GWPeriodEnd + "&format=json"
	console.log(fetchstring);

	try {
		a = await fetch(fetchstring);
	} catch (err) {
		alert("Could not fetch weather data. The NOAA server may be down. If the problem persists after 24 hours, contact support@ipipe.org")
	}
	data = await a.json();
	//console.log(data);
	if (data === undefined || data.length == 0) {
		document.getElementById('loading').style.display = 'none'; // Enable loading icon
		alert("Could not get the weather data from " + currentStation + ". Please check your parameters.");
		//console.log("didn't get weather");
		return;
	}
	NAME = data[0].NAME; LATITUDE = data[0].LATITUDE; LONGITUDE = data[0].LONGITUDE; ELEVATION = data[0].ELEVATION;

	await getoffset(LATITUDE, LONGITUDE, GWPeriodBegin).then(function(){
		//console.log("finished getoffset");
	});
	await GWModel(data);
}

function getDataFrom(selectedStation, PeriodBegin, PeriodEnd) {
	$.ajax({
		url: 'GetStationData.php',
		data: {
			"station_id": selectedStation,
			"start_date": PeriodBegin,
			"end_date": PeriodEnd
		},
		type: 'POST'
	}).done(function (reply) {
		reply = JSON.parse(reply);
		//console.log(reply);
		//console.log(typeof (reply));
		if (reply == false || !reply) {
			// Data for selected dates not in IndexedDB or Postgresql
			console.log("Did not find data in iPipe database. Getting from NOAA")
			getWeatherFromNOAA(selectedStation);
		} else {// Data not in IndexedDB but is in Postgresql
			// Populate IndexedDB with reply
			console.log(selectedStation);
			let db = new Dexie(selectedStation);
			db.open().then(function () {
				//console.log(db._allTables);
				//console.log(db._allTables.weatherdata);
				/*db._allTables.weatherdata.put({
					UTC_Timestamp: 'asdf',
					UTC_Date: 'qwerty',
					UTC_Time: 'UTC Time hh:mm:ss',
					Local_Date: 'Local Date',
					Local_Time: 'Local Time',
					Day_of_Year: 'Day of Year (d)',
					Hour_of_Day: 'Hour of Day (hr)'
				});
			});*/

				reply.forEach(function (value, index) {
					try {
						db._allTables.weatherdata.put({
							UTC_Timestamp: reply[index].utc_timestamp,
							UTC_Date: reply[index].utc_date,
							UTC_Time: reply[index].utc_time,
							Local_Date: reply[index].local_date,
							Local_Time: reply[index].local_time,
							Day_of_Year: reply[index].day_of_year,
							Hour_of_Day: reply[index].hour_of_day,
							Sea_Level_Pressure: reply[index].sea_level_pressure,
							Station_Pressure: reply[index].station_pressure,
							Air_Temperature: reply[index].air_temperature,
							Dew_Point: reply[index].dew_point,
							Wet_Bulb: reply[index].wet_bulb,
							Relative_Humidity: reply[index].relative_humidity,
							Incoming_Solar_Radiation: reply[index].incoming_solar_radiation,
							Cloud_Cover: reply[index].cloud_cover,
							Wind_Direction: reply[index].wind_direction,
							Wind_Speed: reply[index].wind_speed,
							Precipitation: reply[index].precipitation,
							Open_Water_Evaporation: reply[index].open_water_evaporation,
							Snowfall: reply[index].snowfall,
							Snow_Depth: reply[index].snow_depth,
							Snow_water_equivalent: reply[index].snow_water_equivalent
						});
					}
					catch (err) { console.log(err) }
				});
			});

			getWeather(selectedStation);
		}
	});
}

async function getWeather(selectedStation) {
	console.log(selectedStation);
	document.getElementById('loading').style.display = 'block'; // Enable loading icon
	// For Testing only
	//var PeriodBegin = "2020-12-01";
	//var PeriodEnd = "2020-12-03";
	
	//console.log(PeriodBegin);
	if(!PeriodBegin) {
		alert("Please specify the biofix date");
		return;

	}
	//TODO: need to trap error when user enters date in the feture 

	let year = PeriodBegin.split('-');
	year = year[0];
	var Dexiedb;
	/*if (weathersource === 'HRRR') {
		Dexiedb = selectedStation;
	}else { Dexiedb=year + selectedStation;}
	*/
	Dexiedb = year+selectedStation;
	console.log(year);
	console.log(Dexiedb);
	PeriodEnd = document.getElementById("PeriodEnd").value;
	var BeginDashless = PeriodBegin.replace(/-/g, "");
	//var Beginslash = PeriodBegin.replace(/-/g, "//");
	var EndDashless = PeriodEnd.replace(/-/g, "");
	//var Endslash = PeriodEnd.replace(/-/g, "//");
	var weatherdata = [];
	var metadata = [];

	//console.log(BeginDashless, EndDashless, selectedStationArray);
	//console.log("Dexiedb is ")
	//console.log(Dexiedb);
	let db = new Dexie(Dexiedb);
	console.log("indexDb is initialized");
	await db.open().then(async function () {
		console.log(db);
		// Query IndexedDB for data from PeriodBegin to PeriodEnd
		await db._allTables.weatherdata.where("UTC_Date").between(BeginDashless, EndDashless, true, true).each(function (row) {
			// Pass weatherdata back to the models
			weatherdata.push(row);

		}).then(async function () {
			await db._allTables.metadata.each(function (item) {
				metadata.push(item);
			}).then(function () {
				console.log(weatherdata);
				//console.log(metadata);
				//	BeginDashless = parseInt(BeginDashless);
				//	EndDashless = parseInt(EndDashless);
				//let lengthshouldbe = ((EndDashless - BeginDashless) + 1) * 24;
				
				if (weatherdata.length > 0) {
					DexieSuccess = true;
				//console.log(DexieSuccess);
					document.getElementById('loading2').style.display = 'none';
					switch (modelIndex) {
						case 0:
							//TODO: Make Get Weather (GW) pop up the GW table
							GWTable(weatherdata, metadata);
							break;
						case 1:

							DDModel(weatherdata, metadata);


							break;
						case 2:
							LDDModel(weatherdata, metadata);
							break;
						case 3:
							LLDDModel(weatherdata, metadata);
							break;
						case 4:
							WDDModel(weatherdata, metadata);
							break;
						case 5:
							TDRModel(weatherdata, metadata);
							break;
						case 6:
							CARTModel(weatherdata,metadata);
					}
				} else { 
					console.log("weather length is 0");
					//document.getElementById('loading2').style.display = 'block'; 
				}
			});
		});

	}, async function (err) {
		console.log("local database not found. Getting weather from NOAA.");
		//console.log(err);
		console.log(selectedStation);
		DexieSuccess = false;
		await getWeatherFromNOAA(selectedStation) }
	); // Connect to the selected station db in IndexedDB 
}





