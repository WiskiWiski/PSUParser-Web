const resultContainer = document.getElementById("result_container");

/**
 * Created by WiskiW on 08.10.2017.
 */

const msgList = document.getElementById("msg_list");
const msgContainer = document.getElementById("msg_container");
const uploadButton = document.getElementById('upload_btn');

const facSelectorElement = document.getElementById("fac_selector");
const courseSelectorElement = document.getElementById("course_selector");
const subgroupsSelectorElement = document.getElementById("subgroup_numb");

const FAC_LIST = {
    fit: 'ФИТ',
    gf: 'ГФ'
    /*,
    isf: 'ИСФ',
    mtf: 'МТФ',
    rtf: 'РТФ',
    fef: 'ФЭФ',
    juf: 'ЮФ'
    */
};

const FILENAME_PREFIX_LIST = {
    fit: ['fit'],
    gf: ['rgf', 'aja', 'rja', 'iff']
};

var file;

var fac = 'unset';
var course = 0;
var sgpg = 0;


document.getElementById("document").addEventListener("change", handleFileSelect, false);
predraw();

function predraw() {
    // Заполнение FAC селектора
    var number = 0;
    const facObj = new Option('Факультет', 'fac');
    facObj.setAttribute("style", "display:none");
    facSelectorElement.options[number] = facObj;
    number++;
    for (var facV in FAC_LIST) {
        var vacN = FAC_LIST[facV];
        facSelectorElement.options[number] = new Option(vacN, facV);
        number++;
    }
}

function sendFile() {
    uploadButton.setAttribute('disabled', 'true');
    readFileInputEventAsArrayBuffer(file, post);

    resultContainer.setAttribute("style", "display: none");
    clearSelector(msgList);
    msgContainer.innerHTML = '';
}

function parseFileName(filename) {
    const REG_EXP_FAC_COURSE = /[A-z-–]{2,}\s*[-–]\s*[1-6]/gi;
    const facCourseList = getByRegExp(filename, REG_EXP_FAC_COURSE);
    if (facCourseList.length === 1) {
        const facCourse = facCourseList[0];

        const courseStr = facCourse.charAt(facCourse.length - 1);
        const localCourse = parseInt(courseStr);
        if (!isNaN(course)) {
            course = localCourse;
            selectCourseByValue(course);
        } else {
            courseSelectorElement.value = 'course';
        }

        var filenamePrefix = facCourse.replace(/[-–]\s*[0-6]/gi, '');
        console.log('Filename prefix: ' + filenamePrefix);

        if (filenamePrefix !== undefined && filenamePrefix.trim() !== '') {
            filenamePrefix = filenamePrefix.toLowerCase().trim();
            selectFacByFileNamePrefix(filenamePrefix);
            subgroupsNumbByFileName(filenamePrefix, course);
        } else {
            facSelectorElement.value = 'fac'
        }
    }

    function selectFacByFileNamePrefix(filenamePrefix) {
        var lFac;
        var foundFacInList = '';

        // перебор по объекту с названиями файлов для факультетов
        for (lFac in FILENAME_PREFIX_LIST) {
            FILENAME_PREFIX_LIST[lFac].forEach(function (filename) {
                if (foundFacInList === '' && filenamePrefix === filename) {
                    fac = foundFacInList = lFac;
                }
            });
        }

        const list = facSelectorElement.options;
        if (foundFacInList === '') {
            facSelectorElement.value = list[0].value;
        } else {
            var i = 1; // т к первый элемент - Факультет
            // поиск нужного индекса для FacSelector
            for (lFac in FAC_LIST) {
                if (lFac === foundFacInList) {
                    console.log('Select fac by filename: %s', list[i].text);
                    facSelectorElement.value = list[i].value;
                    return;
                }
                i++;
            }
        }
    }

    function selectCourseByValue(courseValue) {
        const list = courseSelectorElement.options;
        for (var k = 0; k < list.length; k++) {
            if (list[k].value == courseValue) {
                console.log('Select course by filename: %d', k);
                courseSelectorElement.value = k;
                return;
            }
        }
        courseSelectorElement.value = 'course';
    }

    function subgroupsNumbByFileName(filenamePrefix, course) {
        for (var f in FILENAME_PREFIX_LIST) {
            if (FILENAME_PREFIX_LIST[f].includes(filenamePrefix)) {
                switch (f) {
                    case 'fit':
                    case'gf':
                        setSGPG(2);
                        return;
                }
            }
        }

        setSGPG(2);

        function setSGPG(v) {
            sgpg = v;
            subgroupsSelectorElement.value = v;
        }
    }

    function getByRegExp(source, exp) {
        const res = source.match(exp);
        if (res === null) {
            return [];
        } else {
            return res;
        }
    }
}


function handleFileSelect(event) {
    file = event.target.files[0];
    if (file !== undefined) {
        parseFileName(file.name);
    }
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
            msgList.options[k] = new Option('[' + log.code + '] ' + log.displayText, k);
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
            var text = '[' + log.code + '] ';

            for (var key in log.when) {
                if (log.when.hasOwnProperty(key)) {
                    text = text + key + ': ' + log.when[key] + ' ';
                }
            }

            msgContainer.innerHTML = text + ' - \"<i>' + log.payload + '</i>\"</br><strong>' + log.displayText + '</strong>';
            msgContainer.setAttribute('class', getLogClassStyle(log));
        }
    }

    document.getElementById('complete_text').innerHTML = completeText;

    function getLogClassStyle(log) {
        switch (Math.floor(log.code / 1000)) {
            case 1:
                return 'option_info';
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


    var fac = facSelectorElement.options[facSelectorElement.selectedIndex].value;
    var course = courseSelectorElement.options[courseSelectorElement.selectedIndex].value;
    var sgpg = parseInt(subgroupsSelectorElement.value.trim());
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
