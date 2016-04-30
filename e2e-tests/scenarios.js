'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('weather app', function() {


  it('should automatically redirect to /forecast when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/forecast");
  });


  describe('forecast', function() {

    beforeEach(function() {
      browser.get('index.html#/forecast');
    });


    it('should render view1 when user navigates to /forecast', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for forecast/);
    });

  });

});
