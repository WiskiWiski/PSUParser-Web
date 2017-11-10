/**
 * Created by WiskiW on 08.10.2017.
 */



var facElement = document.getElementById("fac_selector");
var courseElement = document.getElementById("course_selector");
var subgroupsElement = document.getElementById("subgroup_numb");


var fac = 'unset';
var course = 0;
var sgpg = 0;

const resultContainer = document.getElementById("result_container");
const msgList = document.getElementById("msg_list");
const msgContainer = document.getElementById("msg_container");
const uploadButton = document.getElementById('upload_btn');


document.getElementById("document").addEventListener("change", handleFileSelect, false);

var file;

function sendFile() {
    uploadButton.setAttribute('disabled', 'true');
    readFileInputEventAsArrayBuffer(file, post);

    resultContainer.setAttribute("style", "display: none");
    clearSelector(msgList);
    msgContainer.innerHTML = '';
}

function parseFileName(filename) {
    const facRegExp = /[A-z]+(?=\s*-\s*\d)/gm;
    var facArr = filename.match(facRegExp);
    if (facArr !== null) {
        var localFac = facArr[0];
        if (localFac !== undefined && localFac.length >= 2 && localFac.length <= 3) {
            fac = localFac.toLowerCase().trim();
            selectFacByValue(fac);
            subgroupsNumbByValue(fac);
        }
    }

    const courseRegExp = /\d(?=\s*\.\s*)/gm;
    const courseArr = filename.match(courseRegExp);
    if (courseArr !== null) {
        var localCourse = courseArr[0];
        if (localCourse > 0 && localCourse <= 5) {
            course = localCourse;
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
                console.log('Select course by filename: %d', k);
                courseSelector.value = k;
                break;
            }
        }
    }

    function subgroupsNumbByValue(facValue) {
        switch (facValue) {
            case 'fit':
                sgpg = 2;
            default:
                sgpg = 2;
        }
        subgroupsElement.value = sgpg;
    }
}


function handleFileSelect(event) {
    file = event.target.files[0];
    parseFileName(event.target.files[0].name);
    enablePrefs();
}

function clearSelector(select) {
    while (select.options.length > 0) {
        select.remove(0);
    }
}

function enablePrefs() {
    const prefs = document.getElementsByClassName('pref');
    for (var i = 0; i < prefs.length; i++) {
        prefs [i].removeAttribute('disabled');
    }
    uploadButton.removeAttribute('disabled');
}

function processResult(res) {
    resultContainer.setAttribute("style", "display: block");

    var completeText = 'Успешно загружено!';

    const jsonRes = JSON.parse(res);
    if (jsonRes.length <= 0) {
        /*
        const resultContent = document.getElementById('result_content');
        resultContent.setAttribute("align", "center");
        resultContent.innerHTML = "ok!";
        */
    } else {
        clearSelector(msgList);
        completeText = 'Успешно загружено: найдено ' + jsonRes.length + ' предупреждений!';

        jsonRes.forEach(function (log, k) {
            msgList.options[k] = new Option(log.displayText, k);
            msgList.options[k].classList.add(getLogClassStyle(log));

            if (Math.floor(log.code / 1000) === 3) {
                completeText = 'Загрузка прервана: обнаружены критические ошибки!';
            }
        });

        msgList.addEventListener('change', function (ev) {
            const json = jsonRes[ev.target.value];
            onChange(json);
        });

        msgList.value = 0;
        onChange(jsonRes[0]);
        msgList.focus();

        function onChange(log) {
            var text = '';

            for (var key in log.when) {
                if (log.when.hasOwnProperty(key)) {
                    text = text + log.when[key] + ' ';
                }
            }

            msgContainer.innerHTML = text + '</br>' + log.displayText;
            msgContainer.setAttribute('class', getLogClassStyle(log));
        }
    }

    document.getElementById('complete_text').innerHTML = completeText;

    function getLogClassStyle(log) {
        switch (Math.floor(log.code / 1000)) {
            case 1:
                return 'option_msg';
            case 2:
                return 'option_warning';
            case 3:
                return 'option_error';
            default:
                return 'option';
        }
    }
}

function post(result) {
    var xhr = new XMLHttpRequest();
    xhr.onload = xhr.onerror = function () {
        uploadButton.removeAttribute('disabled');
        if (xhr.status === 200) {
            //alert(xhr.responseText);
            processResult(xhr.responseText);
        } else {
            console.log("error " + this.status);
        }
    };

    // если запуск с localhost, то запрос кидаем на локальный сервер, иначе - на firebase

    const hosting = document.location;
    if (hosting.host.includes("localhost") || hosting.origin.includes("file")) {
        // localhost
        xhr.open("POST", "http://localhost:3000/", true);
    } else {
        // firebase hosting
        xhr.open('POST', 'https://us-central1-psu-by.cloudfunctions.net/psu', true);
    }

    xhr.setRequestHeader('Content-Type', 'application/json');


    var fac = facElement.options[facElement.selectedIndex].value;
    var course = courseElement.options[courseElement.selectedIndex].value;
    var sgpg = parseInt(subgroupsElement.value.trim());
    if (sgpg <= 0) {
        sgpg = 2;
    }

    var json = JSON.stringify({
        html: result.value,
        fac: fac,
        sgpg: sgpg,
        course: course
    });

    xhr.send(json);
}


function readFileInputEventAsArrayBuffer(file, callback) {
    var reader = new FileReader();

    reader.onload = function (loadEvent) {
        var arrayBuffer = loadEvent.target.result;
        //console.log("result1: " + arrayBuffer);
        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
            .then(callback)
            .done();
    };

    reader.readAsArrayBuffer(file);
}
