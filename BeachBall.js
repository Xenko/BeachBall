//v1.0 as Starting Point
//v2.0 Cleaning up code. Setting up Menu Structure

//Declare and Initialize Variables
var AudioAlertsStatus = 0;
var audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	audio_Bell.volume=1;
var audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	audio_Chime.volume=1;
var description = "Error";
var i = 0;
var IdleStatus = 0;
var incoming_ONG = 0;
var NinjaAutoClickStatus = 0;
var RKAutoClickStatus = 0;
var RKAlertFrequency = 8;
var Time_to_ONG = 1800000;

//Ninja AutoClicker and Border Warnings
function Ninja() {
    if (Molpy.ninjad == 0) {
        if (Molpy.npbONG == 0) {
			$("#beach").css("border","4px solid red");
        }
        else {
            incoming_ONG = 0;
            if (NinjaAutoClickStatus == 1) {
                Molpy.ClickBeach();
                $("#beach").css("border","4px solid white");
                KeepBlue = 1;
            }
            else {
            $("#beach").css("border","4px solid green");
            }

        }
	}
    else if (Time_to_ONG <= 15000) {
        $("#beach").css("border","4px solid yellow");
            if (incoming_ONG == 0 && (AudioAlertsStatus == 3 || AudioAlertsStatus == 4)) {
                audio_Chime.play();
                incoming_ONG = 1;
            }  
    }
    else {
        $("#beach").css("border","1px solid white");
	}
}

function RedundaKitty() {
	i = Molpy.redactedToggle - Molpy.redactedCountup;
	
	if (Molpy.redactedVisible > 0) { 
		//Clicks if AutoClicker Enabled
		if (RKAutoClickStatus == 1) {
			Molpy.ClickRedacted();
		}
	
		else {
			//Redundakitty Notifications (Title Bar and Audio)
			document.title = "! kitten !";
			if (Math.floor(i % RKAlertFrequency) == 0) {
				audio_Bell.play();
			}
		}
	}
	else {
		document.title = Molpy.redactedToggle-Molpy.redactedCountup;
		if (i != 0) { i = 0; }
	}
}

function SwitchOption(option) {
	switch (option) {
		case 'RKAutoClick':
			RKAutoClickStatus++;
			if (RKAutoClickStatus > 1) {RKAutoClickStatus = 0};
			status = RKAutoClickStatus;
			break;
		case 'NinjaAutoClick':
			NinjaAutoClickStatus++;
			if (NinjaAutoClickStatus > 1) {NinjaAutoClickStatus = 0};
			status = NinjaAutoClickStatus;
			break;
		case 'AudioAlerts':
			AudioAlertsStatus++;
			if (AudioAlertsStatus > 3) {AudioAlertsStatus = 0};
			status = AudioAlertsStatus;
			break;
	}
	DisplayDescription(option, status);
}

function DisplayDescription(option, status) {
	if (option == 'RKAutoClick' || option == 'NinjaAutoClick') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'On';}
		else {Molpy.Notify('Display Description Error',1);}
	}
	if (option == 'AudioAlerts') {
		//Molpy.Notify(isNaN(status),1);
		switch (status) {
			case 0:
				description = 'Off';
				break;
			case 1:
				description = 'RK Only';
				break;
			case 2:
				description = 'ONG Only';
				break;
			case 3:
				description = 'RK and ONG';
				break;
			default:
				Molpy.Notify('Display Description Error - Audio Alerts: ' + status,1);
		}
	}
	g(option + 'Desc').innerHTML = '<br>' + description;
}

//Beach Ball Startup
//Set Settings
if (Molpy.Got('Kitnip') == 1){RKAlertFrequency = 10;}

//Create Menu
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'RKAutoClick\')"> <h4>RK Auto Click</h4> </a> <div id="RKAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'NinjaAutoClick\')"> <h4>Ninja Auto Click</h4> </a> <div id="NinjaAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'AudioAlerts\')"> <h4>Audio Alerts</h4> </a> <div id="AudioAlertDesc"></div></div>');
DisplayDescription('RKAutoClick', RKAutoClickStatus);
DisplayDescription('NinjaAutoClick', NinjaAutoClickStatus);
DisplayDescription('AudioAlerts', AudioAlertsStatus);
	
//Main Loop
setInterval(function() {
	Time_to_ONG = (Molpy.NPlength * 1000) - Molpy.ONGelapsed;
    RedundaKitty();
    Ninja();
}, 1800);
