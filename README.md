# Flat to Cypher

Utility to generate Cypher text from flat files.

## How it works

Flat to Cypher requires a flat data file _(currently only csv)_ and a flat configuration file _(currently only csv)_ that specifies how to transform the columns in the data file to Cypher.

This is achieved in two stages:

1. **object_builder.js** creates a JavaScript object that contains an array of _node_ objects and an array of _relationship_ objects which describe the relationship amongst these nodes along with arrays of objects that specify the _constraints_ and _indexes_ to be created.

2. **cypher_builder.js** uses the above JavaScript object to generate Cypher text.

## Usage

### To create the Javascript object using object_builder.js

`node object_builder.js [data_file] [config_file] [encoding] [output_file]`

**data_file**: default is ./data.csv

**config_file**: default is ./config.csv

**encoding**: the encoding to use when opening local files; the default is 'utf8'

**output_file**: default is ./object.js

### To generate Cypher from the JavaScript object using cypher_builder.js

`node cypher_builder.js [object_file] [output_file]`

**object_file**: default is ./object.csv

**output_file**: default is ./cypher_script.cql

_**Tip: Run both the commands at once using '&&' to generate Cypher script directly:**_

```shell
node object_builder.js [data_file] [config_file] [encoding] [output_file] && node cypher_builder.js [object_file] [output_file]
```

### Running the script in neo4j

Run the generated Cypher script in neo4j cypher-shell located in the bin directory of the database installation folder in **fail-at-end** mode.

For example:
In the neo4j terminal (which can be accessed from Neo4j Desktop > Manage > Terminal), run the Cypher script using:

`cat <cypher_script_file> | bin/cypher-shell -u <username> -p <password> --format plain --fail-at-end`

_Use **type** instead of **cat** on Windows._

_**Tip: To run all the commands at once to merge into graph database:**_

```shell
node object_builder.js [data_file] [config_file] [encoding] [output_file] && node cypher_builder.js [object_file] [output_file] && cat <cypher_script_file> | <path to neo4j database installation folder>/bin/cypher-shell -u <username> -p <password> --format plain --fail-at-end
```

_Use **type** instead of **cat** on Windows._

_**Tip: To copy current working directory escaping spaces:**_

`printf "%q" "$(pwd)" | pbcopy`

## Example - Short

This example is intended to give the basic idea of how this tool works.

