<?php
define('NOAUTHENTICATION',true);
include_once('../global.php');
global $dbh;
error_log("PopulateSQLDB.php");
#error_log(print_r($_POST['splitdata'], TRUE));
#error_log($_POST['stationid']);
$a = $_POST['splitdata'];
$year = $_POST['year'];
$dbstation = $year . $_POST['stationid'];
error_log($dbstation);

foreach ($a as $i){
#error_log(print_r($i, TRUE));
#$result = pg_query_params($dbh,'select * from weather_data."'. $dbstation . '" where utc_timestamp =$1', array($i[0]));
#$used_timestamp = pg_fetch_all($result);
#pg_free_result($result);
#if ($used_timestamp ==''){
	$query_string = 'insert into weather_data."' . $dbstation . '"(utc_timestamp,utc_date,utc_time,local_date,local_time,day_of_year,hour_of_day,sea_level_pressure,station_pressure,air_temperature,dew_point,wet_bulb,relative_humidity,incoming_solar_radiation,cloud_cover,wind_direction,wind_speed,precipitation,open_water_evaporation,snowfall,snow_depth, snow_water_equivalent) values (\''.$i[0].'\', \''.$i[1].'\', \''.$i[2].'\', \''.$i[3].'\', \''.$i[4].'\', \''.$i[5].'\', \''.$i[6].'\', \''.$i[7].'\', \''.$i[8].'\', \''.$i[9].'\', \''.$i[10].'\', \''.$i[11].'\', \''.$i[12].'\', \''.$i[13].'\', \''.$i[14].'\', \''.$i[15].'\', \''.$i[16].'\', \''.$i[17].'\', \''.$i[18].'\', \''.$i[19].'\', \''.$i[20].'\', \''.$i[21].'\')';
	#error_log($query_string);
	pg_query($dbh, $query_string);
#}
}
?>
