//v1.0 as Starting Point
//v2.0 Cleaning up code. Setting up Menu Structure

//Declare and Initialize Variables
var audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	audio_Bell.volume=1;
var audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	audio_Chime.volume=1;
var i = 0;
var IdleStatus = 0;
var incoming_ONG = 0;
var KeepBlue = 0;
var Ninja AutoClickStatus = 0;
var RKAutoClickStatus = 0;
var RKAlertFrequency = 8;
var Time_to_ONG = 1800000;

//Beach Ball Startup
StartUp();

//Main Loop
setInterval(function() {
    RedundaKitty();
    Ninja();
}, 1800);

function StartUp() {
	//Create Menu
	$('#sectionControls').append('<a class="minifloatbox"><h4>BeachBall</h4></a>');
	
	//Set Settings
	IdleStatus = prompt("Set to idle? (1 = Yes, 0 = No)");
	RKAutoClickStatus = IdleStatus;
	NinjaAutoClickStatus = IdleStatus;
	if (Molpy.Got('Kitnip') == 1){RKAlertFrequency = 10;}
}

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
			if (Math.floor(i % Kitty_Audio_Frequency) == 0) {
				audio_Bell.play();
			}
		}
	}
	else {
		document.title = Molpy.redactedToggle-Molpy.redactedCountup;
		if (i != 0) { i = 0; }
	}
}


