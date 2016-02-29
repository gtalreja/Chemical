(function () {
	"use strict";
	angular.module("mmAngularDrawChem")
		.factory("DrawChemStructures", DrawChemStructures);

	DrawChemStructures.$inject = [
		"DrawChemConst",
		"DCStructure",
		"DCStructureCluster",
		"DCAtom",
		"DCBond",
		"DrawChemDirectiveFlags"
	];

	function DrawChemStructures(Const, DCStructure, DCStructureCluster, DCAtom, DCBond, Flags) {

		var service = {},
			Atom = DCAtom.Atom,
			Bond = DCBond.Bond,
			Structure = DCStructure.Structure,
			StructureCluster = DCStructureCluster.StructureCluster,
			BONDS = Const.BONDS;

		/**
		 * Generates benzene structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.benzene = function () {
			var cluster,
				multiplicity = "triple",
				name = "benzene",
				defs = generateSixMemberedRings("aromatic");

			cluster = new StructureCluster(name, defs, multiplicity);
			return cluster;
		};

		/**
		 * Generates cyclohexane structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.cyclohexane = function () {
			var cluster,
				multiplicity = "double",
				name = "cyclohexane",
				defs = generateSixMemberedRings();

			cluster = new StructureCluster(name, defs, multiplicity);

			return cluster;
		};

		/**
		 * Generates single bond structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.singleBond = function () {
			var cluster,
				multiplicity = "single",
				name = "single-bond",
				defs = generateBonds("single", multiplicity);

			cluster = new StructureCluster(name, defs, multiplicity);

			return cluster;
		};

		/**
		 * Generates double bond structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.doubleBond = function () {
			var cluster,
				multiplicity = "double",
				name = "double-bond",
				defs = generateBonds("double", multiplicity);

			cluster = new StructureCluster(name, defs, multiplicity);

			return cluster;
		};

		/**
		 * Generates triple bond structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.tripleBond = function () {
			var cluster,
				multiplicity = "triple",
				name = "triple-bond",
				defs = generateBonds("triple", multiplicity);

			cluster = new StructureCluster(name, defs, multiplicity);

			return cluster;
		};

		/**
		 * Generates wedge bond structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.wedgeBond = function () {
			var cluster,
				multiplicity = "single",
				name = "wedge-bond",
				defs = generateBonds("wedge", multiplicity);

			cluster = new StructureCluster(name, defs, multiplicity);

			return cluster;
		};

		/**
		 * Generates wedge bond structures in each defined direction.
		 * @returns {StructureCluster}
		 */
		service.dashBond = function () {
			var cluster,
				multiplicity = "single",
				name = "dash-bond",
				defs = generateBonds("dash", multiplicity);

			cluster = new StructureCluster(name, defs, multiplicity);

			return cluster;
		};

		/**
		 * Stores all predefined structures.
		 */
		service.structures = {
			"benzene": {
				action: createStructureAction(service.benzene),
				thumbnail: true
			},
			"cyclohexane": {
				action: createStructureAction(service.cyclohexane),
				thumbnail: true
			},
			"single-bond": {
				action: createStructureAction(service.singleBond),
				thumbnail: true
			},
			"wedge-bond": {
				action: createStructureAction(service.wedgeBond),
				thumbnail: true
			},
			"dash-bond": {
				action: createStructureAction(service.dashBond),
				thumbnail: true
			},
			"double-bond": {
				action: createStructureAction(service.doubleBond),
				thumbnail: true
			},
			"triple-bond": {
				action: createStructureAction(service.tripleBond),
				thumbnail: true
			}
		};

		return service;

		function createStructureAction(cb) {
			return function (scope) {
				scope.chosenStructure = cb();
				Flags.selected = "structure";
			}
		}

		/**
		 * Generates six-membered rings (60 deg between bonds) in each of defined direction.
		 * @param {String} decorate - indicates decorate element (e.g. aromatic ring)
		 * @returns {Structure[]}
		 */
		function generateSixMemberedRings(decorate) {
			var i, direction, result = [];
			for (i = 0; i < BONDS.length; i += 1) {
				direction = BONDS[i].direction;
				result.push(generateRing(direction));
			}

			return result;

			/**
			 * Generates a six-membered ring in the specified direction.
			 * This may be a little bit confusing, but in this function, the direction parameter (e.g. N, NE1)
			 * is associated not only with the bond direction,
			 * but is also used to indicate the relative position of an atom.
			 * @param {String} direction - direction of the ring
			 * @returns {Structure}
			 */
			function generateRing(direction) {
				var firstAtom, structure, bond,
					dirs = calcDirections(direction),
					opposite = Atom.getOppositeDirection(direction);

				firstAtom = new Atom([0, 0], [], "", dirs.current);
				genAtoms(firstAtom, dirs, 6);
				structure = new Structure(opposite, [firstAtom]);
				if (typeof decorate !== "undefined") {
					bond = Const.getBondByDirection(opposite).bond;
					structure.addDecorate(decorate, [bond[0], bond[1]]);
				}

				return structure;

				/**
				 * Recursievely generates atoms.
				 * @param {Atom} atom - atom to which next atom will be added.
				 * @param {Object} dirs - keeps track of attached bonds, next bond and next atom
				 * @param {Number} depth - current depth of the structure tree
				 */
				function genAtoms(atom, dirs, depth) {
					var newDirs = calcDirections(dirs.nextDirection), newAtom;
					if (depth === 1) {
						return atom.addBond(new Bond("single", new Atom(dirs.nextBond, [], "", [newDirs.current[0]])));
					}
					newAtom = new Atom(dirs.nextBond, [], "", newDirs.current);
					atom.addBond(new Bond("single", newAtom));
					genAtoms(newAtom, newDirs, depth - 1);
				}

				/**
				 * Calculates attached bonds, next bond and next atom.
				 * @param {String} direction - direction based on which calculations are made
				 * @returns {Object}
				 */
				function calcDirections(direction) {
					var i, left, right, next;

					for (i = 0; i < BONDS.length; i += 1) {
						if (BONDS[i].direction === direction) {
							left = moveToLeft(BONDS, i, 4);
							right = moveToRight(BONDS, i, 4);
							next = moveToRight(BONDS, i, 2);
							break;
						}
					}

					return {
						// attached bonds
						current: [{ direction: BONDS[left].direction, type: "single" }, { direction: BONDS[right].direction, type: "single" }],
						// next bond
						nextBond: BONDS[right].bond,
						// next direction
						nextDirection: BONDS[next].direction
					};

					// this way, the array can be used circularly
					function moveToLeft(array, index, d) {
						if (index - d < 0) {
							return index - d + array.length;
						}
						return index - d;
					}

					// this way, the array can be used circularly
					function moveToRight(array, index, d) {
						if (index + d > array.length - 1) {
							return index + d - array.length;
						}
						return index + d;
					}
				}
			}
		}

		/**
		 * Generates single bonds in all defined directions.
		 * @param {String} type - bond type, e.g. 'single', 'double'.
		 * @returns {Structure[]}
		 */
		function generateBonds(type, multiplicity) {
			var i, bond, direction, result = [];
			for (i = 0; i < BONDS.length; i += 1) {
				bond = BONDS[i].bond;
				direction = BONDS[i].direction;
				result.push(
					new Structure(
						direction,
						[
							new Atom([0, 0], [
								new Bond(type, new Atom(bond, [], "", [{ direction: Atom.getOppositeDirection(direction), type: multiplicity }]))
							], "", [{ direction: direction, type: multiplicity }])
						]
					)
				);
			}

			return result;
		}
	}
})();
