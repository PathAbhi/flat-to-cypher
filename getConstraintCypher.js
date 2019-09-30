module.exports = function() { 
    this.getConstraintCypher = function(constraint) {

        const { constraintType, entityType, labelOrType, propS } = constraint;

        switch ( constraintType ) {
            case 'UNIQUE':
                return `CREATE CONSTRAINT ON (n:${labelOrType}) ASSERT n.${propS[0]} IS UNIQUE;`;
            case 'EXISTS':
            if ( entityType === 'Node' )
                return `CREATE CONSTRAINT ON (n:${labelOrType}) ASSERT exists(n.${propS[0]});`;
            else
                return `CREATE CONSTRAINT ON ()-[r:${labelOrType}]-() ASSERT exists(r.${propS[0]});`;
            case 'NODEKEY':
                return `CREATE CONSTRAINT ON (n:${labelOrType}) ASSERT (${propS.map(prop => `n.${prop}`)}) IS NODE KEY;`;
            default:
                return;
        }

    };
}