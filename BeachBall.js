//v1.0 as Starting Point
//v2.0 Cleaning up code. Setting up Menu Structure

$('#sectionControls').append('<a class="minifloatbox"><h4>BeachBall</h4></a>');

var IdleStatus = prompt("Set to idle? (1 = Yes, 0 = No)","0");

var RKAutoClickStatus = 0;
var NinjaAutoClickStatus = 0;

if (IdleStatus == 1) {
	var RKAutoClickStatus = 1;
    var NinjaAutoClickStatus = 1;
}

//Sets Redundakitty audio frequency to every 8 or 10 seconds, depending on Redudakitty length (24 or 30 seconds).
var Kitty_Audio_Frequency = 8;
if (Molpy.Got('Kitnip') == 1){
	var Kitty_Audio_Frequency = 10;
}

var i = 0;
var Time_to_ONG = 1800000;
var audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
audio_Chime.volume=1;

var incoming_ONG = 0;
var audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
audio_Bell.volume=1;

var KeepBlue = 0;

setInterval(function() {
    
    //Redundakitty Notifications and Auto-Clicker
    if (Molpy.redactedVisible > 0) {
        i = Molpy.redactedToggle - Molpy.redactedCountup;
        
            
        //Redundakitty Auto-Clicker or Audio-Notification
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
    
    
}, 1800);