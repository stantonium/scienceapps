/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function GWgetRun(R) {

	$.ajax({
		url: './models/GWgetRun.php',
		data: {
			'User': user,
			'R': R
		},
		type: 'POST'
	}).done(reply => {
		var GWUserRun = JSON.parse(reply);
		//	console.log(GWUserRun);
		if (GWUserRun) {
			if (GWUserRun[0].station) {
				GWselectedstation = GWUserRun[0].station;
				//			console.log(GWselectedstation);
				GWPeriodBegin = GWUserRun[0].TimePeriod.replace("\)", "");
				GWPeriodBegin = GWPeriodBegin.replace('[', '');
				GWPeriodBegin = GWPeriodBegin.split(',');
				GWPeriodEnd = GWPeriodBegin[1];
				GWPeriodBegin = GWPeriodBegin[0];
				GWPeriodEnd = maintainEndDate(GWPeriodEnd);

				document.getElementById("Station").value = GWselectedstation;
				if (GWselectedstation.length > 1) { document.getElementById("run").style.display = "block" }
				document.getElementById("PeriodBegin").value = GWPeriodBegin;
				document.getElementById("PeriodEnd").value = GWPeriodEnd;
				HTMLPage = GWUserRun[0].HTMLPage;
				NAME = GWUserRun[0].StationName;
				LATITUDE = GWUserRun[0].Latitude;
				LONGITUDE = GWUserRun[0].Longitude;
				ELEVATION = GWUserRun[0].Elevation;


			}
		}
		csvName = userInitials + ' GW ' + GWselectedstation + ' ' + GWPeriodBegin + ' ' + GWPeriodEnd
		getWeather(selectedStation);
		return;
	})

}




function onchangeGW() {

	//console.log("Here");
	//First populate saved

	document.getElementById('SavedModels').innerHTML = "";
	document.getElementById("Stations").style.display = "block";


	$.ajax({
		url: './models/GWgetModels.php',
		data: {
			'User': user
		},
		type: 'POST'
	}).done(reply => {


		if (reply) {
			var GWUserModels = JSON.parse(reply);
			console.log(GWUserModels);
		}



		if (GWUserModels) {
			GWRunNum = GWUserModels.GWMAX;
			//      console.log(RunNum);
			var length = GWUserModels.GW.length;
			console.log(length);

			document.getElementById("SavedModels").innerHTML = NamedModelString + NamedModelString2;
			GWUserModels.GW.forEach(Run => addItem2(Run.Name, Run.RunNum));

			console.log(GWUserModels.Gw);

		}

	})


	//Now populate Runs


	document.getElementById("ActiveRuns").innerHTML = "";

	$.ajax({
		url: './models/GW.php',
		data: {
			'User': user
		},
		type: 'POST'
	}).done(reply => {

		if (reply) {
			//	console.log(reply);

			var GWUserRuns = JSON.parse(reply);

			//	console.log(GWUserRuns)
		}
		document.getElementById("inputs").innerHTML = "";
		inputs.insertAdjacentHTML('afterbegin', GWModelHTML);


		if (GWUserRuns) {
			if (GWUserRuns.GWMAX > GWRunNum) {
				GWRunNum = GWUserRuns.GWMAX
			}
			//	console.log(GWRunNum);
			var length = GWUserRuns.GW.length;
			//	console.log(length);
			GWselectedstation = GWUserRuns.GW[length - 1].station;
			//	console.log(GWselectedstation);
			GWPeriodBegin = GWUserRuns.GW[length - 1].TimePeriod.replace("\)", "");
			GWPeriodBegin = GWPeriodBegin.replace('[', '');
			GWPeriodBegin = GWPeriodBegin.split(',');
			GWPeriodEnd = GWPeriodBegin[1];
			GWPeriodEnd = maintainEndDate(GWPeriodEnd);
			GWPeriodBegin = GWPeriodBegin[0];

			document.getElementById("ActiveRuns").innerHTML = string + string2;
			GWUserRuns.GW.forEach(Run => addItem(Run.Name, Run.RunNum));


			document.getElementById("Station").value = GWselectedstation;
			document.getElementById("PeriodBegin").value = GWPeriodBegin;
			document.getElementById("PeriodEnd").value = GWPeriodEnd;



		} else {
			//console.log("Howdy");
			document.getElementById("ActiveRuns").innerHTML = "";
			document.getElementById("Station").value = GWselectedstation;
			document.getElementById("PeriodBegin").value = GWPeriodBegin;
			document.getElementById("PeriodEnd").value = GWPeriodEnd;
			console.log(GWselectedstation);
			if (GWselectedstation == '') { document.getElementById("run").style.display = "none" }

		}

		//Filter stations by period on change
		periodFilter();

	});
}

