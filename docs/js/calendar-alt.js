var yearSchedule;

function checkExistingCalendar() {
    for (let i = 0; i < 16; i++) {
        if (input[i].value != "") {
            if (radio[i][0].checked) {
                var lunch = 1;
            } else if (radio[i][1].checked) {
                var lunch = 2;
            } else if (radio[i][2].checked) {
                var lunch = 3;
            } else {
                return remindRequired();
            }
            var periodColor = $("input[name='"+i+"-color']:checked").val();
            classes[i] = {
                "name": input[i].value,
                "lunch": lunch,
                "color": periodColor,
            };
        }
    }
    startLockout();
    hideRequired();
    var calendarId = window.localStorage.getItem("brebeufScheduleCalendar");
    window.localStorage.setItem("brebeufScheduleCalendar", null);
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: "1Acf2-wXPwMJFOg6TUdGzJ5e_gqN6po_-EENVXahvBgY",
      range: "A:B"
    }).then(function (response) {
      yearSchedule = response;
    }).catch(function (reason) {
      console.log(reason);
    });  
    if (calendarId !== null) {
      gapi.client.calendar.calendars.delete({
        "calendarId": calendarId
      }).then(function (response) {
        console.log("calendar deleted, id: " + calendarId);
        createCalendar();
      }).catch(function (reason) {
        console.log(reason);
        createCalendar();
      })
    } else {
      createCalendar();
    }
    // calendar color and alert  
  }
  
  function createCalendar() {
    gapi.client.calendar.calendars.insert({
      "resource": {
        "summary": "Brebeuf Schedule",
        "description": "Generated on " + new Date().toLocaleString(),
        "timeZone": "America/Indiana/Indianapolis"
      }
    }).then(function (response) {
      calendarId = response.result.id;
      console.log("calendar created, id: " + calendarId);
      window.localStorage.setItem("brebeufScheduleCalendar", calendarId);
      batchEvents(calendarId);
    }).catch(function (reason) {
      console.log(reason);
    });
  }


function batchEvents(calendarId) {
    const batch = gapi.client.newBatch();
  
    var dayTest = new Date();
    dayTest.setHours(0, 0, 0, 0);
    var startYear = yearSchedule.result.values[1][0].split("/")[2];
    for(v = 1; v < yearSchedule.result.values.length; v++) {
      m = yearSchedule.result.values[v][0];
      x = yearSchedule.result.values[v][1];
      console.log(m.split("/")[0]);
      dayTest.setFullYear(m.split("/")[2], m.split("/")[0]-1, m.split("/")[1]);
      if(x >= 1 && x <= 8) {
        for(y = 0; y < normalSchedule.length-2; y++) {
          if (m.split("/")[2] > startYear) {
            var periodNumber = classOrder[x-1][y]+8;
          } else {
            var periodNumber = classOrder[x-1][y];
          }
          if (classes[periodNumber] === undefined) {
            continue;
          }
          let startTime = new Date(dayTest);
          let endTime = new Date(dayTest);
          if(y == 2) {
            if(classes[periodNumber].lunch == 1) {
              startTime.setHours(normalSchedule[2][0][0], normalSchedule[2][0][1]);
              endTime.setHours(normalSchedule[2][0][2], normalSchedule[2][0][3]);
              const event = gapi.client.calendar.events.insert({
                "calendarId": calendarId,
                "resource": createEvent(classes[periodNumber].name, classes[periodNumber].color, startTime, endTime)
              });
              batch.add(event);
            } else if (classes[periodNumber].lunch == 2) {
              startTime.setHours(normalSchedule[2][1][0], normalSchedule[2][1][1]);
              endTime.setHours(normalSchedule[2][1][2], normalSchedule[2][1][3]);
              const event = gapi.client.calendar.events.insert({
                "calendarId": calendarId,
                "resource": createEvent(classes[periodNumber].name, classes[periodNumber].color, startTime, endTime)
              });
              batch.add(event);
              startTime.setHours(normalSchedule[2][1][4], normalSchedule[2][1][5]);
              endTime.setHours(normalSchedule[2][1][6], normalSchedule[2][1][7]);
              const event1 = gapi.client.calendar.events.insert({
                "calendarId": calendarId,
                "resource": createEvent(classes[periodNumber].name, classes[periodNumber].color, startTime, endTime)
              });
              batch.add(event1);
            } else if (classes[periodNumber].lunch == 3) {
              startTime.setHours(normalSchedule[2][2][0], normalSchedule[2][2][1]);
              endTime.setHours(normalSchedule[2][2][2], normalSchedule[2][2][3]);
              const event = gapi.client.calendar.events.insert({
                "calendarId": calendarId,
                "resource": createEvent(classes[periodNumber].name, classes[periodNumber].color, startTime, endTime)
              });
              batch.add(event);
            }
          } else {
            startTime.setHours(normalSchedule[y][0], normalSchedule[y][1]);
            endTime.setHours(normalSchedule[y][2], normalSchedule[y][3]);
            const event = gapi.client.calendar.events.insert({
              "calendarId": calendarId,
              "resource": createEvent(classes[periodNumber].name, classes[periodNumber].color, startTime, endTime)
            });
            batch.add(event);
          }
        }
      }
    }
    return batch
    .then(function (response) {
      console.log(response.result);
      endLockout();
      document.getElementById("success-message").style.display = "block";
    }).catch(function (reason) {
      console.log(reason);
      document.getElementById("success-message").style.display = "block";
    });
  }
  // clear, lunch, color
  
  function brebeufDay(enteredDate) {
    // enter date object
    enteredDate.setHours(0,0,0,0);
    const enteredTime = enteredDate.getTime();
    var dayOne = specialDates.firstDayFirstSem;
    if (enteredTime >= specialDates.firstDaySecondSem.getTime()) dayOne = specialDates.firstDaySecondSem;
    
    var brebeufDay = null;
    if (enteredTime == dayOne.getTime()) brebeufDay = 1;
    else if (enteredTime < dayOne.getTime() || enteredTime > specialDates.lastDay.getTime()) brebeufDay = null;
    else if (!normalDay(enteredDate)) brebeufDay = null;
    else {
      var dayCount = 0;
      var dayTest = new Date(dayOne);
  
      while (dayTest.getTime() <= enteredTime) {
        if (normalDay(dayTest)) dayCount ++;
        dayTest.setDate(dayTest.getDate() + 1);
      }
      brebeufDay = dayCount % 8;
      if (brebeufDay == 0) brebeufDay = 8;
    }
  
    return brebeufDay;
  }
  
  
  function normalDay(enteredDate) {
    // enter date object
    var normal = true;
    const enteredTime = enteredDate.getTime();
    if (enteredDate.getDay() == 6 || enteredDate.getDay() == 0) normal = false;
    else {
      for (let days of specialDates.singleDays) {
        if (enteredTime == days.getTime()) {
          normal = false;
          break;
        }
      }
      if (normal) {
        for (let breaks of specialDates.extendedBreak) {
          if (enteredTime >= breaks[0].getTime() && enteredTime <= breaks[1].getTime()) {
            normal = false;
            break;
          }
        }
      }
    }
    return normal;
  }
  
  
  function createEvent(summary, color, firstDate, secondDate) {
    // pass in date objects
    var event = {
      "summary": summary,
      "colorId": color,
      "start": {
        "dateTime": firstDate.toISOString(),
        "timeZone": "America/Indiana/Indianapolis"
      },
      "end": {
        "dateTime": secondDate.toISOString(),
        "timeZone": "America/Indiana/Indianapolis"
      }
    };
    return event;
  }