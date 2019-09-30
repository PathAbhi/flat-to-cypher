// The util.inspect() method returns a string representation of object that is intended for debugging.
const util = require('util'); // required for util.inspect()
// The output of util.inspect may change at any time and should not be depended upon programmatically.

const fs = require('fs');
require('./getConstraintCypher')();
require('./getIndexCypher')();

const createWriteStreamOptions = {};

const dataFile = process.argv[2] || 'object.js'; // input file
const data = require(`./${dataFile}`);

const cypher_script_file = process.argv[3] || 'cypher_script.cql'; // output file
const stream = fs.createWriteStream(cypher_script_file, createWriteStreamOptions);
// stream.write(`MATCH (n) DETACH DELETE (n);\n`);  // uncomment to delete all nodes and relationships at the start of the script
// stream.write(`call apoc.schema.assert({}, {});\n`); // uncomment to drop all constraints and regular indexes at the start of the script. However this cannot drop full text schema indexes

data.preConstraints.forEach(preConstraints => stream.write(getConstraintCypher(preConstraints) + '\n'));

let vertices = [];
data.nodes.forEach(node => {
  const { tempId, labels, properties, specialProps } = node;
  if ( ( Object.keys(properties).length !== 0 || Object.keys(specialProps).length !== 0 ) )
    vertices.push({ tempId, labels, properties, specialProps});
  stream.write(`MERGE (:${labels.join(":")}`);
  const propertiesString = ` ${util.inspect(node.properties, {depth: null, maxArrayLength: null})}`;
  stream.write(propertiesString.slice(0, -1));
  if (Object.keys(node.properties).length && Object.keys(node.specialProps).length)
    stream.write(` ,`);
  Object.keys(node.specialProps).forEach((key, i, thisArray) => {
    if ( i === thisArray.length - 1)
      stream.write(` ${key}: ${node.specialProps[key]}`);
    else
      stream.write(` ${key}: ${node.specialProps[key]}, `);
  });
  stream.write(`});\n`);
});

data.relationships.forEach(relationship => {
  const source_vertex = vertices.find(vertex => vertex.tempId == relationship.sourceTempId);
  const target_vertex = vertices.find(vertex => vertex.tempId == relationship.targetTempId);

  if (!source_vertex || !target_vertex)
    return;

  const { labels: sourceLabels, properties: sourceProperties, specialProps: sourceSpecialProps } = source_vertex;
  stream.write(`MATCH (s:${sourceLabels.join(":")}`);
  const sourcePropertiesString = ` ${util.inspect(sourceProperties, {depth: null, maxArrayLength: null})}`;
  stream.write(sourcePropertiesString.slice(0, -1));
  if (Object.keys(sourceProperties).length && Object.keys(sourceSpecialProps).length)
    stream.write(` ,`);
  Object.keys(sourceSpecialProps).forEach((key, i, thisArray) => {
    if ( i === thisArray.length - 1)
      stream.write(` ${key}: ${sourceSpecialProps[key]}`);
    else
      stream.write(` ${key}: ${sourceSpecialProps[key]}, `);
  });
  stream.write(`})\n`);

  const { labels: targetLabels, properties: targetProperties, specialProps: targetSpecialProps } = target_vertex;
  stream.write(`MATCH (t:${targetLabels.join(":")}`);
  const targetPropertiesString = ` ${util.inspect(targetProperties, {depth: null, maxArrayLength: null})}`;
  stream.write(targetPropertiesString.slice(0, -1));
  if (Object.keys(targetProperties).length && Object.keys(targetSpecialProps).length)
    stream.write(` ,`);
  Object.keys(targetSpecialProps).forEach((key, i, thisArray) => {
    if ( i === thisArray.length - 1)
      stream.write(` ${key}: ${targetSpecialProps[key]}`);
    else
      stream.write(` ${key}: ${targetSpecialProps[key]}, `);
  });
  stream.write(`})\n`);

  const { type, properties: relProperties, specialProps: relSpecialProps } = relationship;
  stream.write(`MERGE (s)-[r:${type}`);
  const relPropertiesString = ` ${util.inspect(relProperties, {depth: null, maxArrayLength: null})}`;
  stream.write(relPropertiesString.slice(0, -1));
  if (Object.keys(relProperties).length && Object.keys(relSpecialProps).length)
    stream.write(` ,`);
  Object.keys(relSpecialProps).forEach((key, i, thisArray) => {
    if ( i === thisArray.length - 1)
      stream.write(` ${key}: ${relSpecialProps[key]}`);
    else
      stream.write(` ${key}: ${relSpecialProps[key]}, `);
  });
  stream.write(`}]->(t);\n`);
});

data.postConstraints.forEach(postConstraint => stream.write(getConstraintCypher(postConstraint) + '\n'));

data.indexes.forEach( index => stream.write(getIndexCypher(index) + '\n'));

console.log(`Writing to insert script file complete`);