var AWPY = {
  config: {
    codec: (function() {
      var audio = new Audio(), result;
      var extensions = ['mp3', 'ogg', 'aac', 'wav'];

      [
        'audio/mpeg; codecs="mp3"',
        'audio/ogg; codecs="vorbis"',
        'audio/mpeg; codecs="mp3"',
        'audio/wav; codecs="1"'
      ].forEach(function(codec, i, list) {
        result = extensions[i];
        if (/probably|maybe/.test(audio.canPlayType(codec))) {
          list.length = i;
        }
      });

      return result;
    }()),
    browserscope: {
      key: 'agt1YS1wcm9maWxlcnINCxIEVGVzdBiH_qUKDA'
    }
  }
};

AWPY.tests = (function() {
  var list = [];

  return {
    init: function(tests) {
      list = tests;
    },
    run: function(testName, callback) {
      var single = !!testName;
      var globalCleanup = function(test) {
        [].concat(test.audio || []).forEach(function(audio){
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
          delete audio;
        });
      };
      var finishTest = function(test, result) {
        test.finished = true;
        globalCleanup(test);
        test.result = result;
        callback.call(null, test);
      };
      var tests = list.filter(function(test) {
        return (single ? test.name === testName : true) && !test.finished;
      });

      (function run(tests, i) {
        var test = tests[i];
        test.audio = new Audio();
        test.audio.addEventListener('loadedmetadata', function() {
          setTimeout(function() {
            if (!test.finished) {
              finishTest(test, false);
              if (tests[i + 1]) {
                run(tests, i + 1);
              }
            }
          }, 15000);
        }, false);

        test.assert(function(result) {
          if (!test.finished) {
            finishTest(test, result);
            if (tests[i + 1]) {
              run(tests, i + 1);
            }
          }
        });
      }(tests, 0));
    },
    get: function(testName) {
      return list.filter(function(item) {
        return testName ? item.name === testName : true;
      });
    },
    save: function() {
      return;
      var data = {}, newScript, firstScript;

      this.finished().forEach(function(test) {
        data[test.name] = test.result ? 1 : 0;
      });

      window._bTestResults = data;

      $.getJSON(
        'http://www.browserscope.org/user/beacon/' + AWPY.config.browserscope.key + '?callback=?'
      );
    },
    finished: function() {
      return list.filter(function(test) {
        return test.finished;
      });
    }
  };
}());

AWPY.sound = (function() {
  var sounds = {
    mini: {
      duration: 2.377
    },
    short: {
      duration: 227.325
    },
    long: {
      duration: 4046.210
    }
  };

  Object.keys(sounds).forEach(function(type) {
    sounds[type].stream_url = function(cache) {
      return 'http://areweplayingyet.herokuapp.com/sounds/' + type + '.' + AWPY.config.codec + (cache ? '' : '?' + (Math.random() * 1e9 | 0));
    };
  });

  return sounds;
}());

// Debugging function
AWPY.logEvents = function(audio){
  var events = 'loadstart progress suspend abort error emptied stalled loadedmetadata ' +
      'loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange ' +
      'timeupdate ratechange volumechange';

  events = events.split(' ');
  events.forEach(function(ev) {
    audio.addEventListener(ev, function() {
      console.log(ev + ':' + Date.now());
    }, false);
  });
};

AWPY.UI = {
  toggleInfo: function() {
    var info = $('.info-description');
    var setCookie = function() {
      if (!(/awpy=bubble_expiration/).test(document.cookie)) {
        var date = new Date();
        date.setTime( date.getTime() + ( 7*24*60*60*1000 ) ); // expires in 7 days
        date.toGMTString();
        document.cookie = 'awpy=bubble_expiration; expires='+ date +'; path=/';
      }
    };
    $('.info-small').live('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      info.toggleClass('hide');
      setCookie();
    });
    $('body').live('click', function(){
      info.addClass('hide');
      setCookie();
    });

    if (!(/awpy=bubble_expiration/).test(document.cookie)) {
      info.removeClass('hide');
    }
  }
}
