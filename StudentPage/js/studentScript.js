const WEEK_WHITE = 'white';
const WEEK_GREEN = 'green';

const COOKIE_COURSE = 'course';
const COOKIE_GROUP = 'group';
const COOKIE_SUBGROUP = 'subgroup';
const COOKIE_WEEK_COLOR = 'week_color';

var week = WEEK_WHITE;
var fac = 'fit';
var course;
var group;
var subGroup;
var day = 1;

const container = document.getElementById('schedule_container');
var databaseJson;

function setCookie(name, value) {
    value = encodeURIComponent(value);
    document.cookie = name + "=" + value;
}

// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
    setCookie(name, "")
}

function clearSelector(select) {
    while (select.options.length > 0) {
        select.remove(0);
    }
}

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
    clearSelector(courseSelector);
    courseList.forEach(function (course, number) {
        courseSelector.options[number] = new Option((number + 1) + ' курс', number + 1);
    });

    const cookieCourse = parseInt(getCookie(COOKIE_COURSE));
    if (!isNaN(cookieCourse) && cookieCourse <= courseList.length) {
        course = cookieCourse;
        courseSelector.selectedIndex = course - 1; // course - 1 - т к индексация с 0
    } else {
        course = 1;
    }
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
    clearSelector(groupSelector);
    groupList.forEach(function (groupName, number) {
        groupSelector.options[number] = new Option(groupName, groupName);
    });

    const cookieGroupIndex = parseInt(getCookie(COOKIE_GROUP));
    if (!isNaN(cookieGroupIndex) && cookieGroupIndex <= groupList.length) {
        group = groupList[cookieGroupIndex];
        groupSelector.selectedIndex = cookieGroupIndex;
    } else {
        group = groupList[0];
    }

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
    clearSelector(subGroupSelector);
    subGroups.forEach(function (subGroupName, number) {
        subGroupSelector.options[number] = new Option((number + 1) + ' подгруппа', number + 1);
    });


    const cookieSubGroup = parseInt(getCookie(COOKIE_SUBGROUP));
    if (!isNaN(cookieSubGroup) && cookieSubGroup <= subGroups.length) {
        subGroup = cookieSubGroup;
        subGroupSelector.selectedIndex = cookieSubGroup - 1;
    } else {
        subGroup = 1;
    }
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
    const courseSelector = document.getElementById('course_selector');
    courseSelector.addEventListener("change", function () {
        course = this.value;
        deleteCookie(COOKIE_GROUP);
        deleteCookie(COOKIE_SUBGROUP);
        setCookie(COOKIE_COURSE, course);
        fillGroupsSelector();
        fillSubGroupsSelector();
        onPropertyChange();
    });
}

function initGroupListener() {
    const groupSelector = document.getElementById('group_selector');
    groupSelector.addEventListener("change", function () {
        group = this.value;
        setCookie(COOKIE_GROUP, this.selectedIndex);
        deleteCookie(COOKIE_SUBGROUP);
        fillSubGroupsSelector();
        onPropertyChange();
    });
}

function initSubGroupListener() {
    const subGroupSelector = document.getElementById('subgroup_selector');
    subGroupSelector.addEventListener("change", function () {
        subGroup = this.value;
        setCookie(COOKIE_SUBGROUP, subGroup);
        onPropertyChange();
    });
}

function onPropertyChange() {
    // обработчик изменений выбранных параметров
    var str = '';
    const scheduleJson = databaseJson.val()[fac][course][week][group][subGroup][day];
    Object.keys(scheduleJson).map(function (objectKey, index) {
        var lessonObj = scheduleJson[objectKey];
        str = str + '</br><strong>[' + (index + 1) + ']</strong>' + lessonObj['time']  + ': '+ lessonObj['lesson'];
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
