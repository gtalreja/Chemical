describe("DrawChemEditor directive tests", function () {
	beforeEach(module("mmAngularDrawChem"));
	
	var $scope, element, $rootScope, DrawChem, DrawChemShapes, DrawChemStructures, template;
	
	beforeEach(inject(function ($httpBackend, $compile, _$rootScope_, _DrawChem_, _DrawChemShapes_, _DrawChemStructures_) {
		// configure path for static files
		jasmine.getFixtures().fixturesPath = "base/assets/";
		// load template of the editor
		template = readFixtures("draw-chem-editor.html");
		
		DrawChem = _DrawChem_;
		DrawChemShapes = _DrawChemShapes_;
		DrawChemStructures = _DrawChemStructures_;
		$rootScope = _$rootScope_;
		
		$scope = $rootScope.$new();
		element = angular.element(
			"<div draw-chem-editor></div>"
		);		
		temp = $compile(element)($scope);
		$httpBackend
			.expectGET("draw-chem-editor.html")
			.respond(template);
		$scope.$digest();
		$httpBackend.flush();
	}));
	
	it("should close the editor", function () {
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		// if the close button has been clicked
		temp.find(".dc-editor-close").click();
		expect(DrawChem.showEditor()).toEqual(false);
		
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		// if the background has been clicked
		temp.find(".dc-editor-overlay").click();
		expect(DrawChem.showEditor()).toEqual(false);
	});
	
	it("should choose a scaffold", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());		
	});
	
	it("should store the current structure (as a Structure object)", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		expect(element.isolateScope().currentStructure).toBeUndefined();
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 2,
			clientY: 2
		});
		custom.getDefault().setOrigin([0, 0]);
		expect(element.isolateScope().currentStructure).toEqual(custom.getDefault());	
	});
	
	it("should set the content after clicking on the 'transfer' button", function () {
		var parallelScope = $rootScope.$new();
		parallelScope.input = function () {
			return DrawChem.getContent("test");
		}
		parallelScope.run = function () {
			DrawChem.runEditor("test");
		}
		
		parallelScope.run();
		expect(DrawChem.showEditor()).toEqual(true);
		expect(parallelScope.input()).toEqual("");
		DrawChem.setContent("A content");
		temp.find("#dc-transfer").click();
		expect(parallelScope.input()).toEqual("A content");
	});
	
	it("should change content of the output after clicking on the drawing area", function () {
		var custom = DrawChemStructures.benzene();		
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 2,
			clientY: 2
		});
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								"path{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
								"circle.atom:hover{" +
									"opacity:0.3;" +
									"stroke:black;" +
									"stroke-width:0.8;" +
								"}" +
								"circle.atom{" +
									"opacity:0;" +
								"}" +
								"circle.arom{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
							"</style>" +
							"<path d=\"M 0 0 L 17.32 10 L 17.32 30 L 0 40 L -17.32 30 L -17.32 10 Z \"></path>" +
							"<circle class=\"atom\" cx=\"0\" cy=\"0\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"17.32\" cy=\"10\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"17.32\" cy=\"30\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"0\" cy=\"40\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"-17.32\" cy=\"30\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"-17.32\" cy=\"10\" r=\"2.4\"></circle>" +
							"<circle class=\"arom\" cx=\"0\" cy=\"20\" r=\"9\"></circle>" +
						"</g>" +
				"</svg>"
			);		
	});
	
	it("should clear the content after clicking on the 'clear' button", function () {
		var custom = DrawChemStructures.benzene();		
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);		
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 2,
			clientY: 2
		});
		temp.find(".dc-custom-button").click();
		expect(temp.find(".dc-editor-dialog-content").html()).toEqual("");
	});
	
	it("should render a modified structure", function () {
		var custom = DrawChemStructures.benzene(),
			add = DrawChemStructures.singleBond();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);		
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 100,
			clientY: 100
		});
		temp.find("#dc-" + add.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(add.getDefault());
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 101,
			clientY: 99
		});
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								"path{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
								"circle.atom:hover{" +
									"opacity:0.3;" +
									"stroke:black;" +
									"stroke-width:0.8;" +
								"}" +
								"circle.atom{" +
									"opacity:0;" +
								"}" +
								"circle.arom{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
							"</style>" +
							"<path d=\"M 98 98 L 115.32 108 L 115.32 128 L 98 138 L 80.68 128 L 80.68 108 Z \"></path>" +	
							"<path d=\"M 98 98 L 98 78 \"></path>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"98\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"138\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"78\" r=\"2.4\"></circle>" +
							"<circle class=\"arom\" cx=\"98\" cy=\"118\" r=\"9\"></circle>" +
						"</g>" +
				"</svg>"
			);
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 118,
			clientY: 110
		});
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								"path{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
								"circle.atom:hover{" +
									"opacity:0.3;" +
									"stroke:black;" +
									"stroke-width:0.8;" +
								"}" +
								"circle.atom{" +
									"opacity:0;" +
								"}" +
								"circle.arom{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
							"</style>" +
							"<path d=\"M 98 98 L 115.32 108 L 115.32 128 L 98 138 L 80.68 128 L 80.68 108 Z \"></path>" +
							"<path d=\"M 115.32 108 L 132.64 98 \"></path>" +
							"<path d=\"M 98 98 L 98 78 \"></path>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"98\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"138\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"132.64\" cy=\"98\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"78\" r=\"2.4\"></circle>" +
							"<circle class=\"arom\" cx=\"98\" cy=\"118\" r=\"9\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});
	
	it("should be able to draw further, on the recently added structure", function () {
		var custom = DrawChemStructures.benzene(),
			add = DrawChemStructures.singleBond();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);		
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 100,
			clientY: 100
		});
		temp.find("#dc-" + add.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(add.getDefault());
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 101,
			clientY: 99
		});
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								"path{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
								"circle.atom:hover{" +
									"opacity:0.3;" +
									"stroke:black;" +
									"stroke-width:0.8;" +
								"}" +
								"circle.atom{" +
									"opacity:0;" +
								"}" +
								"circle.arom{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
							"</style>" +
							"<path d=\"M 98 98 L 115.32 108 L 115.32 128 L 98 138 L 80.68 128 L 80.68 108 Z \"></path>" +
							"<path d=\"M 98 98 L 98 78 \"></path>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"98\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"138\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"78\" r=\"2.4\"></circle>" +
							"<circle class=\"arom\" cx=\"98\" cy=\"118\" r=\"9\"></circle>" +
						"</g>" +
				"</svg>"
			);
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 100,
			clientY: 79
		});
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								"path{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
								"circle.atom:hover{" +
									"opacity:0.3;" +
									"stroke:black;" +
									"stroke-width:0.8;" +
								"}" +
								"circle.atom{" +
									"opacity:0;" +
								"}" +
								"circle.arom{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
							"</style>" +
							"<path d=\"M 98 98 L 115.32 108 L 115.32 128 L 98 138 L 80.68 128 L 80.68 108 Z \"></path>" +
							"<path d=\"M 98 98 L 98 78 L 115.32 68 \"></path>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"98\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"138\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"78\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"68\" r=\"2.4\"></circle>" +
							"<circle class=\"arom\" cx=\"98\" cy=\"118\" r=\"9\"></circle>" +
						"</g>" +
				"</svg>"
			);
		temp.find(".dc-editor-dialog-content").triggerHandler({
			type : "mouseup",
			clientX: 99,
			clientY: 80
		});
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								"path{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
								"circle.atom:hover{" +
									"opacity:0.3;" +
									"stroke:black;" +
									"stroke-width:0.8;" +
								"}" +
								"circle.atom{" +
									"opacity:0;" +
								"}" +
								"circle.arom{" +
									"stroke:black;" +
									"stroke-width:0.8;" +
									"fill:none;" +
								"}" +
							"</style>" +
							"<path d=\"M 98 98 L 115.32 108 L 115.32 128 L 98 138 L 80.68 128 L 80.68 108 Z \"></path>" +
							"<path d=\"M 98 98 L 98 78 L 115.32 68 \"></path>" +
							"<path d=\"M 98 78 L 80.68 68 \"></path>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"98\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"138\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"98\" cy=\"78\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"68\" r=\"2.4\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"68\" r=\"2.4\"></circle>" +
							"<circle class=\"arom\" cx=\"98\" cy=\"118\" r=\"9\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});
});