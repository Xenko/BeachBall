//v1.0 as Starting Point
//v2.0 Cleaning up code. Setting up Menu Structure and Initial Settings.

var version = '2.0 Beta';
var SCBversion = '3.021'; //Last SandCastle Builder version tested

//Declare and Initialize Variables
var AudioAlertsStatus = 3;
var audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	audio_Bell.volume = 1;
var audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	audio_Chime.volume = 1;
var BorderAlertStatus = 1;
var description = "Error";
var i = 0;
var IdleStatus = 0;
var incoming_ONG = 0;
var Logicat = 0;
var LCAutoClickStatus = 0;
var LCSolution = 'blank';
var NinjaAutoClickStatus = 1;
var RKAutoClickStatus = 0;
var RKAlertFrequency = 8;
var Time_to_ONG = 1800000;

var start = -1;
var content = "empty";
var length = 0;
var RKLevel = '-1';
var RKLocation = 'null';
var lootBoxes = new Array();
	lootBoxes[0] = 'boosts';
	lootBoxes[1] = 'ninj';
	lootBoxes[2] = 'cyb';
	lootBoxes[3] = 'hpt';
	lootBoxes[4] = 'bean';
	lootBoxes[5] = 'chron';

//Ninja AutoClicker and Border Warnings
function Ninja() {
    if (Molpy.ninjad == 0) {
        if (Molpy.npbONG == 0 && BorderAlertStatus == 1) {
			$("#beach").css("border","4px solid red");
        }
        else {
            incoming_ONG = 0;
            if (NinjaAutoClickStatus == 1) {
                Molpy.ClickBeach();
				Molpy.Notify('Ninja Auto Click', 1);
				if (BorderAlertStatus == 1) {
					$("#beach").css("border","1px solid white");
				}
            }
            else if (BorderAlertStatus == 1) {
            $("#beach").css("border","4px solid green");
            }

        }
	}
    else if (Time_to_ONG <= 15000) {
		if (BorderAlertStatus == 1) {
			$("#beach").css("border","4px solid yellow");
		}
        if (incoming_ONG == 0 && (AudioAlertsStatus == 3 || AudioAlertsStatus == 4)) {
			audio_Chime.play();
			incoming_ONG = 1;
        }  
    }
    else if (BorderAlertStatus == 1) {
        $("#beach").css("border","1px solid white");
	}
}

function FindRK() {
	/*
	RV of 1 is Sand Tools
	RV of 2 is Castle Tools
	RV of 3 is Boosts Main Page
	RV of 4 is Boosts Menus, Hill People Tech, etc.
	RV of 5 is Badges Earned
	RV of 6 is Badges Available
	*/
	
	//Determines RK location
	if (Molpy.redactedVisible == 1 || Molpy.redactedVisible == 2 || Molpy.redactedVisible == 3) {
		//Do Nothing
	}
	else if (Molpy.redactedVisible == 4) {
		location = 'null'
		i = 0;
		while (location = 'null' || i < 6) {
			Molpy.Notify(lootBoxes[i], 1)
			if ($('#' + lootboxes[i]).length) {
				showhideToggle(lootBoxes[i]);
				if ($('#redacteditem').length) {
					location = lootBoxes[i];
				}
				else {
					showhideToggle(lootBoxes[i]);
				}
			}
			i++;
			Molpy.Notify(i, 1);
		}
	}
	else if (Molpy.redactedVisible == 5) {
		location = 'badges';
	}
	else if (Molpy.redactedVisible == 6) {
		location = 'badgesav';
	}
	return location;
}

function RedundaKitty() {
	//Refresh Timer Variable
	i = Molpy.redactedToggle - Molpy.redactedCountup;
	
	//If RedundaKitty is available
	if (Molpy.redactedVisible > 0) {
		Molpy.Notify('Got Here', 0);
		RKLocation = FindRK();
		
		if (RKLocation != 'null' && RKLocation != '4' && !Molpy.options.showhide[RKLocation]) {
			showhideToggle(RKLocation);
		}
	
		//Determines if it is a Logicat or RK
		//if (RKLocation  != '4') {
			content = $('#redacteditem').html();
			if (content.indexOf("statement") !== -1) {
				Logicat = 1;
				//Molpy.Notify("Logicat Found",0);
			}	
			else {
				Logicat = 0;
				//Molpy.Notify("Redundakitty Found",0);
				start = content.indexOf("ClickRedacted");
				content = content.substring(start,start+17);
				content = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
				var length = content.length;
				RKLevel = content.substring(13,length);
				Molpy.Notify('RedundaKitty Level is: ' + RKLevel, 1);
			}
			
			//Highlights RK/LC Border to make it easier to find
			$('#redacteditem').css("border","2px solid red");
		//}
		

		//Clicks if RedundaKitty AutoClicker Enabled and Not a Logicat
		if (RKAutoClickStatus == 1 && Logicat == 0 ) {
			Molpy.ClickRedacted(RKLevel);
			if (RKLocation != 'null') {
				showhideToggle(RKLocation);
				RKLocation = 'null';
			}
		}
		else if (LCAutoClickStatus == 1 && Logicat == 1) {
			Logicat();
			if (RKLocation != 'null') {
				showhideToggle(RKLocation);
				RKLocation = 'null';
			}
		}
		else {
			//Redundakitty Notifications (Title Bar and Audio)
			document.title = "! kitten !";
			if (Math.floor(i % RKAlertFrequency) == 0 && (AudioAlertsStatus == 1 || AudioAlertsStatus == 3)) {
				audio_Bell.play();
			}
		}
	}
	else {
		document.title = Molpy.redactedToggle-Molpy.redactedCountup;
		if (i != 0) { i = 0; }
	}
}

