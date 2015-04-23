/**
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.EdgesGeometry = function ( geometry, thresholdAngle ) {

	THREE.BufferGeometry.call( this );

	thresholdAngle = ( thresholdAngle !== undefined ) ? thresholdAngle : 1;

	var thresholdDot = Math.cos( THREE.Math.degToRad( thresholdAngle ) );

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c' ];

	var geometry2;

	if ( geometry instanceof THREE.BufferGeometry ) {

		geometry2 = new THREE.Geometry();
		geometry2.fromBufferGeometry( geometry );

	} else {

		geometry2 = geometry.clone();

	}

	geometry2.mergeVertices();
	geometry2.computeFaceNormals();

	var vertices = geometry2.vertices;
	var faces = geometry2.faces;
	var numEdges = 0;

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		var face = faces[ i ];

		for ( var j = 0; j < 3; j ++ ) {

			edge[ 0 ] = face[ keys[ j ] ];
			edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
			edge.sort( sortFunction );

			var key = edge.toString();

			var h = hash[ key ];

			if ( h === undefined ) {

				hash[ key ] = { vert1: edge[ 0 ], vert2: edge[ 1 ], face1: i, coplanar: undefined };
				numEdges ++;

			} else {

				if ( h.coplanar !== undefined ) {

					if ( h.coplanar === true ) {

						numEdges ++;

					}

					h.coplanar = false;

				} else {

					var keep = ( faces[ h.face1 ].normal.dot( face.normal ) <= thresholdDot );

					if ( keep === false ) {

						numEdges --;

					}

					h.coplanar = !keep;

				}

			}

		}

	}

	var coords = new Float32Array( numEdges * 2 * 3 );

	var index = 0;

	for ( var key in hash ) {

		var h = hash[ key ];

		if ( h.coplanar === undefined || h.coplanar === false ) {

			var vertex = vertices[ h.vert1 ];
			coords[ index ++ ] = vertex.x;
			coords[ index ++ ] = vertex.y;
			coords[ index ++ ] = vertex.z;

			vertex = vertices[ h.vert2 ];
			coords[ index ++ ] = vertex.x;
			coords[ index ++ ] = vertex.y;
			coords[ index ++ ] = vertex.z;

		}

	}

	this.addAttribute( 'position', new THREE.BufferAttribute( coords, 3 ) );

};

THREE.EdgesGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.EdgesGeometry.prototype.constructor = THREE.EdgesGeometry;
