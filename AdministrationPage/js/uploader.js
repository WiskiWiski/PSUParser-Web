/**
 * Created by WiskiW on 08.10.2017.
 */


document.getElementById("document").addEventListener("change", handleFileSelect, false);

var file;

function sendFile() {
	document.getElementById("output").innerHTML = ''
	readFileInputEventAsArrayBuffer(file, post);
}

function handleFileSelect(event) {
    file = event.target.files[0];

/*
    var xhr = new XMLHttpRequest();
    xhr.onload = xhr.onerror = function () {
        if (xhr.status === 200) {
            alert(xhr.responseText);
        } else {

            alert(xhr.responseText);
            console.log("error " + this.status);
        }
    };

    xhr.open('POST', 'https://us-central1-psu-by.cloudfunctions.net/psu2', true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    var reader = new FileReader();

    reader.onload = function (loadEvent) {
        var arrayBuffer = loadEvent.target.result;
        console.log("result1: " + arrayBuffer);
        //convert(arrayBuffer, callback);

        xhr.send(toBuffer(arrayBuffer));
    };

    reader.readAsArrayBuffer(file);
*/

}

function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

function post(result) {
    var xhr = new XMLHttpRequest();
    xhr.onload = xhr.onerror = function () {
        if (xhr.status === 200) {
            //alert(xhr.responseText);
            document.getElementById("output").innerHTML = xhr.responseText;

        } else {
            console.log("error " + this.status);
        }
    };

    xhr.open("POST", "http://localhost:3000/", true);
    //xhr.open('POST', 'https://us-central1-psu-by.cloudfunctions.net/psu', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
	
	var facElement = document.getElementById("fac_selector");
	var courseElement = document.getElementById("course_selector");
	
	var fac = facElement.options[facElement.selectedIndex].value;
	var course = courseElement.options[courseElement.selectedIndex].value;
		
	
	const checkBox = document.getElementById("check_box");
	let action = checkBox.checked?'show':'parse';
	
	var json = JSON.stringify({
  		html: result.value,
		action: action,
  		fac: fac,
  		course: course
	});

    xhr.send(json);
}


function readFileInputEventAsArrayBuffer(file, callback) {
    var reader = new FileReader();

    reader.onload = function (loadEvent) {
        var arrayBuffer = loadEvent.target.result;
        //console.log("result1: " + arrayBuffer);
        convert(arrayBuffer, callback);
    };

    reader.readAsArrayBuffer(file);
}


function convert(arrayBuffer, callback) {
    mammoth.convertToHtml({arrayBuffer: arrayBuffer})
        .then(callback)
        .done();
}

function displayResult(rHtml) {

    const r = result.value;
    document.getElementById("output").innerHTML = r;

    //fit_parse(document.getElementById("course_selector").value, html)
}