function batchEvents() {
  const batch = gapi.client.newBatch();
  for (let i = 1; i < 5; i++) {
    const event = gapi.client.calendar.events.insert({
      'calendarId': 'c_kpefo0ahrgt3ul1je9btul9n2g@group.calendar.google.com',
      // month is 0-indexed
      'resource': createEvent(new Date(2021, 6 - 1, i, 15), new Date(2021, 6 - 1, i, 16))
    });
    batch.add(event, { 'id': i });
  }
  return batch;
}
// add color and id

// pass in date objects
function createEvent(firstDate, secondDate) {

  var event = {
    'summary': 'test',
    'start': {
      'dateTime': firstDate.toISOString(),
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': secondDate.toISOString(),
      'timeZone': 'America/Los_Angeles'
    }
  };
  return event;
}