function Logicat() {
	i = 65;
	do 
		{LCSolution = String.fromCharCode(i);
		i++;}
	while (Molpy.redactedPuzzleTarget != Molpy.redactedSGen.StatementValue(LCSolution));
	Molpy.ClickRedactedPuzzle(LCSolution);
	
	/*while (Molpy.redactedPuzzleTarget != undefined) {
		LCSolution = String.fromCharCode(i);
		if (Molpy.redactedPuzzleTarget == Molpy.redactedSGen.StatementValue(LCSolution)) {
			Molpy.ClickRedactedPuzzle(LCSolution);
			Molpy.redactedPuzzleTarget = undefined;
		}
		else {i++;}
	}*/
}

function SwitchOption(option) {
	switch (option) {
		case 'RKAutoClick':
			RKAutoClickStatus++;
			if (RKAutoClickStatus > 1) {RKAutoClickStatus = 0;}
			status = RKAutoClickStatus;
			break;
		case 'LCAutoClick':
			LCAutoClickStatus++;
			if (LCAutoClickStatus > 1) {LCAutoClickStatus = 0;}
			status = LCAutoClickStatus;
			break;
		case 'NinjaAutoClick':
			NinjaAutoClickStatus++;
			if (NinjaAutoClickStatus > 1) {NinjaAutoClickStatus = 0;}
			status = NinjaAutoClickStatus;
			break;
		case 'BorderAlert':
			BorderAlertStatus++;
			if (BorderAlertStatus > 1) {
				BorderAlertStatus = 0;
				$("#beach").css("border","1px solid white");
			}
			status = BorderAlertStatus;
			break;
		case 'AudioAlerts':
			AudioAlertsStatus++;
			if (AudioAlertsStatus > 3) {AudioAlertsStatus = 0;}
			status = AudioAlertsStatus;
			break;
	}
	DisplayDescription(option, status);
}

function DisplayDescription(option, status) {
	error = 0;
	if (option == 'RKAutoClick' || option == 'LCAutoClick' || option == 'NinjaAutoClick' || option == 'BorderAlert') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'On';}
		else {Molpy.Notify('Display Description Error',1);}
	}
	else if (option == 'AudioAlerts') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'RK Only';}
		else if (status == 2) {description = 'ONG Only';}
		else if (status == 3) {description = 'RK and ONG';}
		else {Molpy.Notify('Display Description Error - Audio Alerts: ' + status,1);}
	}
	else {
		Molpy.Notify(option + ' is not a valid option', 1);
		error = 1;
	}
		
	if (error == 0) {g(option + 'Desc').innerHTML = '<br>' + description;}
}

//Beach Ball Startup
//Set Settings
if (Molpy.Got('Kitnip') == 1){RKAlertFrequency = 10;}

//Create Menu
$('#optionsItems').append('<br> <br> <div class="minifloatbox"> <h3 style="font-size:150%; color:red">BeachBall Settings</h3> </div> <br>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'RKAutoClick\')"> <h4>Redundakitty Auto Click</h4> </a> <div id="RKAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'LCAutoClick\')"> <h4>Logicat Auto Click</h4> </a> <div id="LCAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'NinjaAutoClick\')"> <h4>Ninja Auto Click</h4> </a> <div id="NinjaAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'BorderAlert\')"> <h4>Ninja Visual Alert</h4> </a> <div id="BorderAlertDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'AudioAlerts\')"> <h4>Audio Alerts</h4> </a> <div id="AudioAlertsDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SpawnRK()"> <h4>Spawn RK</h4> </a></div>');
DisplayDescription('RKAutoClick', RKAutoClickStatus);
DisplayDescription('LCAutoClick', LCAutoClickStatus);
DisplayDescription('NinjaAutoClick', NinjaAutoClickStatus);
DisplayDescription('BorderAlert', BorderAlertStatus);
DisplayDescription('AudioAlerts', AudioAlertsStatus);



function MainLoop() {
	Molpy.Notify('BeachBall version ' + version + ' loaded for SandCastle Builder version ' + SCBversion, 1);
	setInterval(function() {
		//Molpy.Notify('1 mNP', 0);
		Time_to_ONG = (Molpy.NPlength * 1000) - Molpy.ONGelapsed;
		RedundaKitty();
		Ninja();
	}, 1800);
}

//Run Main Loop after 3 second startup delay
setTimeout(MainLoop, 3000);

function SpawnRK() {
	Molpy.redactedCountup = Molpy.redactedToggle - 5;
}

