const WEEK_WHITE = 'white';
const WEEK_GREEN = 'green';

var week = WEEK_WHITE;
var fac = 'fit';
var course;
var group;
var subGroup;
var day = 1;

const container = document.getElementById('schedule_container');
var databaseJson;

function fillCourseSelector() {
    function getCourses() {
        const courseList = [];
        var data = databaseJson.val()[fac];

        Object.keys(data).map(function (objectKey, index) {
            //var value = object[objectKey];
            courseList[index] = objectKey;
        });
        return courseList;
    }

    const courseList = getCourses();

    const courseSelector = document.getElementById('course_selector');
    courseSelector.options = [];
    courseList.forEach(function (course, number) {
        courseSelector.options[number] = new Option(number + 1, number + 1);
    });
    course = 1;
}

function fillGroupsSelector() {
    function getGroups() {
        const groupList = [];
        var data = databaseJson.val()[fac][course][week];

        Object.keys(data).map(function (objectKey, index) {
            //var value = object[objectKey];
            groupList[index] = objectKey;
        });
        return groupList;
    }

    const groupList = getGroups();

    const groupSelector = document.getElementById('group_selector');
    groupSelector.options = [];
    groupList.forEach(function (groupName, number) {
        groupSelector.options[number] = new Option(groupName, groupName);
    });
    group = groupList[0];
}

function fillSubGroupsSelector() {
    function getSubGroups() {
        const subgroupList = [];
        var data = databaseJson.val()[fac][course][week][group];

        Object.keys(data).map(function (objectKey, index) {
            //var value = object[objectKey];
            subgroupList[index] = objectKey;
        });
        return subgroupList;
    }

    const subGroups = getSubGroups();

    const subGroupSelector = document.getElementById('subgroup_selector');
    subGroupSelector.options = [];
    subGroups.forEach(function (subGroupName, number) {
        subGroupSelector.options[number] = new Option(number + 1, number + 1);
    });
    subGroup = 1;
}

function initButtonsListeners() {
    //(this.className=='week_button')?this.className='active_button':this.className='week_button';
    var buttons = document.querySelectorAll('.button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            const button = this;

            if (button.classList.contains('day_button')) {
                // обработка нажатий для кнопок дней недели
                day = button.getAttribute('day_index'); // сохранение нового значения

                // деактивация кнопок
                const dayButtons = document.querySelectorAll('.day_button');
                dayButtons.forEach(function (dayButton) {
                    dayButton.classList.remove('active_button')
                });

            } else if (button.classList.contains('color_button')) {
                // обработка нажатий для кнопок выбора цвета недели

                week = button.getAttribute('week_color'); // сохранение нового значения

                // деактивация кнопок
                const colorButtons = document.querySelectorAll('.color_button');
                colorButtons.forEach(function (colorButton) {
                    colorButton.classList.remove('active_button')
                });

                // смена цвета рамки
                const borderElement = document.getElementById('color_border');
                if (week === WEEK_GREEN) {
                    borderElement.classList.add('border_green');
                    borderElement.classList.remove('border_white');
                } else {
                    borderElement.classList.remove('border_green');
                    borderElement.classList.add('border_white');
                }
            }
            button.classList.toggle('active_button');
            onPropertyChange();
            //alert(button.className);
            //alert('k');
        });
    }
}

function initCourseListener() {
    const facSelector = document.getElementById('course_selector');
    facSelector.addEventListener("change", function () {
        course = this.value;
        fillGroupsSelector();
        fillSubGroupsSelector();
        onPropertyChange();
    });
}

function initGroupListener() {
    const facSelector = document.getElementById('group_selector');
    facSelector.addEventListener("change", function () {
        group = this.value;
        fillSubGroupsSelector();
        onPropertyChange();
    });
}

function initSubGroupListener() {
    const facSelector = document.getElementById('subgroup_selector');
    facSelector.addEventListener("change", function () {
        subGroup = this.value;
        onPropertyChange();
    });
}

function onPropertyChange() {
    // обработчик изменений выбранных параметров
    var str = '';
    const scheduleJson = databaseJson.val()[fac][course][week][group][subGroup][day];
    Object.keys(scheduleJson).map(function (objectKey, index) {
        var lesson = scheduleJson[objectKey]['lesson'];
        str = str + '</br><strong>[' + (index + 1) + ']</strong>' + lesson;
    });
    container.innerHTML = str;
}


loadSchedule().then(function (json) {
    databaseJson = json;

    fillCourseSelector();
    fillGroupsSelector();
    fillSubGroupsSelector();

    onPropertyChange();
});

initButtonsListeners();
initCourseListener();
initGroupListener();
initSubGroupListener();
