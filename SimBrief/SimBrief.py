import requests
from xml.etree import ElementTree
from flask import jsonify
import datetime


class SimBrief:

	def __init__(self):

		self.status = False
		self.user = ""
		self.data = ElementTree.ElementTree
		self.config = ElementTree.parse('config.xml')
		self.getLocalUserId()

	
	def getLocalUserId(self):

		for userid in self.config.iter('userid'):
			self.user = userid.text;

		
	def fetch(self):

		response = requests.get("https://www.simbrief.com/api/xml.fetcher.php?username=" + self.user)
		self.data = ElementTree.fromstring(response.content)
		if self.getXMLData('fetch/status') == 'Success':
			self.status = True
			for userid in self.config.iter('userid'):
				userid.text = self.user;
			self.config.write('config.xml')

        
	def getXMLData(self, attr):
		
		new_attr = attr.replace('__', '/')
		childs = self.data.findall('./' + new_attr)
		if len(childs) > 1:
			str_array = []
			for child in childs:
				str_array.append(child.text)
		else:
			for child in childs:
				str_array = child.text
		return str_array


	def get(self):

	# GENERAL
		json_dict = {}
		json_dict["ICAO_DEP"] = self.getXMLData('origin__icao_code')
		json_dict["IATA_DEP"] = self.getXMLData('origin__iata_code')
		json_dict["NAME_DEP"] = self.getXMLData('origin__name')
		json_dict["ICAO_ARR"] = self.getXMLData('destination__icao_code')
		json_dict["IATA_ARR"] = self.getXMLData('destination__iata_code')
		json_dict["NAME_ARR"] = self.getXMLData('destination__name')
		json_dict["CALLSIGN"] = self.getXMLData('atc__callsign')
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__sched_out')))
		json_dict["DATE_OUT_SCHED"] = t.strftime("ETD %a, %d %b")
		json_dict["TIME_OUT_SCHED"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__sched_in')))
		json_dict["DATE_IN_SCHED"] = t.strftime("ETA %a, %d %b")
		json_dict["TIME_IN_SCHED"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('params__time_generated')))
		json_dict["DISPATCH_HEADER"] = "Flight Plan ID " + self.getXMLData('params__request_id') + " <br>Dispatched by SIMBRIEF DISPATCH <br>Computed Time: " + t.strftime("%a") + " " + t.strftime("%d") + " " + t.strftime("%b") + " " + t.strftime("%Y") + " " + t.strftime("%H") + ":" + t.strftime("%M") + " UTC"

		# FLT-SUMMARY
		json_dict["CREW_CAPT"] = self.getXMLData('crew__cpt')
		json_dict["AC_ID"] = self.getXMLData('aircraft__icaocode') + " / " + self.getXMLData('aircraft__reg')
		json_dict["ROUTE"] = self.getXMLData('general__route')
		json_dict["GND_DIST"] = self.getXMLData('general__route_distance') + ' <div class="unit">NM</div>'
		json_dict["AIR_DIST"] = self.getXMLData('general__air_distance') + ' <div class="unit">NM</div>'
		json_dict["CI"] = self.getXMLData('general__costindex')
		json_dict["FUEL_FACTOR"] = self.getXMLData('aircraft__fuelfactor')
		json_dict["AVG_WC"] = "M" + self.getXMLData('general__avg_wind_comp')[1:] if int(self.getXMLData('general__avg_wind_comp')) <= 0 else ("P" + self.getXMLData('general__avg_wind_comp'))
		json_dict["ISA"] = "M" + self.getXMLData('general__avg_temp_dev')[1:] if int(self.getXMLData('general__avg_temp_dev')) <= 0 else ("P" + self.getXMLData('general__avg_temp_dev'))
		json_dict["ZFW_EST"] = self.getXMLData('weights__est_zfw') + ' <div class="unit">kg</div>'
		json_dict["TOW_EST"] = self.getXMLData('weights__est_tow') + ' <div class="unit">kg</div>'
		json_dict["LDW_EST"] = self.getXMLData('weights__est_ldw') + ' <div class="unit">kg</div>'
		json_dict["ALTN"] = self.getXMLData('alternate__icao_code') + " / " + self.getXMLData('alternate__iata_code')
		json_dict["STEP_CLIMB"] = self.getXMLData('general__stepclimb_string')
		json_dict["DISPATCH_REMARKS"] = "NIL"
		json_dict["CREW_DX"] = self.getXMLData('crew__dx').title()
		json_dict["CREW_FO"] = self.getXMLData('crew__fo').title()
		json_dict["CREW_PU"] = self.getXMLData('crew__pu').title()
		json_dict["CREW_FA"] = "<br>".join(self.getXMLData('crew__fa')).title()

		# TIME-SUMMARY
		json_dict["TIME_UTC_OFF_DEP"] = self.getXMLData('times__orig_timezone')
		json_dict["TIME_UTC_OFF_ARR"] = self.getXMLData('times__dest_timezone')
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__sched_off')))
		json_dict["TIME_OFF_SCHED"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__sched_on')))
		json_dict["TIME_ON_SCHED"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__est_out')))
		json_dict["TIME_OUT_EST"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__est_off')))
		json_dict["TIME_OFF_EST"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__est_on')))
		json_dict["TIME_ON_EST"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		t = datetime.datetime.utcfromtimestamp(int(self.getXMLData('times__est_in')))
		json_dict["TIME_IN_EST"] = t.strftime("%H:%M") + ' <div class="unit">UTC</div>'
		json_dict["TIME_IMPACTS_WEIGHT_UP"] = int(int(self.getXMLData('impacts__zfw_plus_1000__time_difference')) / 60)
		json_dict["TIME_IMPACTS_WEIGHT_DN"] = int(int(self.getXMLData('impacts__zfw_minus_1000__time_difference')) / 60)
		json_dict["TIME_IMPACTS_FL_UP"] = int(int(self.getXMLData('impacts__plus_2000ft__time_difference')) / 60)
		json_dict["TIME_IMPACTS_FL_DN"] = int(int(self.getXMLData('impacts__minus_2000ft__time_difference')) / 60)
		json_dict["TIME_IMPACTS_CI_DN"] = int(int(self.getXMLData('impacts__lower_ci__time_difference')) / 60)
		json_dict["TIME_IMPACTS_CI_UP"] = int(int(self.getXMLData('impacts__higher_ci__time_difference')) / 60)

		# WEIGHT-SUMMARY
		json_dict["WEIGHT_MAX_TOW"] = self.getXMLData('weights__max_tow') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_MAX_LDW"] = self.getXMLData('weights__max_ldw') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_MAX_ZFW"] = self.getXMLData('weights__max_zfw') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_MAX_FUEL"] = self.getXMLData('fuel__max_tanks') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_RAMP"] = self.getXMLData('fuel__plan_ramp') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_BURN"] = self.getXMLData('fuel__enroute_burn') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_CONT"] = self.getXMLData('fuel__contingency') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_ALTN"] = self.getXMLData('fuel__alternate_burn') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_RES"] = self.getXMLData('fuel__reserve') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_MIN"] = self.getXMLData('fuel__min_takeoff') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_EXT"] = self.getXMLData('fuel__extra') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_TO"] = self.getXMLData('fuel__plan_takeoff') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_TAXI"] = self.getXMLData('fuel__taxi') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_FIN"] = str(int(self.getXMLData('fuel__reserve')) + int(self.getXMLData('fuel__alternate_burn'))) + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_FUEL_AVG_FLOW"] = self.getXMLData('fuel__avg_fuel_flow') + ' <div class="unit">kg/h</div>'
		json_dict["WEIGHT_PAX"] = self.getXMLData('weights__pax_count')
		json_dict["WEIGHT_BAG"] = self.getXMLData('weights__bag_count')
		json_dict["WEIGHT_PAX_W"] = self.getXMLData('weights__pax_weight') + ' <div class="unit">kg/pax</div>'
		json_dict["WEIGHT_BAG_W"] = self.getXMLData('weights__bag_weight') + ' <div class="unit">kg/bag</div>'
		json_dict["WEIGHT_CARGO"] = self.getXMLData('weights__cargo') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_PAYLOAD"] = self.getXMLData('weights__payload') + ' <div class="unit">kg</div>'
		json_dict["WEIGHT_IMPACTS_WEIGHT_UP"] = int(int(self.getXMLData('impacts__zfw_plus_1000__burn_difference')) / 60)
		json_dict["WEIGHT_IMPACTS_WEIGHT_DN"] = int(int(self.getXMLData('impacts__zfw_minus_1000__burn_difference')) / 60)
		json_dict["WEIGHT_IMPACTS_FL_UP"] = int(int(self.getXMLData('impacts__plus_2000ft__burn_difference')) / 60)
		json_dict["WEIGHT_IMPACTS_FL_DN"] = int(int(self.getXMLData('impacts__minus_2000ft__burn_difference')) / 60)
		json_dict["WEIGHT_IMPACTS_CI_DN"] = int(int(self.getXMLData('impacts__lower_ci__burn_difference')) / 60)
		json_dict["WEIGHT_IMPACTS_CI_UP"] = int(int(self.getXMLData('impacts__higher_ci__burn_difference')) / 60)

		# ALTN-SUMMARY
		json_dict["ALTN_FL"] = "FL" + self.getXMLData('alternate__cruise_altitude')[0:3] if len(self.getXMLData('alternate__cruise_altitude')) > 4 else "FL0" + self.getXMLData('alternate__cruise_altitude')[0:1]
		json_dict["ALTN_DIST"] = self.getXMLData('alternate__distance')
		json_dict["ALTN_WIND"] = self.getXMLData('alternate__avg_wind_comp')
		json_dict["ALTN_FUEL"] = self.getXMLData('alternate__burn')
		json_dict["ALTN_ROUTE"] = self.getXMLData('alternate__route')

		# DISPATCH-WX
		json_dict["DISPATCH_METAR_DEP"] = self.getXMLData('weather__orig_metar')
		json_dict["DISPATCH_TAF_DEP"] = self.getXMLData('weather__orig_taf')
		json_dict["DISPATCH_METAR_ARR"] = self.getXMLData('weather__dest_metar')
		json_dict["DISPATCH_TAF_ARR"] = self.getXMLData('weather__dest_taf')
		json_dict["DISPATCH_METAR_ALTN"] = self.getXMLData('weather__altn_metar')
		json_dict["DISPATCH_TAF_ALTN"] = self.getXMLData('weather__altn_taf')
		json_dict["DISPATCH_ENROUTE_ALT"] = self.getXMLData('navlog__fix__wind_data__level__altitude')
		json_dict["DISPATCH_ENROUTE_WIND_DIR"] = self.getXMLData('navlog__fix__wind_data__level__wind_dir')
		json_dict["DISPATCH_ENROUTE_WIND_SPD"] = self.getXMLData('navlog__fix__wind_data__level__wind_spd')
		json_dict["DISPATCH_ENROUTE_OAT"] = self.getXMLData('navlog__fix__wind_data__level__oat')

		# DISPATCH-WX-IMG
		json_dict["DISPATCH_IMG_DIR"] = self.getXMLData('images__directory')
		json_dict["DISPATCH_IMG_NAME"] = self.getXMLData('images__map__name')
		json_dict["DISPATCH_IMG_LINK"] = self.getXMLData('images__map__link')

		# NOTAMS
		json_dict["NOTAM_DEP_ID"] = self.getXMLData('origin__notam__notam_id')
		json_dict["NOTAM_DEP_DATE_EFF"] = self.getXMLData('origin__notam__date_effective')
		json_dict["NOTAM_DEP_DATE_EXP"] = self.getXMLData('origin__notam__date_expire')
		json_dict["NOTAM_DEP_HTML"] = self.getXMLData('origin__notam__notam_html')
		json_dict["NOTAM_ARR_ID"] = self.getXMLData('destination__notam__notam_id')
		json_dict["NOTAM_ARR_DATE_EFF"] = self.getXMLData('destination__notam__date_effective')
		json_dict["NOTAM_ARR_DATE_EXP"] = self.getXMLData('destination__notam__date_expire')
		json_dict["NOTAM_ARR_HTML"] = self.getXMLData('destination__notam__notam_html')
		json_dict["NOTAM_ALTN_ID"] = self.getXMLData('alternate__notam__notam_id')
		json_dict["NOTAM_ALTN_DATE_EFF"] = self.getXMLData('alternate__notam__date_effective')
		json_dict["NOTAM_ALTN_DATE_EXP"] = self.getXMLData('alternate__notam__date_expire')
		json_dict["NOTAM_ALTN_HTML"] = self.getXMLData('alternate__notam__notam_html')

		# MAP
		json_dict["MAP_IDENT"] = self.getXMLData('navlog__fix__ident')
		json_dict["MAP_TYPE"] = self.getXMLData('navlog__fix__type')
		json_dict["MAP_LAT"] = self.getXMLData('navlog__fix__pos_lat')
		json_dict["MAP_LONG"] = self.getXMLData('navlog__fix__pos_long')
		json_dict["MAP_AIRWAY"] = self.getXMLData('navlog__fix__via_airway')
		json_dict["MAP_FL"] = self.getXMLData('navlog__fix__altitude_feet')
		json_dict["MAP_HEADING"] = [str(m)+'/'+str(n) for m,n in zip(self.getXMLData('navlog__fix__heading_mag'), self.getXMLData('navlog__fix__heading_true'))]
		json_dict["MAP_WC"] = self.getXMLData('navlog__fix__wind_component')
		json_dict["MAP_SHEAR"] = self.getXMLData('navlog__fix__shear')
		json_dict["MAP_FUEL"] = self.getXMLData('navlog__fix__fuel_plan_onboard')
		json_dict["MAP_FIR"] = self.getXMLData('navlog__fix__fir')
		json_dict["MAP_MACH"] = self.getXMLData('navlog__fix__mach')
		json_dict["MAP_TIME_TOT"] = self.getXMLData('navlog__fix__time_total')
		json_dict["MAP_OFF_EST"] = self.getXMLData('times__est_off')

		return jsonify(json_dict)