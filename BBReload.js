function BBLoadScript() {
    var jA = document.createElement('script');
			jA.setAttribute('id', 'BeachBallSource');
            jA.setAttribute('type', 'text/javascript');
            jA.setAttribute('src', 'https://raw.github.com/Xenko/BeachBall/beta/BeachBall.js');
    
    setTimeout(function() {document.body.appendChild(jA);}, 1000);
}

function BBDoReload() {
	$('#BeachBallSource').remove();
	$('#BeachBall').remove()
    BBLoadScript();
}

$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BBDoReload()"> <h4>Reload BeachBall</h4> </a></div>');