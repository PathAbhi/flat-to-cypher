const moment = require('moment');

module.exports = function() { 
    this.getPropertyValue = function(propertyObject, dataRow) {

      const { dataType } = propertyObject;

        switch ( dataType ) {
            case "Integer":
              const intVal = parseInt(dataRow[propertyObject.accessor]);
              if ( !isNaN(intVal) )
                return intVal;
              return;
            case "Float":
                const floatVal = parseFloat(dataRow[propertyObject.accessor]);
                if ( !isNaN(floatVal) )
                  return floatVal;
              return;
            case "String":
              const stringVal = dataRow[propertyObject.accessor];
              if ( stringVal != null)
                return "" + stringVal;
              return;
            case "Boolean":
              const boolVal = dataRow[propertyObject.accessor];
              if ( boolVal == null )
                return;
              if ( propertyObject.trueValues.findIndex(trueValue => trueValue.toLowerCase() === ("" + boolVal).toLowerCase()) >= 0 )
                return true;
              if ( propertyObject.falseValues.findIndex(trueValue => trueValue.toLowerCase() === ("" + boolVal).toLowerCase()) >= 0)
                return false;
              return;
            case "Point":
              const x_val = parseFloat(dataRow[propertyObject.x_accessor]);
              const y_val = parseFloat(dataRow[propertyObject.y_accessor]);
              const z_val = parseFloat(dataRow[propertyObject.z_accessor]);
              const srid = propertyObject.srid;
              
              switch (srid) {
                case 4326:
                case 7203:
                  if ( !isNaN(x_val) && !isNaN(y_val) )
                    return `Point( { x: ${x_val}, y: ${y_val}, srid: ${srid} } )`;
                  return;
                case 4979:
                case 9157:
                  if ( !isNaN(x_val) && !isNaN(y_val) && !isNaN(z_val) )
                    return `Point( { x: ${x_val}, y: ${y_val} z: ${z_val}, srid: ${srid} } )`;
                  return;
                default:
                  return;
              }
            case "Date":
              const dateString = dataRow[propertyObject.accessor];
              const dateFormat = propertyObject.format.toUpperCase();
              const dateVal = moment(dateString, dateFormat).toObject();
              if  ( !isNaN(dateVal.years) && !isNaN(dateVal.months) && !isNaN(dateVal.date) )
                return(`date({year: ${dateVal.years}, month: ${dateVal.months + 1}, day: ${dateVal.date}})`);
              return;
            case "Time":
              const timeString = dataRow[propertyObject.accessor];
              const timeFormat = propertyObject.format;
              const timeVal = moment(timeString, timeFormat).toObject();
              if  ( !isNaN(timeVal.hours) && !isNaN(timeVal.minutes) && !isNaN(timeVal.seconds) && !isNaN(timeVal.milliseconds) )
                return(`time({hour: ${timeVal.hours}, minute: ${timeVal.minutes}, second: ${timeVal.seconds}, millisecond: ${timeVal.milliseconds}})`);
              return;
            case "LocalTime":
              const localTimeString = dataRow[propertyObject.accessor];
              const localTimeFormat = propertyObject.format;
              const localTimeVal = moment(localTimeString, localTimeFormat).toObject();
              if ( !isNaN(localTimeVal.hours) && !isNaN(localTimeVal.minutes) && !isNaN(localTimeVal.seconds) && !isNaN(localTimeVal.milliseconds) )
                return(`localtime({hour: ${localTimeVal.hours}, minute: ${localTimeVal.minutes}, second: ${localTimeVal.seconds}, millisecond: ${localTimeVal.milliseconds}})`);
              return;
            case "DateTime":
              const dateTimeString = dataRow[propertyObject.accessor];
              const dateTimeFormat = propertyObject.format;
              let dateTimeVal;
              switch ( dateTimeFormat ) {
                case "epochMillis":
                  dateTimeVal = moment(pareInt(dateTimeString)).toObject();
                  break;
                case "epochSeconds":
                  dateTimeVal = moment(parseInt(dateTimeString) * 1000).toObject();
                  break;
                default:
                  dateTimeVal = moment(dateTimeString, dateTimeFormat).toObject();
              }
              if  (
                    !isNaN(dateTimeVal.years) &&
                    !isNaN(dateTimeVal.months) &&
                    !isNaN(dateTimeVal.date) &&
                    !isNaN(dateTimeVal.hours) &&
                    !isNaN(dateTimeVal.minutes) &&
                    !isNaN(dateTimeVal.seconds) &&
                    !isNaN(dateTimeVal.milliseconds)
                  )
                return(`datetime({year: ${dateTimeVal.years}, month: ${dateTimeVal.months + 1}, day: ${dateTimeVal.date}, hour: ${dateTimeVal.hours}, minute: ${dateTimeVal.minutes}, second: ${dateTimeVal.seconds}, millisecond: ${dateTimeVal.milliseconds}})`);
              return;
            case "LocalDateTime":
              const localDateTimeString = dataRow[propertyObject.accessor];
              const localDateTimeFormat = propertyObject.format;
              let localDateTimeVal;
              switch ( localDateTimeFormat ) {
                case "epochMillis":
                  localDateTimeVal = moment(parseInt(localDateTimeString)).toObject();
                  break;
                case "epochSeconds":
                  localDateTimeVal = moment(parseInt(localDateTimeString) * 1000).toObject();
                  break;
                default:
                  localDateTimeVal = moment(localDateTimeString, localDateTimeFormat).toObject();
              }
              if  (
                    !isNaN(localDateTimeVal.years) &&
                    !isNaN(localDateTimeVal.months) &&
                    !isNaN(localDateTimeVal.date) &&
                    !isNaN(localDateTimeVal.hours) &&
                    !isNaN(localDateTimeVal.minutes) &&
                    !isNaN(localDateTimeVal.seconds) &&
                    !isNaN(localDateTimeVal.milliseconds)
                  )
                return(`localdatetime({year: ${localDateTimeVal.years}, month: ${localDateTimeVal.months + 1}, day: ${localDateTimeVal.date}, hour: ${localDateTimeVal.hours}, minute: ${localDateTimeVal.minutes}, second: ${localDateTimeVal.seconds}, millisecond: ${localDateTimeVal.milliseconds}})`);
              return;
            case "Duration":
              const durationString = dataRow[propertyObject.accessor];
              const durationFormat = propertyObject.format;
              if (durationString === null || durationString === undefined || ("" + durationString).trim() === "")
                return;
              let durationVal;
              switch ( durationFormat ) {
                case "millis":
                  const millisIntVal = parseInt(durationString);
                  if ( isNaN(millisIntVal) )
                    return;
                  durationVal = moment.duration(millisIntVal);
                  break;
                case "seconds":
                  const secondsIntVal = parseInt(durationString);
                  if ( isNaN(secondsIntVal) )
                    return;
                  durationVal = moment.duration(secondsIntVal * 1000);
                  break;
                default:
                  durationVal = moment.duration("" + durationString);
                  break;    
              }
              const durationISOString = durationVal.toISOString();
                return `duration('${durationISOString}')`;
            default:
              return;
        }
    };
}