// replaces undefined values with 8888.8
function unDef(val) {
	if (val == null) {
		val = 8888.8;
	}
	return val;
}

// Get Weather for red stations
const GWModelHTML = '<div id="inr1"></div>'
var header;
var ELEV;
async function GWModel(data) {

	header = '';
	//header ="<div id=\"header\" class=\"display\" style=\"color:black\">Station Name: " + data[0].NAME + "<br>Latitude: " + data[0].LATITUDE + "<br>Longitude: ";
	//header += data[0].LONGITUDE +"<br>Elevation: "+ data[0].ELEVATION+"<br></div>";
	ELEV = data[0].ELEVATION;

	//console.log(data);
	NAME = data[0].NAME;
	LATITUDE = data[0].LATITUDE;
	LONGITUDE = data[0].LONGITUDE;
	ELEVATION = data[0].ELEVATION;


	var tab = common_tab
	tab += "<th>Sea Level Pressure (hPa)</th><th>Station Pressure (hPa)</th><th>Air Temperature (C)</th> <th>Dew Point (C)</th>";
	tab += "<th>Wet Bulb (C)</th><th>Relative Humidity (%)</th> <th>Incoming Solar Radiation (Watts/m2)</th> <th>";
	tab += "Cloud Cover (%)</th><th>Wind Direction (deg)</th> <th>Wind Speed (m/s)</th><th> Precipitation (mm)</th>";
	tab += " <th>Open Water Evaporation (mm)</th> <th>Snowfall (cm)</th> <th>Snow Depth (cm)</th>";
	tab += "</tr> </thead><tbody>";
	//+ "</th> <th>" + "AA1" + "</th> <th>" + "AJ1" + "</th> <th>" + "GA1" + "</th> <th>" + "GF1" + "</th> <th>" + "GK1" + "</th> <th>" + "GR1" + "</th> <th>" + "GO1" + "</th> <th>" + "IC1" 
	var x = 0;
	var len = data.length;


	while (x < len) {

		if (data[x].REPORT_TYPE == "FM-15") {

			let d1 = data[x].DATE.split("-");
			let T1 = d1[2].split("T");


			//Take the observation closest to the top of the hour
			let minutes = T1[1].trim();
			minutes = minutes.split(':');
			minutes = parseInt(minutes[1]);
			//console.log('Minutes: ' + minutes);



			if (minutes >= 50 || minutes <= 10) {
				if (x < len - 1) {
					if (data[x + 1].REPORT_TYPE == "FM-15") {
						let next = data[x + 1].DATE.split("-");
						next = next[2].split("T");
						next = next[1].trim();
						next = next.split(':');
						next = parseInt(next[1]);
						//		console.log('Next: ' + next);
						//if (minutes >= 50 && next > minutes && data[x + 1].REPORT_TYPE == "FM-15") { minutes = next; x++; };
						//if (minutes <= 10 && next > minutes && data[x + 1].REPORT_TYPE == "FM-15") { minutes = next; x++; };
						//Note commenting this out fixes the Sanford case 2018-04-30 to 2018-06-26 but breaks something else
						//Find what broke!!!
					}
				}
			}
			//console.log('Minutes next: ' + minutes)
			if (minutes <= 50 && minutes >= 10) { null } else {
				if (data[x].REPORT_TYPE == "FM-15") {
					//console.log('UTC date: ' + data[x].DATE);
					let date = data[x].DATE + 'Z';
					//console.log(date);
					date = new Date(date);
					//console.log(date);
					//console.log(timezone);
					let localdate = date.toLocaleString('en-US', { timeZone: timezone });
					localdate = localdate.split(',');
					let d = data[x].DATE.split("-");
					let T = d[2].split("T");
					let D = T[0].trim();
					let ND = parseInt(D, 10);
					//console.log(localdate);
					let localdate2 = localdate[0].split('/');
					//console.log(localdate2);
					let jd = dayNo(parseInt(localdate2[2]), parseInt(localdate2[0]), parseInt(localdate2[1]));


					// This equation is for Julian Dates used in  AStronomy. Keep in case we do other modeling stuff that needs it.

					//		let jd = (367*d[0] - Math.round(7*(d[0]+Math.round((d[1]+9)/12))/4) + Math.round(275*d[1]/9) + ND + 1721013.5);

					// Fill in the date
					tab += "<tr><td>" + d[0] + d[1] + D + "</td>";
					//Fill in UTC Time, Local date and local time
					tab += "<td>" + T[1].trim() + "</td><td>" + localdate[0] + "</td><td>" + localdate[1] + "</td>";
					//Fill in day of year
					tab += "<td>" + jd + "</td>";

					//Hours based on UTC Time

					//let hr = T[1].trim().split(":");
					//hr = parseInt(hr[0]);
					// Hours based on local time

					let hr = localdate[1].trim().split(":");
					hr[0] = parseInt(hr[0]);
					if (hr[2].includes("P")) { hr = parseInt(hr[0] + 12); if (hr == 24) { hr = 12; } } else {
						hr = parseInt(hr[0]);
						//console.log(typeof (hr));
						//console.log(hr);
						if (hr == 12) { hr = 0; }
					}
					//Fill in hr
					if (minutes >= 50) { hr = hr + 1 }
					tab += "<td>" + hr + "</td>";

					// process Sea Level Pressure

					try { slp = data[x].SLP.split(","); } catch (err) { slp = ''; }

					// If Sea Level pressure is missing, calculate it per Joe's formula

					if (slp[0] == "99999") {
						let tmp = data[x].TMP.split(","); // split TMP value
						try { ma1 = data[x].MA1.split(","); } catch (err) {
							//console.log(data[x]);
							ma1 = '';
						}
						//console.log(ma1[2]);
						tmp = tmp[0] / 10;
						if (ma1[2] == "99999") { slp[0] = 1013.25 * 10 } else {
							prs = ma1[2] / 10;
							//console.log(tmp);
							//console.log(prs);
							slp[0] = prs * Math.pow((1 - (.0065 * ELEV / (tmp + 273.15 + .0065 * ELEV))), -5.257)
							slp[0] = slp[0] * 10;
							slp[0] = parseFloat(slp[0])
						}
					}

					tab += "<td>" + unDef((slp[0] / 10).toFixed(2)) + "</td>"; // sea level pressure

					//process station pressure

					//let ma1 = data[x].MA1.split(","); // MA1 value
					try { ma1 = data[x].MA1.split(","); } catch (err) {
						// console.log(data[x]);
						ma1 = '';
					}
					if (ma1[2] == "99999") {
						//console.log(slp[0]);
						//console.log(ELEV);
						ma1[2] = (slp[0] / 10) * Math.exp((-ELEV / ((16.1 + 273.15) * 29.263)));
						ma1[2] = ma1[2].toFixed(2);
						//	console.log(ma1[2]);

					} else { ma1[2] = ma1[2] / 10 }

					let PRS = ma1[2];
					tab += "<td>" + unDef(PRS) + "</td>";

					// process Air Temperature
					let tmp = data[x].TMP.split(","); // split TMP value
					tmp = tmp[0] / 10;
					tab += "<td>" + unDef(tmp) + "</td>"; // temperature

					// process DEW
					let dew = data[x].DEW.split(","); // split DEW value
					dew = dew[0] / 10;
					tab += "<td>" + unDef(dew) + "</td>"; // dew point temp



					//Process Wet bulb Temperature

					let kg1 = data[x].KG1;
					let kg2 = data[x].KG2;
					//console.log('wet bulb raw' + kg1 + ' ' + kg2  );
					if (kg1 == null && kg2 == null) {
						//	console.log('tmp: ' + tmp + 'dew: ' + dew + 'Station Pressure:' + ma1);
						//tmp[0]=20; dew[0]=11.5; ma1[0]=1000
						let svp = 6.108 * Math.pow(Math.E, (17.27 * tmp / (tmp + 237.3)))
						let delta = 4099 * svp / ((tmp + 237.3) * (tmp + 237.3))
						let gamma = 0.0006647 * (PRS);
						let wtb = svp * (0.05 * (dew - tmp)) / (delta + gamma) + tmp;
						kg1 = wtb;
						kg1 = kg1.toFixed(2);
					}
					tab += "<td>" + unDef(kg1) + "</td>";

					//Process Relative Humidity

					let RH1 = data[x].RH1;
					let RH2 = data[x].RH2;
					let RH3 = data[x].RH3;
					if (RH1 == null && RH2 == null && RH3 == null) {


						let SVP = 6.108 * Math.pow(Math.E, (17.27 * tmp / (tmp + 237.3)))
						let VP = 6.108 * Math.pow(Math.E, (17.269 * dew / (dew + 237.3)))
						RH1 = (VP / SVP) * 100;
						RH1 = RH1.toFixed(2);
						//console.log(VP,SVP,RH1);
					}
					tab += "<td>" + unDef(RH1) + "</td>";

					// Cloud cover calculation

					let ga1 = data[x].GA1;
					if (ga1) {
						ga1 = ga1.split(",");
						let CH = ga1[2];
						CH = parseInt(CH);
						//console.log('Cloud Height ' + CH);
						if (CH > 15000) { CH = 15000; }
						let NCH = CH / 15000;
						//	console.log('Normalized Cloud Height Fraction' + NCH);
						let CCIOVC = 0.101 + 0.615 * NCH;
						//	console.log('Cloud Cover Irradiance Overcast CCIOVC fraction' + CCIOVC);
						let CCO = ga1[0];
						CCO = parseInt(CCO);
						if (CCO == 99) { CCO = 4; }
						//console.log('Oktas' + CCO);
						let CCF = CCO / 8;
						ga1 = ((1 - CCIOVC) * (Math.pow(CCF, 2)) * 100);
						ga1 = ga1.toFixed(2);
						ga1 = parseFloat(ga1);
					} else { ga1 = 50 }

					//Process Incoming Solar Radiation
					let gh1 = data[x].GH1; // 
					let lat = LATITUDE * (Math.PI / 180);
					if (gh1 == null) {
						//console.log('hr=' + hr);
						let DR = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * jd);
						//console.log(DR);
						let DECL = 0.409 * Math.sin((2 * Math.PI / 365) * jd - 1.39);
						//console.log(DECL);
						let SSHA = Math.acos(-Math.tan(lat) * Math.tan(DECL));
						//console.log(SSHA);
						let SRHA = -SSHA;
						//console.log(SRHA);
						let STHM = hr - 1 + 0.5;
						//console.log('STHM ' + STHM);
						let TC = (2 * Math.PI * (jd - 81)) / 364;
						//console.log(TC);
						let STSC = 0.1645 * Math.sin(2 * TC) - 0.1255 * Math.cos(TC) - 0.025 * Math.sin(TC);
						//console.log('STSC' + STSC);
						//console.log(STZC); //This was calculated in getoffset.php based on the windows time zone
						//console.log('STZC =' + STZC + 'long =' + LONGITUDE);
						let STAM = (Math.PI / 12) * ((STHM + 0.06667 * (-STZC - LONGITUDE) + STSC) - 12);
						//console.log('STAM = ' + STAM);
						let STAB = STAM - (Math.PI) / 24;
						//console.log(STAB);
						let STAE = STAM + (Math.PI) / 24;
						//console.log(STAE);
						if (STAB < SRHA) { STAB = SRHA } else if (STAB > SSHA) { STAB = SSHA } else if (STAB > STAE) { STAB = STAE }
						if (STAE < SRHA) { STAE = SRHA } else if (STAE > SSHA) { STAE = SSHA }
						//console.log('STAB =' + STAB);
						//console.log('STAE =' + STAE);

						let SRA = (12 / Math.PI) * 4.92 * DR * ((STAE - STAB) * Math.sin(lat) * Math.sin(DECL) + Math.cos(lat) * Math.cos(DECL) * (Math.sin(STAE) - Math.sin(STAB)));
						//console.log(SRA);
						let SRS = ((0.25 + 0.50 * (1.0 - ga1 * 0.01)) + 0.00002 * ELEV) * SRA;
						//console.log(SRS)
						gh1 = SRS / .0036;
						gh1 = gh1.toFixed(2);

					}
					tab += "<td>" + unDef(gh1) + "</td>"; // 

					//Put in  Cloud Cover from previously calculated value

					tab += "<td>" + unDef(ga1) + "</td>"; // 

					// process Wind Direction and Speed
					let wnd = data[x].WND.split(","); // split WND value
					let WSP = unDef(wnd[3] / 10);
					tab += "<td>" + unDef(wnd[0] / 1) + "</td>"; // direction angle. /1 gets rid of 0's in front
					tab += "<td>" + WSP + "</td>"; // speed rate	

					//Process Precipitation
					try {
						aa1 = data[x].AA1.split(",");
					} catch (err) {
						//console.log(data[x]);
						aa1 = '';
					}
					tab += "<td>" + unDef(aa1[1]) + "</td>"; // 

					//Process Evaporation

					let ic1 = data[x].IC1; // 

					if (ic1 == null) {
						let TC = (2 * Math.PI * (jd - 81)) / 364;
						let DECL = 0.409 * Math.sin((2 + Math.PI / 365) * jd - 1.39);
						let STSC = 0.1645 * Math.sin(2 * TC) - 0.1255 * Math.cos(TC) - 0.25 * Math.sin(TC);
						let STHM = hr - 1 + 0.5;
						let STAM = (Math.PI / 12) * ((STHM + 0.06667 * (STZC - LONGITUDE) + STSC) - 12);
						let STAB = STAM - (Math.PI) / 24;
						let STAE = STAM + (Math.PI) / 24;
						let DR = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * jd);
						let SRA = (12 / Math.PI) * 4.92 * DR * ((STAE - STAB) * Math.sin(lat) * Math.sin(DECL) + Math.cos(lat) * Math.cos(DECL) * (Math.sin(STAE) - Math.sin(STAB)));
						let SRS = ((0.25 + 0.50 * (1.0 - ga1 * 0.01)) + 0.00002 * ELEV) * SRA;
						let SUNA = Math.asin(Math.sin(lat)) * Math.sin(DECL) + Math.cos(lat) * Math.cos(STAM);
						let SUNRAT = SRS / SRA;
						if (SUNRAT < 0.3) {
							SUNRAT = 0.55
						} else if (SUNRAT > 1.0) {
							SUNRAT = 1.0
						}
						let DCF = 1.35 * SUNRAT - 0.35;
						let ALB = 0.14;
						let RNS = (1 - ALB) * SRS;
						let VP = 6.108 * Math.pow(Math.E, (17.269 * dew / (dew + 237.3)));
						let SVP = 6.108 * Math.pow(Math.E, (17.27 * tmp / (tmp + 237.3)));
						let RNL = Math.pow(2.042, -10) * DCF * (0.34 - 0.14 * Math.sqrt(VP)) * Math.pow((tmp + 273.16), 4);
						let RNET = RNS - RNL;
						var RNSC;
						var RNLC;
						if (jd <= 180) { RNSC = 0.5; RNLC = -0.8 } else if (jd > 180) { RNSC = .5; RNLC = -1.3; }
						let WES = RNSC * RNS + RNLC * RNL;
						let H = 3;
						let WSPH = WSP * (4.87 / (Math.log(67.8 * H - 5.42)));
						let PSYC = .00665 * PRS;
						let DELTA = (Math.pow(2503, ((17.27 * tmp) / (tmp + 237.3)))) / ((tmp + 237.3) * (tmp + 237.3));
						let AERO = 0.268 * (0.5 + 0.54 * WSPH) * (SVP - VP);
						let ROW = (DELTA * (RNET - WES) + PSYC * AERO) / (DELTA + PSYC);
						let EOW = 0.4082 * ROW;
						if (EOW < 0) { EOW = 0 }
						ic1 = EOW.toFixed(2);
					}

					tab += "<td>" + unDef(ic1) + "</td>";


					//Process Snowfall
					let al1 = data[x].AL1;
					if (al1) {
						al1 = al1.split(',');
						al1 = parseInt(al1[0]);
					}
					tab += "<td>" + unDef(al1) + "</td>";

					//Process Snow Depth
					let aj1 = data[x].AJ1;
					var swe;
					if (aj1) {
						aj1 = aj1.split(',');
						swe = parseInt(aj1[3]);
						swe = swe / 10;
						aj1 = parseInt(aj1[0]);
					}

					tab += "<td>" + unDef(aj1) + "</td>";
					tab += "<td>" + unDef(swe) + "</td>";

					tab += "</tr>";
				}
			}
		}
		x++;
	}

	tab += "</tbody></table>"
	HTMLPage = tab;
	tab += "<div class=\"dijitDialogPaneActionBar\">"
	//tab+="<input id=\"ModelName\" data-dojo-type=\"dijit/form/TextBox\" type=\"textbox\" data-dojo-props=\"placeHolder: 'DD:RDM:V1'\">"
	tab += "<button data-dojo-type=\"dijit/form/Button\" type=\"button\""
	tab += "<id=\"Save\"onClick=\"SaveRun\">Save</button>"
	tab += "<button data-dojo-type=\"dijit/form/Button\" type=\"button\""

	//name of CSV if downloaded
	var csvName = userInitials + ' GW ' + GWselectedstation + ' ' + GWPeriodBegin + ' ' + GWPeriodEnd;
	tab += "id=\"Download\"onClick=\"exportTableToCSV('" + csvName + ".csv')\">Download CSV</button>"

	tab += "<button data-dojo-type=\"dijit/form/Button\" type=\"button\""
	tab += "id=\"cancel\"onClick=\"WeatherData.hide()\">Cancel</button></div>"

	//WeatherData.set("content", header + tab);
	//var table = $('#Results').DataTable({
	//	"scrollX": "400px",
	//	"scrollY": "400px",
	//	"scrollCollapse": true,
	//	"paging": false,

	//});

	let dbData = HTMLPage.replace('</tbody></table>', '').split('<tr>');
	//console.log(dbData);
	let reply = 'false';
	console.log(GWPeriodBegin);
	saveStation(reply, GWselectedstation, GWPeriodBegin);
	populateIndexDB(dbData, GWselectedstation, GWPeriodBegin, NAME, LATITUDE, LONGITUDE, ELEVATION);
	populateSQLDB(dbData, GWselectedstation, GWPeriodBegin);
	//document.getElementById('loading').style.display = 'none';

	/*if (isNamedRun === true) {
		//SaveRun(GWselectedstation);
	} else {
		//getWeather(selectedStation);
		//WeatherData.show();
		//table.columns.adjust().draw();
		
	}*/
	console.log("made it here beta 2 bottom of GW model")

}

