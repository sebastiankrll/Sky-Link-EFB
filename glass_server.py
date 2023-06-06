from flask import Flask, jsonify, render_template, request, redirect, url_for
from SimBrief.SimBrief import SimBrief
from SimConnect import *
from xml.etree import ElementTree


app = Flask(__name__)

# Init global variables


# Connect to sim
sm = SimConnect(False)
aq = AircraftRequests(sm, _time=10)
sb = SimBrief()


# Init variables that need to be synchronized locally for duration thread

temp_local_storage = {
	'time_mode': False,
	'atis_info': '',
	'atc_clr': '',
	'out_time': '',
	'off_time': '',
	'on_time': '',
	'in_time': '',
	'delay': '',
	'tow': '',
	'ldw': '',
	'zfw': '',
	'fuel': '',
	'extra_fuel': '',
	'act_pax': '',
	'act_cargo': '',
	'extra_freight': '',
	'journey_author': '',
	'journey_unsched': False,
	'journey_training': False,
	'pilot_toff': '',
	'pilot_cruise': '',
	'time_cruise': '',
	'pilot_land': '',
	'incident_type': '',
	'incident_rmks': '',
	'flt_summary': True,
	'flt_time': False,
	'flt_weight': False,
	'flt_altn': False,
	'flt_log': False,
	'dis_wx_dep': False,
	'dis_wx_enr': False,
	'dis_wx_arr': False,
	'dis_wx_altn': False,
	'dis_wx_chart': False,
	'notam_dep': False,
	'notam_dest': False,
	'notam_altn': False
}

# Init datasets for http requests
sim_request_location = [
	'PLANE_ALTITUDE',
	'PLANE_LATITUDE',
	'PLANE_LONGITUDE',
	'MAGNETIC_COMPASS'
]

# Main html template
@app.route('/')
def glass():
	return render_template("index.html")

# Send simconnect status to JS
@app.route('/simconnect/status/', methods=["GET"])
def output_simconnect_status():
	json_dict = {}
	if not sm.status:
		sm.connect()

	if sm.status:
		json_dict["STATUS"] = 'Sim connected'
	else:
		json_dict["STATUS"] = 'Sim not found'

	return jsonify(json_dict)

# Send simbrief status to JS
@app.route('/simbrief/status/', methods=["GET"])
def output_simbrief_status():
	json_dict = {}
	json_dict["STATUS"] = sb.status
	json_dict["USER_ID"] = sb.user

	return jsonify(json_dict)

# Dataset selector
def get_dataset(data_type):
	
	if data_type == "simconnect_location": request_to_action = sim_request_location
	if data_type == "temp_local": request_to_action = temp_local_storage

	return request_to_action

# Send datasets from Python to JS
@app.route('/datasets/<dataset_name>/', methods=["GET"])
def output_json_dataset(dataset_name):
	dataset_map = {}
	checksum = dataset_name.split('_')[0]

	if checksum == 'simbrief':
		return sb.get()

	if checksum == 'simconnect':
		data_dictionary = get_dataset(dataset_name)
		if sm.quit == 1:
			sm.status = False
		else:
			for datapoint_name in data_dictionary:
				dataset_map[datapoint_name] = aq.get(datapoint_name)

		return jsonify(dataset_map)

	if checksum == 'temp':
		data_dictionary = get_dataset(dataset_name)
		return data_dictionary

# Send datapoint from JS to Python
@app.route('/datapoint/<datapoint_name>/set', methods=["POST"])
def set_datapoint_endpoint(datapoint_name):

	ds = request.get_json() if request.is_json else request.form
	if datapoint_name == "userid":
		sb.user = ds.get('value_to_use')
		sb.fetch()

	return redirect(url_for('glass'))

# Send local variable from JS to Python
@app.route('/local/<datapoint_name>/set', methods=["POST"])
def set_local_variable(datapoint_name):

	ds = request.get_json() if request.is_json else request.form
	temp_local_storage[datapoint_name] = ds.get('value_to_use')
	print(temp_local_storage)

	return redirect(url_for('glass'))



# Main loop to run the flask app
app.run(host='0.0.0.0', port=5000, debug=True)