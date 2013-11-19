var version = '3.0 Beta';
var SCBversion = '3.07'; //Last SandCastle Builder version tested

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
var refreshRate = 1000;
var RKAlertFrequency = 8;
var RKAutoClickStatus = 1;
var RKPlayAudio = 1;

//RK Variables
var start = -1;
var content = "empty";
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

function BClick(){
	if (Molpy.Got('Temporal Rift') && Molpy.Boosts['Temporal Rift'].countdown < 5){
		//Do Nothing to avoid temporal rift
	}
	else {
		Molpy.ClickBeach();
	}	
}

function Ninja() {
    if (Molpy.ninjad == 0) {
        if (Molpy.npbONG == 0 && BorderAlertStatus == 1) {
			$("#beach").css("border","4px solid red");
        }
        else {
            incoming_ONG = 0;
            if (NinjaAutoClickStatus == 1) {
				BClick();
				Molpy.Notify('Ninja Auto Click', 1);
				if (BorderAlertStatus == 1) {
					$("#beach").css("border","2px solid green");
				}
            }
            else if (BorderAlertStatus == 1) {
            $("#beach").css("border","4px solid blue");
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
        $("#beach").css("border","2px solid green");
	}
}

function ToggleMenus(wantOpen) {
	for (i=0, len = lootBoxes.length; i < len; i++) {
		if (lootBoxes[i] == wantOpen) {
			if (Molpy.options.showhide[lootBoxes[i]] != 1) {
				showhideToggle(lootBoxes[i]);
			}
		}
		else {
			if (Molpy.options.showhide[lootBoxes[i]]) {
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
	
	//Determines RK location
	RKLocation = '123';
	if (Molpy.redactedVisible == 6) {
		RKLocation = 'badgesav';
	}
	else if (Molpy.redactedVisible > 3) {
		RKLocation = Molpy.redactedGr;
	}
	
	//Opens RK location
	ToggleMenus(RKLocation);
	
	//Resets old RK variables
	oldRKLocation = Molpy.redactedVisible;
	oldRC = Molpy.redactedClicks;
	oldLC = Molpy.Boosts['Logicat'].power;
}

function ManualRKClick() {

}

function RedundaKitty() {
	//Refresh Timer Variable
	RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;
	
	//If a RedundaKitty is active
	if (Molpy.redactedVisible > 0) {
	
		//Checks if RK is new
		if (RKNew == 1 || Molpy.redactedVisible != oldRKLocation || Molpy.redactedClicks > oldRC || Molpy.Boosts['Logicat'].power != oldLC) {
			RKNewAudio = 1;
			RKNew = 0;
			//Finds RK if appropriate BeachBall option enabled
			if (RKAutoClickStatus > 0) {	
				FindRK();
			}
		}
		
		//Determines if it is an RK or LC
		//If RK is visible
		if ($('#redacteditem').length) {
			$('#redacteditem').css("border","2px solid red"); //Highlights RK
			content = $('#redacteditem').html();
			//If RK contains word statement, it is a LC.
			if (content.indexOf("statement") !== -1) {
				Logicat = 1;
			}
			//Otherwise it is an RK
			else {
				Logicat = 0;
				if (content.indexOf("Show") != -1) {
					start = content.indexOf("Show");
					content = content.substring(start+15,start+38);
					content = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
					len = content.length;
					RKLevel = content.substring(18,len);
					//Molpy.Notify('RedundaKitty Level is: ' + RKLevel, 1);
				}
				else {
					start = content.indexOf("iframe src=");
					content = content.substring(start-40,start-16);
					content = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
					len = content.length;
					RKLevel = content.substring(18,len);
					//Molpy.Notify('YT RedundaKitty Level is: ' + RKLevel, 1);
				}
			}
		}
		//If RK not visible, LC to 99.
		else {
			Logicat = 99;
		}

		//Clicks RK if AutoClick Enabled
		if (RKAutoClickStatus == 2 && Logicat == 0 ) {
			Molpy.ClickRedacted(RKLevel);
			RKNew = 1;
			RKLocation = '123';
			ToggleMenus('123');
		}
		//Solves LC if AutoClick enabled
		else if (Logicat == 1 && LCAutoClickStatus == 1) {
			SolveLogicat();
			RKNew = 1;
			RKLocation = '123';
			ToggleMenus('123');
		}

		//Redundakitty Notifications for Manual Clicking (Title Bar, Audio)
		else {	
			document.title = "! kitten !";
			//If RK Audio Alerts Enabled
			if (AudioAlertsStatus == 1 || AudioAlertsStatus == 3) {
				//If proper mNP and hasn't yet played this mNP
				if (Math.floor(RKTimer % RKAlertFrequency) == 0 && RKPlayAudio == 1) {
					audio_Bell.play();
					RKPlayAudio = 0;
				}
				else {
					RKPlayAudio = 1;
				}
			}
		}
	}	
	//If no RK active, update title Timer. Reset some variables.
	else {
		document.title = RKTimer;
		oldRKLocation = -1;
		RKNew = 1;
		RKPlayAudio = 0;
	}
}

function SolveLogicat() {
	var i = 65;
	do 
		{LCSolution = String.fromCharCode(i);
		i++;}
	while (Molpy.redactedPuzzleTarget != Molpy.redactedSGen.StatementValue(LCSolution));
	Molpy.ClickRedactedPuzzle(LCSolution);
}

function SwitchOption(option) {
	switch (option) {
		case 'RKAutoClick':
			RKAutoClickStatus++;
			if (RKAutoClickStatus > 2) {RKAutoClickStatus = 0;}
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
		case 'RefreshRate':
			newRate = parseInt(prompt('Please enter your desired BeachBall refresh rate in milliseconds (500 - 3600):', refreshRate));
			if (newRate < 500 || newRate > 3600 || isNaN(newRate)){
				Molpy.Notify('Invalid Refresh Rate', 1);
			}
			else {
				refreshRate = newRate;
			}
			break;
	}
	DisplayDescription(option, status);
}

function DisplayDescription(option, status) {
	error = 0;
	if (option == 'LCAutoClick' || option == 'NinjaAutoClick' || option == 'BorderAlert') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'On';}
		else {Molpy.Notify('Display Description Error', 1);}
	}
	else if (option == 'AudioAlerts') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'RK Only'; RKPlayAudio = 1;}
		else if (status == 2) {description = 'ONG Only';}
		else if (status == 3) {description = 'RK and ONG'; RKPlayAudio = 1;}
		else {Molpy.Notify('Display Description Error - Audio Alerts: ' + status, 1);}
	}
	else if (option == 'RKAutoClick') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'Find RK Only'; RKNew = 1;}
		else if (status == 2) {description = 'On'; RKNew = 1;}
		else {Molpy.Notify('Display Description Error - RKAutoClick: ' + status, 1);}
	}
	else if (option == 'RefreshRate') {
		description = refreshRate;
	}
	else {
		Molpy.Notify(option + ' is not a valid option.', 1);
		error = 1;
	}
		
	if (error == 0) {g(option + 'Desc').innerHTML = '<br>' + description;}
}

