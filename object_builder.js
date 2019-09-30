// The util.inspect() method returns a string representation of object that is intended for debugging.
const util = require('util'); // required for util.inspect()
// The output of util.inspect may change at any time and should not be depended upon programmatically.

const fs = require('fs');
const papa = require('papaparse'); // CSV Parser
require('./getPropertyObject')();
require('./getPropertyValue')();

const readFileSyncOptions = { encoding: process.argv[4] || 'utf8' } ; // encoding specification is important for reading files correctly.
const createWriteStreamOptions = {};

let nodesConfig = []; // to store correlation of property names and their accessors of nodes.
let relationshipsConfig =  []; // to store correlation of source and target nodes and property names and their accessors of relationships.
let preConstraintsConfig =  []; // to store db constraints to be created before data entry.
let postConstraintsConfig =  []; // to store db constraints to be attmepted after data entry.
let indexes = []; // to store db indexes to attempted after all data entry and constraints creation.

let rowNumber = 0; // stores current row of flat file that is being processed.

const configFile = process.argv[3] || 'config.csv';
const config = fs.readFileSync(configFile, readFileSyncOptions);

const parseConfig = papa.parse(config, {
    header: false,
    dynamicTyping: true,
    step: function(row) {
      rowNumber ++;
      switch (row.data[0][0]) {
        case 'Node':
          nodesConfig.push({
            tempId: rowNumber,
            labels: row.data[0][1].split(`;`),
            properties: [],
            specialProps: [],
          });
          break;
        case 'ComboNode':
          nodesConfig.push({
            tempId: rowNumber,
            labels: row.data[0][1].split(`;`),
            comboPropName: row.data[0][2],
            comboLeftAccessor: row.data[0][3],
            comboRightAccessor: row.data[0][4],
            properties: [],
            specialProps: [],
          });
          break;
        case 'Relationship':
          relationshipsConfig.push({
            tempId: rowNumber,
            sourceTempId: row.data[0][1],
            targetTempId: row.data[0][2],
            type: row.data[0][3],
            properties: [],
            specialProps: [],
          });
          break;
        case 'Property': // uses tempId (row number) to identify the node or relationship to which the property needs to be attached.
          if (nodeConfig = nodesConfig.find(nodeConfig => nodeConfig.tempId == row.data[0][1])) {
            const propertyObject = getPropertyObject(row.data);
            if ( ["Point", "Date", "Time", "DateTime", "LocalTime", "LocalDateTime", "Duration"].includes(propertyObject.dataType) )
              nodeConfig.specialProps.push(propertyObject);
            else
              nodeConfig.properties.push(propertyObject);
          }
          else if (relationshipConfig = relationshipsConfig.find(relationshipConfig => relationshipConfig.tempId == row.data[0][1])) {
            const propertyObject = getPropertyObject(row.data);
            if ( ["Point", "Date", "Time", "DateTime", "LocalTime", "LocalDateTime", "Duration"].includes(propertyObject.dataType) )
              relationshipConfig.specialProps.push(propertyObject);
            else
              relationshipConfig.properties.push(propertyObject);
          }
          break;
        case 'Constraint':
          const constraintType = row.data[0][1];
          let constraintEntityType, labelOrType, constraintPropS, mode;
          switch ( constraintType.toUpperCase() ) {
            case 'NODEKEY':
            case 'UNIQUE':
              constraintEntityType = 'Node';
              labelOrType = row.data[0][2];
              constraintPropS = row.data[0][3].split(';');
              mode = row.data[0][4];
              break;
            case 'EXISTS':
              constraintEntityType = row.data[0][2];
              labelOrType = row.data[0][3];
              constraintPropS = row.data[0][4].split(';');
              mode = row.data[0][5];
              break;
          }
          const constraintObject = {
            constraintType,
            entityType: constraintEntityType,
            labelOrType,
            propS: constraintPropS,
          };
          if (mode === 'pre')
            preConstraintsConfig.push(constraintObject);
          else
            postConstraintsConfig.push(constraintObject);
          break;
        case 'Index':
          const indexType = row.data[0][1];
          let indexEntityType, labelsOrTypes, indexName, indexPropS;
          switch ( indexType.toUpperCase() ) {
            case 'REGULAR':
              indexEntityType = 'Node';
              labelsOrTypes = row.data[0][2].split(';');
              indexPropS = row.data[0][3].split(';');
              break;
            case 'FTS':
              indexEntityType = row.data[0][2];
              indexName = row.data[0][3];
              labelsOrTypes = row.data[0][4].split(';');
              indexPropS = row.data[0][5].split(';');
          }
          indexes.push({
            indexType: indexType.toUpperCase(),
            entityType: indexEntityType,
            labelsOrTypes,
            indexName,
            propS: indexPropS,
          });
          break;
        default:
          break;
      }
    },
    complete: function() {
      console.log(`Configuration file parsing complete`);
    },
  });

