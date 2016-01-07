(function () {
	"use strict";
	angular.module("mmAngularDrawChem")
		.directive("drawChemEditor", DrawChemEditor);
	
	DrawChemEditor.$inject = ["DrawChemShapes", "DrawChemStructures", "DrawChem", "$sce", "$window", "DrawChemConst"];
	
	function DrawChemEditor(DrawChemShapes, DrawChemStructures, DrawChem, $sce, $window, DrawChemConst) {
		return {
			templateUrl: "draw-chem-editor.html",
			scope: {
				showEditor: "="
			},
			link: function (scope, element, attrs) {
				
				var downAtomCoords,
					mouseDown = false,
					downOnAtom = false;
				
				/**
				 * Sets width and height of the dialog box based on corresponding attributes.
				 */
				scope.dialogStyle = {};
				if (attrs.width) {
					scope.dialogStyle.width = attrs.width;					
				}
				if (attrs.height) {
					scope.dialogStyle.height = attrs.height;					
				}
				
				/**
				 * Closes the editor.
				 */
				scope.closeEditor = function () {
					DrawChem.closeEditor();
				}
				
				/**
				 * Returns content to be bound in the dialog box.
				 */
				scope.content = function () {
					return $sce.trustAsHtml(DrawChem.getContent());
				}
				
				/**
				 * Clears the content.
				 */
				scope.clear = function () {
					DrawChem.clearContent();
				}
				
				/**
				 * Transfers the content.
				 */
				scope.transfer = function () {
					DrawChem.transferContent();
				}
				
				/**
				 * Stores the chosen structure.
				 */
				scope.chosenStructure;
				
				/**
				 * Stores the current structure.
				 */
				scope.currentStructure;
				
				/**
				 * Stores all predefined structures.
				 */
				scope.customButtons = [];
				
				/**
				 * Adds all predefined shapes to the scope.
				 */
				angular.forEach(DrawChemStructures.custom, function (custom) {
					var customInstance = custom();
					scope.customButtons.push({
						name: customInstance.name,
						choose: function () {
							scope.chosenStructure = customInstance;
						}
					});
				});
				
				/**
				 * 
				 */
				scope.doOnMouseDown = function ($event) {
					var clickCoords = innerCoords($event);						
					mouseDown = true;
					if (DrawChem.getContent() !== "") {
						downAtomCoords = DrawChemShapes.isWithin(scope.currentStructure, clickCoords);
						downOnAtom = true;
					}
				}
				
				/**
				 *
				 */
				scope.doOnMouseUp = function ($event) {				
					var clickCoords = innerCoords($event), // coordinates of the mouse click
						drawn = "";
					modifyCurrentStructure();
					drawn = DrawChemShapes.draw(scope.currentStructure, "cmpd1").generate();
					DrawChem.setContent(drawn);
					resetMouseFlags();
					
					function modifyCurrentStructure() {
						if (DrawChem.getContent() !== "") {
							// if the content is not empty, then modify current structure
							DrawChemShapes.modifyStructure(
								scope.currentStructure,
								angular.copy(scope.chosenStructure),
								clickCoords,
								downAtomCoords
							);
						} else {
							// if the content is empty, then copy the chosen structure and assign it as a current structure
							scope.currentStructure = angular.copy(scope.chosenStructure).getDefault();
							scope.currentStructure.setOrigin(clickCoords);
						}
					}
				}
				
				/**
				 *
				 */
				scope.doOnMouseMove = function ($event) {
									
				}
				
				function innerCoords($event) {
					// calculates the coordinates of the click; takes margin of the enclosing div into account
					var content = element.find("dc-content")[0],
						coords = [								
							parseFloat(($event.clientX - content.getBoundingClientRect().left - 2).toFixed(2)),
							parseFloat(($event.clientY - content.getBoundingClientRect().top - 2).toFixed(2))
						]
					return coords;
				}
				
				function resetMouseFlags() {
					mouseDown = false;
					downOnAtom = false;
					downAtomCoords = undefined;
				}
			}
		}
	}
})();