//Beach Ball Startup
//Set Settings
if (Molpy.Got('Kitnip') == 1){RKAlertFrequency = 10;}

//Create Menu
$('#optionsItems').append('<br> <br> <div class="minifloatbox"> <h3 style="font-size:150%; color:red">BeachBall Settings</h3> <h4 style"font-size:75%">v ' + version + '</div> <br>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'RKAutoClick\')"> <h4>Redundakitty Auto Click</h4> </a> <div id="RKAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'LCAutoClick\')"> <h4>Logicat Auto Click</h4> </a> <div id="LCAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'NinjaAutoClick\')"> <h4>Ninja Auto Click</h4> </a> <div id="NinjaAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'BorderAlert\')"> <h4>Ninja Visual Alert</h4> </a> <div id="BorderAlertDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'AudioAlerts\')"> <h4>Audio Alerts</h4> </a> <div id="AudioAlertsDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'RefreshRate\')"> <h4>Refresh Rate</h4> </a> <div id="RefreshRateDesc"></div></div>');
//$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SpawnRK()"> <h4>Spawn RK</h4> </a></div>');
//$('#optionsItems').append('<div class="minifloatbox"> <a onclick="ExtendRK()"> <h4>Extend RK</h4> </a></div>');
DisplayDescription('RKAutoClick', RKAutoClickStatus);
DisplayDescription('LCAutoClick', LCAutoClickStatus);
DisplayDescription('NinjaAutoClick', NinjaAutoClickStatus);
DisplayDescription('BorderAlert', BorderAlertStatus);
DisplayDescription('AudioAlerts', AudioAlertsStatus);
DisplayDescription('RefreshRate', refreshRate);

Molpy.Notify('BeachBall version ' + version + ' loaded for SandCastle Builder version ' + SCBversion, 1);
Molpy.Notify('You have ' + items + ' items', 1);
Loop();

function MainProgram() {
	Time_to_ONG = (Molpy.NPlength * 1000) - Molpy.ONGelapsed;
	RedundaKitty();
	Ninja();
	Loop();
}

function Loop() {
	setTimeout(MainProgram, refreshRate);
}
/*
function SpawnRK() {
	Molpy.redactedCountup = Molpy.redactedToggle - 1;
}

function ExtendRK() {
	Molpy.redactedCountup = 1;
}
*/