// Function to show the table when GW is run. Separate from GWModel because no data is actually fetched. 
function GWTable(data, metadata) {
	header = '';

	tab = common_tab
	tab += "<th>Sea Level Pressure (hPa)</th><th>Station Pressure (hPa)</th><th>Air Temperature (C)</th> <th>Dew Point (C)</th>";
	tab += "<th>Wet Bulb (C)</th><th>Relative Humidity (%)</th> <th>Incoming Solar Radiation (Watts/m2)</th> <th>";
	tab += "Cloud Cover (%)</th><th>Wind Direction (deg)</th> <th>Wind Speed (m/s)</th><th> Precipitation (mm)</th>";
	tab += " <th>Open Water Evaporation (mm)</th> <th>Snowfall (cm)</th> <th>Snow Depth (cm)</th>";
	tab += "</tr> </thead><tbody>";
	var x = 0;
	var len = data.length;
	var rowcounter = 0;

	while (x < len) {
		if (data[x].Hour_of_Day != 1 && rowcounter == 0) {
			x++;
			continue;
		}
		rowcounter++;

		// stuff under common tab
		tab += "<tr><td>" + data[x].UTC_Date + "</td>";
		tab += "<td>" + data[x].UTC_Time + "</td>";
		tab += "<td>" + data[x].Local_Date + "</td>";
		tab += "<td>" + data[x].Local_Time + "</td>";
		tab += "<td>" + data[x].Day_of_Year + "</td>";
		tab += "<td>" + data[x].Hour_of_Day + "</td>";

		tab += "<td>" + data[x].Sea_Level_Pressure + "</td>"; // sea level pressure


		tab += "<td>" + data[x].Station_Pressure + "</td>"; // station pressure

		tab += "<td>" + data[x].Air_Temperature + "</td>"; // temperature

		tab += "<td>" + data[x].Dew_Point + "</td>"; // dew point temp


		tab += "<td>" + data[x].Wet_Bulb + "</td>"; // wet bulb temp

		tab += "<td>" + data[x].Relative_Humidity + "</td>"; // relative humidity

		tab += "<td>" + data[x].Incoming_Solar_Radiation + "</td>"; // incoming solar radiation

		tab += "<td>" + data[x].Cloud_Cover + "</td>"; // cloud cover 

		tab += "<td>" + data[x].Wind_Direction + "</td>"; // wind direction
		tab += "<td>" + data[x].Wind_Speed + "</td>"; // wind speed


		tab += "<td>" + data[x].Precipitation + "</td>"; // precipitation
		tab += "<td>" + data[x].Open_Water_Evaporation + "</td>"; // evaporation
		tab += "<td>" + data[x].Snowfall + "</td>"; // snowfall
		tab += "<td>" + data[x].Snow_Depth + "</td>"; // snow depth
		tab += "<td" + data[x].Snow_water_equivalent + "</td>"; //Snow water equivalent

		tab += "</tr>";

		x++;
	}

	NAME = metadata[0].name;
	LATITUDE = metadata[0].latitude;
	LONGITUDE = metadata[0].longitude;
	ELEVATION = metadata[0].elevation;

	tab += "</tbody></table>"
	HTMLPage = tab;
	tab += "<div class=\"dijitDialogPaneActionBar\">"
	//tab+="<input id=\"ModelName\" data-dojo-type=\"dijit/form/TextBox\" type=\"textbox\" data-dojo-props=\"placeHolder: 'DD:RDM:V1'\">"


	tab += "<button data-dojo-type=\"dijit/form/Button\" type=\"button\""
	tab += "<id=\"Save\"onClick=\"SaveRun\">Save</button>"
	tab += "<button data-dojo-type=\"dijit/form/Button\" type=\"button\""

	//name of CSV if downloaded
	var csvName = userInitials + ' GW ' + GWselectedstation + ' ' + GWPeriodBegin + ' ' + GWPeriodEnd;
	tab += "id=\"Download\"onClick=\"exportTableToCSV('" + csvName + ".csv')\">Download CSV</button>"

	tab += "<button data-dojo-type=\"dijit/form/Button\" type=\"button\""
	tab += "id=\"cancel\"onClick=\"WeatherData.hide()\">Cancel</button></div>"

	WeatherData.set("content", header + tab);
	var table = $('#Results').DataTable({
		"scrollX": "400px",
		"scrollY": "400px",
		"scrollCollapse": true,
		"paging": false,

	});
	if (isNamedRun === true) {
		SaveRun();
	} else {
		WeatherData.show();
		table.columns.adjust().draw();
	}
	document.getElementById('loading').style.display = 'none';
}
