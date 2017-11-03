/**
 * Created by WiskiW on 08.10.2017.
 */


document.getElementById("document").addEventListener("change", handleFileSelect, false);

var file;

function sendFile() {
    document.getElementById("output").innerHTML = '';
    readFileInputEventAsArrayBuffer(file, post);
}

function parseFileName(filename) {
    const facRegExp = /[A-z]+(?=\s*-\s*\d)/gm;
    var facArr = filename.match(facRegExp);
    if (facArr !== null) {
        var fac = facArr[0];
        if (fac !== undefined && fac.length >= 2 && fac.length <= 3) {
            fac = fac.toLowerCase().trim();
            selectFacByValue(fac);
        }
    }

    const courseRegExp = /\d(?=\s*\.\s*)/gm;
    const courseArr = filename.match(courseRegExp);
    if (courseArr !== null) {
        var course = courseArr[0];
        if (course > 0 && course <= 5) {
            selectCourseByValue(course);
        }
    }

    function selectFacByValue(facValue) {
        var facSelector = document.getElementById("fac_selector");
        const list = facSelector.options;
        for (var k = 0; k < list.length; k++) {
            if (list[k].value === facValue) {
                console.log('Select fac by filename: %s', list[k].text);
                facSelector.value = list[k].value;
                break;
            }
        }
    }

    function selectCourseByValue(courseValue) {
        var courseSelector = document.getElementById("course_selector");
        const list = courseSelector.options;
        for (var k = 0; k < list.length; k++) {
            if (list[k].value === '' + courseValue) {
                console.log('Select course by filename: %d', k + 1);
                courseSelector.value = k;
                break;
            }
        }
    }
}


function handleFileSelect(event) {
    file = event.target.files[0];
    parseFileName(event.target.files[0].name);
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
    let action = checkBox.checked ? 'show' : 'parse';

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