In the _examples_ directory are two files *AB_NYC_2019_sample_data.csv* and *AB_NYC_2019_config.csv*.
The data file is a sample set from the _New York City Airbnb Open Data_ dataset about _Airbnb listings and metrics in NYC, NY, USA (2019)_ which can be found [here](https://www.kaggle.com/dgomonov/new-york-city-airbnb-open-data).

### To create the Javascript object using object_builder.js

`node object_builder.js examples/AB_NYC_2019_sample_data.csv examples/AB_NYC_2019_config.csv`

### To generate Cypher from the JavaScript object using cypher_builder.js

`node cypher_builder.js`

_**Tip: Run both the commands at once using '&&' to generate Cypher script directly:**_

```shell
node object_builder.js examples/AB_NYC_2019_sample_data.csv examples/AB_NYC_2019_config.csv && node cypher_builder.js
```

### Running the script in neo4j

In the neo4j terminal (which can be accessed from Neo4j Desktop > Manage > Terminal), run the Cypher script in **fail-at-end** mode using:

`cat <path_to_flat-to-cypher_root>/cypher_script.cql | bin/cypher-shell -u <username> -p <password> --format plain --fail-at-end`

_Use **type** instead of **cat** on Windows._

_**Tip: To run all the commands at once to merge into graph database:**_

```shell
node object_builder.js examples/AB_NYC_2019_sample_data.csv examples/AB_NYC_2019_config.csv && node cypher_builder.js && cat cypher_script.cql | <path to neo4j database installation folder>/bin/cypher-shell -u <username> -p <password> --format plain --fail-at-end
```

_Use **type** instead of **cat** on Windows._

## Example - Comprehensive

This covers comprehensive examples of usage of all data types and other features of this tool.

In the _examples_ directory are two files *superhero_ratings.csv* and *superhero_ratings_config.csv*.
The data file represents how much a viewer likes the portrayal of "Spiderman" by different actors.
It also consists of some properties of the series of movies by these actors and the viewers' relationship with the series such as whether they watched all the movies in the series, their favourite quote from the series, etc.

### To create the Javascript object using object_builder.js

`node object_builder.js examples/superhero_ratings.csv examples/superhero_ratings_config.csv`

### To generate Cypher from the JavaScript object using cypher_builder.js

`node cypher_builder.js`

_**Tip: Run both the commands at once using '&&' to generate Cypher script directly:**_

```shell
node object_builder.js examples/superhero_ratings.csv examples/superhero_ratings_config.csv && node cypher_builder.js
```

### Running the script in neo4j

In the neo4j terminal (which can be accessed from Neo4j Desktop > Manage > Terminal), run the Cypher script in **fail-at-end** mode using:

`cat <path_to_flat-to-cypher_root>/cypher_script.cql | bin/cypher-shell -u <username> -p <password> --format plain --fail-at-end`

_Use **type** instead of **cat** on Windows._

_**Tip: To run all the commands at once to merge into graph database:**_

```shell
node object_builder.js examples/superhero_ratings.csv examples/superhero_ratings_config.csv && node cypher_builder.js && cat cypher_script.cql | <path to neo4j database installation folder>/bin/cypher-shell -u <username> -p <password> --format plain --fail-at-end
```

_Use **type** instead of **cat** on Windows._

## Configuration file

The configuration is also a flat file _(currently only csv)_ that specifies how to transform the columns in the data file to Cypher.

The configuration file should handle each (desired) column in the data file to transform it into a Node, Relationship, Property, Constraint or an Index.

**Node**: This specifies the labels with which a node should be created. Each node should have at least one property specified later on. Nodes without any property will not be created.

Example:

_data_file_:
```
movie_title,actor_1,actor_2,director
Fight Club,Brad Pitt,Edward Norton,David Fincher
```
_config_file_:
```
Node,Movie
Node,Actor
Node,Actor
Node,Director
Property,1,String,title,movie_title
Property,2,String,name,actor_1
Property,3,String,name,actor_2
Property,4,String,name,director
```

The program would create _Movie_, _Actor_ and _Director_ nodes with property names: _title_, _name_, _name_ obtained from the specified columns _movie_title_, _actor_1_, _actor_2_, _director_ respectively.

**Note it is required that _Node,Actor_ configuration be specified twice since their property _name_ is fed by two different columns (_actor_1_, _actor_2_) in the data file. Thus, both these columns in the data file should be handled to create desired Actor nodes.**

The generated Cypher would be:
```
MERGE (:Movie { title: 'Fight Club' });
MERGE (:Actor { name: 'Brad Pitt' });
MERGE (:Actor { name: 'Edward Norton' });
MERGE (:Director { name: 'David Fincher' });
```

If multiple labels are required, they should be separated by a semicolon.

`Node,Actor;Person` would transform to `MERGE (:Actor:Person { name: 'Edward Norton' });`

**ComboNode**: These nodes are formed by joining two columns in the flat file when a node which is a combination of both is required (such as when modelling a hyperedge)

Example:

_data_file_:
```
company_name,product_type,market_share
Michelin,Tyre,20
Bridgestone,Tyre,30
```

_config_file_:
```
ComboNode,CompanyProduct,name,company_name,product_type
Property,1,Float,market_share,market_share
```
The program would create _nodes_ with label _CompanyProduct_ and assign them property _name_ which would be values of _company_name_ and _product_type_ columns concatenated by _'-'_.

**Note that the two columns which would be combined to create the combination node (_company_name, product_type_) must be specified immediately.
Other properties of this node (_market_share_) will be specified later on.**

The generated Cypher would be:
```
MERGE (:CompanyProduct { name: 'Michelin-Tyre', market_share: 20});
MERGE (:CompanyProduct { name: 'Bridgestone-Tyre', market_share: 30 });

```

If multiple labels are required, they should be separated by a semicolon.

**Relationship**: This defines a relationship between two nodes using their row numbers in the configuration file to identify the source and target nodes.

Example:

_data_file_:
```
movie,imdb_rating,actor,director
Fight Club,8.8,John Travolta,Quentin Tarantino
```

_config_file_:
```
Node,Movie
Node,Actor
Node,Director
Relationship,2,1,ACTED_IN
Relationship,3,1,DIRECTED
Property,1,String,title,movie
Property,1,Float,rating,imdb_rating
Property,2,String,name,actor
Property,3,String,name,director
```

The program, after having created _Movie_, _Actor_ and _Director_ nodes, would create relationships `(s:Actor)-[:ACTED_IN]->(t:Movie)` and `(s:Director)-[:DIRECTED->(t:Movie)` since the _Movie_, _Actor_ and _Director_ nodes are defined in the first, second and third rows respectively.

**Property**: This specifies a property of a node or a relationship using the row number in the configuration file to identify the node/relationship.

Example:

_data_file_:
```
movie,running_time,country,release_date
Spider-Man,02:01,USA,2002-05-03
Spider-Man,02:01,Australia,2002-06-06
```

_config_file_:
```
Node,Movie
Node,Country
Relationship,1,2,RELEASED_IN
Property,1,String,title,movie
Property,1,Duration,running_time,running_time
Property,2,String,name,country
Property,3,Date,released_on,release_date,YYYY-MM-DD
```

The program would look for *movie* and *running_time* columns in the data file and assign them to properties *title* and *running_time* respectively of the _Movie_ node. Similary, _Country_ node would be made having property _name_ from the column _country_. Also, the program would look for *release_date* and assign it to property *released_on* of the relationship between the respective _Movie_ and _Country_ nodes.

Generated Cypher would be equivalent of:
```
(s:Movie {title: 'Spider-Man', running_time: 'PT2H1M'})
(t1:Country {name: 'USA'})
(t2:Country {name: 'Australia'})
(s)-[:RELEASED_IN {released_on: "2002-05-03"}]->(t1)
(s)-[:RELEASED_IN {released_on: "2002-06-06"}]->(t2)
```

All the data types of neo4j (_Integer, Float, String, Boolean, Point, Date, Time, LocalTime, DateTime, LocalDateTime, Duration_) are supported to be configured as properties and configuration row formats for each of them is detailed later in this document.

**Constraint**: This specifies the constraints to be created on a property of a node or a relationship.

A constraint can be specified to be created in two **modes**:

1. **pre:** Constraint is created before any node or relationship. Hence, if a data field violates this constraint, that data point will not be created.

2. **post:** Constraint creation is attempted after creation of all nodes and relationships along with their properties. Thus, is constraint criteria is not met, then the constraint creation would fail.

Example:

_data_file_:
```
person_id,person_name
666,Neo
666,Trinity
```
_config_file_:
```
Node,Person
Property,1,Integer,id,person_id
Property,1,String,name,person_name
Constraint,UNIQUE,Person,id,pre
```

For the UNIQUE constraint specified on _id_ of _Person_ label in **_pre_** mode, the **constraint would be created** and _Trinity_ node creation would fail since there would already be a _Person_ with the same id (666) called _Neo_.

_config_file_:
```
Node,Person
Property,1,Integer,id,person_id
Property,1,String,name,person_name
Constraint,UNIQUE,Person,id,post
```

For the UNIQUE constraint specified on _id_ of _Person_ label in **_post_** mode, **both _Neo_ and _Trinity_ nodes would get created with id 666**. Constraint creation would fail since _id_ of _Person_ labels are not unique.

_Thus, **pre** mode guarantees constraint creation while data creation may fail, whereas **post** mode guarantees data creation while constraint creation may fail._

```
Constraint,NODEKEY,Superhero,name,pre
Constraint,UNIQUE,Viewer,id,pre
Constraint,EXISTS,Node,Viewer,id,pre
Constraint,EXISTS,Relationship,VIEWED,rating,post
```

**Index**: This specifies the index to be created on a property of a node or a relationship.

Indexes are always attempted to be created at the end.

Both _Regular_ and _Full text schema_ indexes are supported.

Example:

```
Index,Regular,Borough,name
Index,Regular,Neighbourhood,name
Index,FTS,Node,namesAndType,Listing;Neighbourhood;Borough;AccomodationType,name;type
```
