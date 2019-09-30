module.exports = function() { 
    this.getIndexCypher = function(index) {

        const { indexType, entityType, labelsOrTypes, indexName, propS } = index;

        switch ( indexType ) {
            case 'REGULAR':
                return `CREATE INDEX ON :${labelsOrTypes[0]}(${propS});`;
            case 'FTS':
            if ( entityType === 'Node' )
                return `CALL db.index.fulltext.createNodeIndex("`
                +   `${indexName}",[${labelsOrTypes.map(lOT => `"${lOT}"`)}],[${propS.map(prop => `"${prop}"`)}]);`;
            else
                return `CALL db.index.fulltext.createRelationshipIndex("`
                +   `${indexName}",[${labelsOrTypes.map(lOT => `"${lOT}"`)}],[${propS.map(prop => `"${prop}"`)}]);`;
            default:
                return;
        }

    };
}