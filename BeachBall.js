//v1.0 as Starting Point
//v2.0 Cleaning up code. Setting up Menu Structure

//Declare and Initialize Variables
var audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	audio_Bell.volume=1;
var audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	audio_Chime.volume=1;
var description = "Error";
var i = 0;
var IdleStatus = 0;
var incoming_ONG = 0;
var KeepBlue = 0;
var NinjaAutoClickStatus = 0;
var RKAutoClickStatus = 0;
var RKAlertFrequency = 8;
var Time_to_ONG = 1800000;

function Ninja() {
	//Ninja Warnings and Incoming ONG Warning
    Time_to_ONG = (Molpy.NPlength * 1000) - Molpy.ONGelapsed;
	if (Molpy.ninjad == 0) {
        if (Molpy.npbONG == 0) {
			$("#beach").css("border","4px solid red");
        }
        else {
            incoming_ONG = 0;
            if (NinjaAutoClickStatus == 1) {
                Molpy.ClickBeach();
                $("#beach").css("border","4px solid blue");
                KeepBlue = 1;
            }
            else {
            $("#beach").css("border","4px solid green");
            }

        }
	}
    else if (Time_to_ONG <= 15000) {
        $("#beach").css("border","4px solid yellow");
            if (incoming_ONG == 0) {
                audio_Chime.play();
                incoming_ONG = 1;
            }  
    }
    else if (KeepBlue == 0) {
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
			if (RKAutoClickStatus > 2) {RKAutoClickStatus = 0};
			status = RKAutoClickStatus;
		break;
	}
	WriteOptionDescription(option, status);
}

function DisplayDescription(option, status) {
	Molpy.Notify('RKAC: ' + option + ' ' + status,1);
	if (option == 'RKAutoClick') {
			switch (status) {
					case 1:
						description = 'On';
						Molpy.Notify(description,1);
						break;
					case 0:
						description = 'Off';
						Molpy.Notify(description,1);
						break;
			}
	}
	g(option + 'Desc').innerHTML = '<br>' + description;
}

//Beach Ball Startup
	//Set Settings
	IdleStatus = prompt("Set to idle? (1 = Yes, 0 = No)");
	RKAutoClickStatus = IdleStatus;
	NinjaAutoClickStatus = IdleStatus;
	if (Molpy.Got('Kitnip') == 1){RKAlertFrequency = 10;}
	
	//Create Menu
	$('#optionsItems').append('<div class="minifloatbox"> <a onclick="SwitchOption(\'RKAutoClick\')"> <h4>RK Auto Click</h4> </a> <div id="RKAutoClickDesc"></div></div>');
	Molpy.Notify('RKAC: ' + RKAutoClickStatus,1);
	DisplayDescription('RKAutoClick',RKAutoClickStatus);
	
//Main Loop
setInterval(function() {
    RedundaKitty();
    Ninja();
	//Molpy.Notify('abc321', 1);
}, 1800);

/*var BeachBall = {};

BeachBall.WriteMessage = function () {
	Molpy.Notify('abc123 function', 1);
	alert("WriteMessage Called");
}

function WMT () {
	Molpy.Notify('abc321 in WMT', 1);
}

Molpy.Notify('abc123', 1);
BeachBall.WriteMessage();
WMT();*/
