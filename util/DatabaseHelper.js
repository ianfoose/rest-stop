var mysql = require('mysql');

var conOptions = {};
var con;

/**
* @constructor Setus up params for DatabaseHelper
*
* @param configs Object of configuration values to connect to MySQL Server
*
* @return void
*/
module.exports = function(configs) {
	conOptions = {
	  host: configs.host,
	  user: configs.username,
	  password: configs.password
	}

	if(configs['db']) {
		conOptions['database'] = configs['db'];
	}

	if(configs['port']) {
		conOptions['port'] = configs['port'];
	}
}

/**
* Connectes to a mysql server
*
* @return void
*/
function connect() {
	con = mysql.createConnection(conOptions);

	// connect
	con.connect((err) => {
	  if (err) throw err;
	});
}

/**
* Converts a key value dictionary to a query string of parameters and values
*
* @param vals Object to convert to query string
*
* @return string
*/
function objToQuery(vals, delimit, first) {
	var query = '';
	var delimeter = ' AND ' ;

	if(delimit != null) {
		delimeter = ' '+delimit.toUpperCase()+' ';
	}

	i=0;

	for (var key in vals) {
		key = key.toLowerCase();

		let keyLength = Object.keys(vals).length;

		if(keyLength > 1 && i==0 && !first) {
			query += '(';
		}

		if (key == 'and') {
			if(query != '') {
				query += ' AND ';
			}

			query += objToQuery(vals[key], 'and');
		} else if(key == 'or') {
			if(query != '') {
				query += ' OR ';
			}
			query += objToQuery(vals[key], 'or');
		} else if(key == 'like') {
			var likei = 0;

			if(query != '') {
				query += delimeter;
			}

			for (var likeKey in vals[key]) {
				likei++;

				query += (likeKey+' LIKE "'+vals[key][likeKey]+'"')

				if(likei < keyLength - 1) {
					query += delimeter;
				}
			}
		} else {
			if (i > 0 && i <= keyLength) {
				query += delimeter
			}

			query += (key+'='+'"'+vals[key]+'"');
		}
		
		// close query
		if(i == (keyLength - 1)) {
			//if(keyLength >= 1) {
				query += ')';
				break;
			//cle}
		}

		i++;
	}

	return query;
}

/**
* Builds a query string with values
*
* @param baseQuery String Query String to append to
* @param vals Object of values for query
* @param required Object of required clauses
*
* @return void
*/
function buildQuery(query, vals, required) {
	if(vals.table) {
		if(vals.where) {
			query += " WHERE ";
			query += objToQuery(vals.where, null, true);
		} else {
			if(required && required.where) {
				throw new Error('No Where values');
			}
		}

		if(vals.set) {
			query += " SET ";
			query += objToQuery(vals);
		} else {
			if(required && required.set) {
				throw new Error('No set values');
			}
		}

		if(vals.orderBy) query += " ORDER BY " + vals.orderBy;

		if(vals.offset) query += " OFFSET " + vals.offset;

		if(vals.limit) query += " LIMIT " + vals.limit;

		return query;
	} else {
		throw new Error('No Table Specified');
	}	
}

/**
* Queries the database
*
* @param queryString String containing the database query
* @param callback (results, error)
*
* @return void
*/
module.exports.query = function(queryString, callback) {
	try {	
		connect();

		var results = con.query(queryString, (err, results) => {
			callback(results, err);
		});
	} catch (err) {
		callback(null, err);
	}
}

/**
* Inserts an object into the DB
*
* @param vals Object values to write to DB
* @param callback (results, error)
*
* @return void
*/
module.exports.insert = function(vals, callback) {
	try {
		var query = "INSERT INTO "+vals.table;

		query = buildQuery(query, vals);

		this.query(query, callback);
	} catch(err) {
		callback(null, err);
	}
}

/**
* Updates a DB Object
*
* @param vals Object values to write to DB
* @param callback (results, error)
*
* @return void
*/
module.exports.update = function(vals, callback) {
	try {
		var query = "UPDATE "+vals.table;

		query = buildQuery(query, vals, {'set':true});

		this.query(query, callback);
	} catch(err) {
		callback(null, err);
	}
}

/**
* Deletes an object from the database
*
* @param vals Object values to delete from DB
* @param callback (results, error)
*
* @return void
*/
module.exports.delete = function(vals, callback) {
	try {
		var query = "DELETE FROM ";

		query = buildQuery(query, vals, {'where':true});

		this.query(query, callback);
	} catch(err) {
		callback(null, err);
	}
}

/**
* Find an Object(s) in DB
*
* @param vals Values to look for in DB
* @param callback (results, error)
*
* @return 
*/
module.exports.find = function(vals, callback) {
	try {
		var columns = '*';
		if(vals.columns) {
			columns = vals.columns.join(',');
		}

		var query = "SELECT "+columns+" FROM ";

		query = buildQuery(query, vals);

		this.query(query, callback);
	} catch(err) {
		callback(null, err);
	}
}

/**
* Find one object
*
* @param vals Object to find in DB
* @param callback (results, error)
*
* @return void
*/
module.exports.findOne = function(vals, callback) {
	try {
		var columns = '*';
		if(vals.columns) {
			columns = vals.columns.join(',');
		}

		var query = "SELECT "+columns+" FROM "+vals.table;

		query = buildQuery(query, vals);
		query += " LIMIT 1";

		this.query(query, callback);
	} catch (err) {
		callback(null, err);
	}
} 