rowNumber = 0; // reset after file is processed.

let nodes = [];
let relationships = [];

const contentFile = process.argv[2] || 'data.csv';
const content = fs.readFileSync(contentFile, readFileSyncOptions); // encoding specification is important for reading files correctly.

let multiplier = nodesConfig.length + relationshipsConfig.length; // count of different kinds of nodes and relationships defined in the configuraion file
const parseContent = papa.parse(content, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  step: function(row) {
    nodesConfig.forEach(nodeConfig => {
      let node = {
        tempId: nodeConfig.tempId + (multiplier * rowNumber), // ensures tempId is uniquely assigned as each kind of node/relationship has id in an arithmetic progression with multiplier as the common difference
        labels: nodeConfig.labels,
        properties: {},
        specialProps: {},
      };
      if ( nodeConfig.comboLeftAccessor && nodeConfig.comboRightAccessor && nodeConfig.comboPropName) { // if it is a ComboNode
        if ( (!row.data[0][nodeConfig.comboLeftAccessor]) || (!row.data[0][nodeConfig.comboRightAccessor]) )
          return;
        node.properties[nodeConfig.comboPropName] = `${row.data[0][nodeConfig.comboLeftAccessor]}-${row.data[0][nodeConfig.comboRightAccessor]}`;
      }
      nodeConfig.properties.forEach(propertyObject => { // for properties defined in configuration file, assign values from data file if the accessors exist
        const value = getPropertyValue(propertyObject, row.data[0]);
        if ( value !== undefined && value !== null)
          node.properties[propertyObject.name] = value;
      });
      nodeConfig.specialProps.forEach(propertyObject => {
        const value = getPropertyValue(propertyObject, row.data[0]);
        if ( value !== undefined && value !== null)
          node.specialProps[propertyObject.name] = value;
      });
      nodes.push(node);
    });
    relationshipsConfig.forEach (relationshipConfig => {
      let relationship = {
        tempId: relationshipConfig.tempId + (multiplier * rowNumber), // ensures tempId is uniquely assigned as each kind of node/relationship has id in an arithmetic progression with multiplier as the common difference
        sourceTempId: relationshipConfig.sourceTempId + (multiplier * rowNumber), // each kind of node/relationship has id in an arithmetic progression with multiplier as the common difference
        targetTempId: relationshipConfig.targetTempId + (multiplier * rowNumber), // each kind of node/relationship has id in an arithmetic progression with multiplier as the common difference
        type: relationshipConfig.type,
        properties: {},
        specialProps: {},
      };
      relationshipConfig.properties.forEach(propertyObject => { // for properties defined in configuration file, assign values from data file if the accessors exist
        const value = getPropertyValue(propertyObject, row.data[0]);
        if ( value !== undefined && value !== null)
          relationship.properties[propertyObject.name] = value;
      });
      relationshipConfig.specialProps.forEach(propertyObject => {
        const value = getPropertyValue(propertyObject, row.data[0]);
        if ( value !== undefined && value !== null)
        relationship.specialProps[propertyObject.name] = value;
      });
      relationships.push(relationship);
    });
    rowNumber++;
  },
  complete: function() {
    console.log(`Content file parsing complete`);
  },
});

const objectFile = process.argv[5] || 'object.js'; // output file
const stream = fs.createWriteStream(objectFile, createWriteStreamOptions);

// The util.inspect() method returns a string representation of object
stream.write(`module.exports = {\n` + `nodes:\n`
              + `${util.inspect(nodes, {depth: null, maxArrayLength: null}) + `\n`}`
              + `,\n`
              + `relationships:\n`
              + `${util.inspect(relationships, {depth: null, maxArrayLength: null}) + `\n`}`
              + `,\n`
              + `preConstraints:\n`
              + `${util.inspect(preConstraintsConfig, {depth: null, maxArrayLength: null}) + `\n`}`
              + `,\n`
              + `postConstraints:\n`
              + `${util.inspect(postConstraintsConfig, {depth: null, maxArrayLength: null}) + `\n`}`
              + `,\n`
              + `indexes:\n`
              + `${util.inspect(indexes, {depth: null, maxArrayLength: null}) + `\n`}`
              + `,\n`
              + `}`
            );
console.log(`Writing to object file complete`);
