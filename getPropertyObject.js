module.exports = function() { 
    this.getPropertyObject = function(rowData) {
        switch (rowData[0][2]) {
            case "Boolean":
              return {
                dataType: rowData[0][2],
                name: rowData[0][3],
                accessor: rowData[0][4],
                trueValues: rowData[0][5] == null ? ["true"] : ("" + rowData[0][5]).split(`;`),
                falseValues: rowData[0][6] == null ? ["false"] : ("" + rowData[0][6]).split(`;`),
              };
            case "Point":
              return {
                dataType: rowData[0][2],
                name: rowData[0][3],
                x_accessor: rowData[0][4],
                y_accessor: rowData[0][5],
                z_accessor: rowData[0][6],
                srid: rowData[0][7],
              }
            case "Date":
            case "Time":
            case "LocalTime":
            case "DateTime":
            case "LocalDateTime":
            case "Duration":
              return {
                dataType: rowData[0][2],
                name: rowData[0][3],
                accessor: rowData[0][4],
                format: rowData[0][5],
              }
            default:
                return { dataType: rowData[0][2], name: rowData[0][3], accessor: rowData[0][4]};
          }
    };
}