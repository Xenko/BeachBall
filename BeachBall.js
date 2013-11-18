//v1.0 as Starting Point
//v2.0 Cleaning up code. Setting up Menu Structure and Initial Settings.

var version = '2.0 Beta';
var SCBversion = '3.021'; //Last SandCastle Builder version tested

//Declare and Initialize Variables
var incoming_ONG = 0;
var NinjaAutoClickStatus = 1;
var Time_to_ONG = 1800000;
var lootBoxes = ['boosts', 'ninj', 'cyb', 'hpt', 'bean', 'chron', 'badges', 'badgesav'];

//BB Options Variables
var AudioAlertsStatus = 3;
var audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	audio_Bell.volume = 1;
var audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	audio_Chime.volume = 1;
var BorderAlertStatus = 1;
var description = "Error";
var IdleStatus = 0;
var RKAlertFrequency = 8;
var RKAutoClickStatus = 0;

//RK Variables
var start = -1;
var content = "empty";
var findLocation = '123';
var LCAutoClickStatus = 0;
var LCSolution = 'blank';
var len = 0;
var Logicat = 0;
var oldRKLocation = -1;
var oldRC = Molpy.redactedClicks - 1;
var oldLC = Molpy.Boosts['Logicat'].power - 1;
var RKLevel = '-1';
var RKLocation = '123';
var RKNew = 1;
var RKNewAudio = 1;
var RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;

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

function ToggleMenus(wantOpen) {
	for (i=0, len = lootBoxes.length; i < len; i++) {
		if (lootBoxes[i] == wantOpen) {
			if (!Molpy.options.showhide(lootBoxes[i])) {
				showhideToggle(lootBoxes[i]);
			}
		}
		else {
			if (Molpy.options.showhide(lootBoxes[i]){
				showhideToggle(lootBoxes[i]);
			}
		}
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
	
	//Determines RK location, does nothing for locations 1, 2 or 3
	Molpy.Notify('FindRK Run', 1);
	findLocation = '123';
	if (Molpy.redactedVisible == 4) {
		findLocation = Molpy.redactedGr;
	}
	else if (Molpy.redactedVisible == 5) {
		findLocation = 'badges';
	}
	else if (Molpy.redactedVisible == 6) {
		findLocation = 'badgesav';
	}
	
	//Opens RK location if not already open
	if (findLocation != '123' && !Molpy.options.showhide[findLocation]) {
		showhideToggle(findLocation);
	}
	
	//Resets old RK variables
	oldRKLocation = Molpy.redactedVisible;
	oldRC = Molpy.redactedClicks;
	oldLC = Molpy.Boosts['Logicat'].power;
	return findLocation;
}

function RedundaKitty() {
	//Refresh Timer Variable
	RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;
	RKLocation = '123';
	
	//If a RedundaKitty is available
	if (Molpy.redactedVisible > 0) {
	
		//If RK is new, find it.
		if (RKNew == 1 || Molpy.redactedVisible != oldRKLocation || Molpy.redactedClicks > oldRC || Molpy.Boosts['Logicat'].power != oldLC) {
			RKLocation = FindRK();
			RKNewAudio = 1;
			RKNew = 0;
		}
		
		//Determines if it is an RK or LC, and also highlights it
		Molpy.Notify($('#redacteditem').length, 1);
		if ($('#redacteditem').length) {
			$('#redacteditem').css("border","2px solid red");
			content = $('#redacteditem').html();
			if (content.indexOf("statement") !== -1) {
				Logicat = 1;
			}	
			else {
				Logicat = 0;
				start = content.indexOf("ClickRedacted");
				content = content.substring(start,start+17);
				content = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
				len = content.length;
				RKLevel = content.substring(13,len);
				if (RKLevel != 1) {
					Molpy.Notify('RedundaKitty Level is: ' + RKLevel, 1);
				}
			}
		}
		else {
			Molpy.Notify('RedundaKitty/Logicat Not Found', 1);
			Logicat = 99;
		}
			
		//Clicks RK if AutoClick Enabled
		if (RKAutoClickStatus == 1 && Logicat == 0 ) {
			Molpy.ClickRedacted(RKLevel);
			RKNew = 1;
			if (RKLocation != '123') {
				showhideToggle(RKLocation);
				RKLocation = '123';
			}
		}
		//Solves and Click LC if AutoClick Enabled
		else if (LCAutoClickStatus == 1 && Logicat == 1) {
			Logicat();
			RKNew = 1;
			if (RKLocation != '123') {
				showhideToggle(RKLocation);
				RKLocation = '123';
			}
		}
		//Redundakitty Notifications for Manual Clicking (Title Bar, Audio)
		else {	
			document.title = "! kitten !";
			if (Math.floor(RKTimer % RKAlertFrequency) == 0 && (AudioAlertsStatus == 1 || AudioAlertsStatus == 3)) {
				audio_Bell.play();
			}
		}
	}
	else {
		document.title = RKTimer;
		oldRKLocation = -1;
		if (RKNew != 1) {
			RKNew = 1;
		}
	}
}

function Logicat() {
	var i = 65;
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
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="ToggleMenus(\'boosts\')"> <h4>Spawn RK</h4> </a></div>');
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

//Run Main Loop after 1 second startup delay
setTimeout(MainLoop, 1000);

function SpawnRK() {
	Molpy.redactedCountup = Molpy.redactedToggle - 1;
}

