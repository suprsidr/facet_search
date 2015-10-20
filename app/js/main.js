/**
 * @author wpatterson
 */

var gui = require('nw.gui'),
    spawn = require('child_process').spawn,
    path = require('path'),
    c = require('./config'),
    LOCALAPPDATA = c.LOCALAPPDATA,
    fs = require('fs'),
    _ = require('lodash'),
    async = require('async'),
    savedEntries = [],
    urlSnippet = 'http://stage2.horizonhobby.com/webapp/wcs/stores/servlet/MarketingSearchUrl?catalogId=10051&orderId=.&langId=-1&storeId=10151&seoUrlParam=',
    version = require('./package.json').version,
    spinOpts = {
      lines: 13,
      length: 10,
      width: 10,
      radius: 30,
      corners: 1,
      rotate: 0,
      direction: 1,
      color: '#000',
      speed: 1,
      trail: 60,
      shadow: false,
      hwaccel: false,
      className: 'spinner',
      zIndex: 2e9,
      top: '50%',
      left: '50%'
    },
    spinner = new Spinner(spinOpts),
    ap,
    whichDB = 'stage';
    
// show dev tools
//gui.Window.get().showDevTools();

// append version to body
$('body').append($('<p />', {text: 'v.' + version, class: 'vtext'}));

//log(process.versions['node-webkit'])
$(document).on('awesomplete-selectcomplete', function(e) {
  $('.insert').addClass('hidden');
  $('.update-delete').removeClass('hidden');
});

$('#stageprod').on('change', function(e) {
  if($(this).prop('checked')) {
    $('body').addClass('prod');
  } else {
    $('body').removeClass('prod');
  }
  whichDB = $(this).prop('checked') ? 'prod' : 'stage';
  var val = $('[name="seoUrlParam"]').val();
  if(whichDB === 'prod' && savedEntries.indexOf(val)  === -1) {
    console.log('should click')
    setTimeout(function() {
      $('#stageprod').trigger('click');
    }, 100);
  } else if(val.length > 3 && savedEntries.indexOf(val) > -1) {
    $('.insert').addClass('hidden');
    $('.update-delete').removeClass('hidden');
    findOne(val);
  } else if(val.length > 3) {
    $('.update-delete').addClass('hidden');
    $('.insert').removeClass('hidden');
  } else {
    $('.insert, .update-delete').addClass('hidden');
  }
})

$('.x-cogs').on('click', function(e) {
  e.preventDefault();
  gui.Window.get().showDevTools();
});

$('.x-reset').on('click', function(e) {
  e.preventDefault();
  init();
});

$('.earl').on('click', function(e) {
  e.preventDefault();
  gui.Shell.openExternal($(this).attr('href'));
});

$('[name="seoUrlParam"]').on('blur', function(e) {
  if(this.value.length > 3 && savedEntries.indexOf(this.value) > -1) {
    $('.insert').addClass('hidden');
    $('.update-delete').removeClass('hidden');
    //$('body').addClass('enabled');
    findOne(this.value);
  } else if(this.value.length > 3) {
    $('.update-delete').addClass('hidden');
    $('.insert').removeClass('hidden');
    //$('body').removeClass('enabled');
  } else {
    $('.insert, .update-delete').addClass('hidden');
    //$('body').removeClass('enabled');
  }
  
});

$('[name="seoUrlParam"]').on('keyup', function(e) {
  if(this.value.length > 3 && savedEntries.indexOf(this.value) > -1) {
    $('.insert').addClass('hidden');
    $('.update-delete').removeClass('hidden');
    //$('body').addClass('enabled');
  } else if(this.value.length > 3) {
    $('.update-delete').addClass('hidden');
    $('.insert').removeClass('hidden');
    //$('body').removeClass('enabled');
  } else {
    $('.insert, .update-delete').addClass('hidden');
    //$('body').removeClass('enabled');
  }
  
});

$('.refresher').on('click', function(e) {
  e.preventDefault();
  var el = $(this);
  var func = el.attr('href');
  var img = el.find('img');
  img.addClass('rotating');
  window[func](function(err) {
    if(err) {
      console.log(err);
    }
    img.removeClass('rotating');
  });
});

$('.x-closer').on('click', function(e) {
  e.preventDefault();
  gui.App.quit();
});

$('[name="mfName"]').on('change', function(e) {
  e.preventDefault();
  var el = $(this);
  var a = $('<a />', {href: '#'}).on('click', function(e) {
        e.preventDefault();
        $(this).parent('li').remove();
      })
      .append(
        $('<img />', {src: 'img/bin.svg', class: 'icon icon-squared-cross'})
      )
  $('.current-facets').append($('<li />', {text: encodeURIComponent('mfName_ntk_cs:"' + el.val() + '"')}).prepend(a))
});

$('[href="insert"]').on('click', function(e) {
  e.preventDefault();
  var params = '', facets = '';
  $('input, select').each(function() {
    var val = $(this).val();
    if(val === '') {
      val = $(this).attr('value');
    }
    if(val === '' || val === undefined || this.name.match('^facet') || this.name ==='mfName' || this.name === 'seoUrlParam' || this.id === 'stageprod') {
      return;
    }
    if(this.name === 'searchTerm') {
        params += '&' + this.name + '=' + encodeURIComponent(val).replace(/%20/g, ' ');
    } else {
        params += '&' + this.name + '=' + encodeURIComponent(val);
    }
  });

  // all chosen facets
  $('.current-facets > li').each(function() {
    facets += '&facet=' + $(this).text();
  });
  
  
  var SeoUrlParam = $('[name="seoUrlParam"]').val(),
      queryParams = params.replace('&', '') + facets;
      
  if(SeoUrlParam !== '') {
    insertOne({
      SeoUrlParam: SeoUrlParam,
      queryParams: queryParams
    },
    function(err) {
      if(err) {
        console.log(err);
        fadeDiv('error');
      } else {
        $('.earl').text(urlSnippet + SeoUrlParam).attr('href', urlSnippet + SeoUrlParam);
        fadeDiv('success');
        if(savedEntries.indexOf(SeoUrlParam) < 0) {
          savedEntries.push(SeoUrlParam);
          ap.evaluate($('[name="seoUrlParam"]').get(0), {list: savedEntries});
        }
        setTimeout(function(){
          console.log('blurring');
          $('[name="seoUrlParam"]').trigger('blur');
        }, 1000);
      }
    });
  } else {
    fadeDiv('param-error');
  }
  
});

$('[href="update"]').on('click', function(e) {
  e.preventDefault();
  var params = '', facets = '';
  $('input, select').each(function() {
    var val = $(this).val();
    if(val === '') {
      val = $(this).attr('value');
    }
    if(val === '' || val === undefined || this.name.match('^facet') || this.name ==='mfName' || this.name === 'seoUrlParam' || this.id === 'stageprod') {
      return;
    }
    if(this.name === 'searchTerm') {
        params += '&' + this.name + '=' + encodeURIComponent(val).replace(/%20/g, ' ');
    } else {
        params += '&' + this.name + '=' + encodeURIComponent(val);
    }
  });

  // all chosen facets
  $('.current-facets > li').each(function() {
    facets += '&facet=' + $(this).text();
  });
  
  
  var SeoUrlParam = $('[name="seoUrlParam"]').val(),
      queryParams = params.replace('&', '') + facets;
      
  if(SeoUrlParam !== '') {
    updateOne({
      SeoUrlParam: SeoUrlParam,
      queryParams: queryParams
    },
    function(err) {
      if(err) {
        console.log(err);
        fadeDiv('error');
      } else {
        $('.earl').text(urlSnippet + SeoUrlParam).attr('href', urlSnippet + SeoUrlParam);
        fadeDiv('updated');
        setTimeout(function(){
          console.log('blurring');
          $('[name="seoUrlParam"]').trigger('blur');
        }, 1000);
      }
    });
  } else {
    fadeDiv('param-error');
  }
  
});

$('[href="delete"]').on('click', function(e) {
  e.preventDefault();
  var SeoUrlParam = $('[name="seoUrlParam"]').val();
      
  if(SeoUrlParam !== '') {
    deleteOne({
      SeoUrlParam: SeoUrlParam
    },
    function(err) {
      if(err) {
        console.log(err);
        fadeDiv('error');
      } else {
        $('.earl').text('').attr('href', '');
        fadeDiv('deleted');
        if(whichDB === 'stage') {
          var i = savedEntries.indexOf(SeoUrlParam);
          if (i > -1) {
            savedEntries.splice(i, 1);
          }
          ap.evaluate($('[name="seoUrlParam"]').get(0), {list: savedEntries});
        }
        init();
      }
    });
  } else {
    fadeDiv('param-error');
  }
  
});

var fadeDiv = function(el) {
  $('.insert, .update-delete').addClass('hidden');
  $('.' + el).fadeIn('fast', function() {
    setTimeout(function(){
      $('.' + el).fadeOut('fast');
      if(whichDB === 'prod') {
        $('#stageprod').trigger('click');
      }
      return true;
    }, 500)
  })
}

var init = function() {
  // clear everything
  $('input').val('');
  $('.current-facets').empty();
  $('.insert, .update-delete').addClass('hidden');
  $('.earl').text('').attr('href', '');
  /*
   * Categories
   */
  var cats = require(path.join(LOCALAPPDATA, './SearchCategories')).Cats;
  var $cats = $('select[name="categoryId"]');
  $cats.html($('<option />', {value: '', text: 'Please select'}));
  $.each(cats, function(k, v) {
    $cats.append($('<option />', {value: v.groupID, text: v.id + '(' + v.name + ')'}))
  })
  
  
  /**
   * Facets
   */
  var facets = require(path.join(LOCALAPPDATA, './FacetMap')).Facets;
  var $facets = $('select[name="facets"]');
  $facets.html($('<option />', {value: '', text: 'Please select'}));
  var $facetValues = $('select[name="facet-values"]');
  $facetValues.html($('<option />', {value: '', text: 'Please select'}));
  
  $.each(facets, function(k, v) {
    $facets.append($('<option />', {value: k.toLowerCase(), text: v.Desc}).data('values', v.Values))
  });
  
  $facets.off().on('change', function(e) {
    e.preventDefault();
    $facetValues.html($('<option />', {value: '', text: 'Please select'}));
    var vals = $(this).find('option:selected').data('values');
    $.each(vals, function(i) {
      $facetValues.append($('<option />', {value: vals[i], text: vals[i]}))
    })
  });
  
  $facetValues.off().on('change', function(e) {
    e.preventDefault();
    var a = $('<a />', {href: '#'}).on('click', function(e) {
          e.preventDefault();
          $(this).parent('li').remove();
        })
        .append(
          $('<img />', {src: 'img/bin.svg', class: 'icon icon-squared-cross'})
        )
    $('.current-facets').append($('<li />', {text: encodeURIComponent($facets.val() + '_ntk_cs:"' +  $facetValues.val() + '"')}).prepend(a))
  });
  
  
  /**
   * MfNames
   */
  var mfnames = require(path.join(LOCALAPPDATA, './MfNames')).MfNames;
  var $mfnames = $('select[name="mfName"]');
  $mfnames.html($('<option />', {value: '', text: 'Please select'}));
  $.each(mfnames, function(i) {
    $mfnames.append($('<option />', {value: mfnames[i], text: mfnames[i]}))
  });
  
  getSeoUrlParams();
  console.log('Loaded');
}

/*
 * spawns the external job in getMfNames.js
 */
var getMfNames = function(cb) {
  var sel = $('[name="mfName"]');
  var op = spawn('node', ['getMfNames']);

  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    console.log(data);
  })
  
  op.on('exit', function(code) {
    if(code > 0) {
      cb('Oh no, there seems to be an error: ' , code);
    } else {
      var mfnames = require(path.join(LOCALAPPDATA, './MfNames')).MfNames;
      sel.html($('<option />', {value: '', text: 'Please select'}));
      $.each(mfnames, function(i) {
        sel.append($('<option />', {value: mfnames[i], text: mfnames[i]}))
      });
      cb();
    }
  });
}

/*
 * spawns the external job in getFacets.js
 */
var getFacets = function(cb) {
  var sel = $('[name="facets"]');
  var op = spawn('node', ['getFacets']);

  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    console.log(data);
  });
  
  op.on('exit', function(code) {
    if(code > 0) {
      cb('Oh no, there seems to be an error: ' , code);
    } else {
      var facets = require(path.join(LOCALAPPDATA, './FacetMap')).Facets;
      sel.html($('<option />', {value: '', text: 'Please select'}));
      $('select[name="facet-values"]').html($('<option />', {value: '', text: 'Please select'}));
      $.each(facets, function(k, v) {
        sel.append($('<option />', {value: k.toLowerCase(), text: v.Desc}).data('values', v.Values))
      });
      cb();
    }
  });
}

/*
 * spawns the external job in getCategories.js
 */
var getCategories = function(cb) {
  var sel = $('[name="categoryId"]');
  var op = spawn('node', ['getCategories']);

  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    console.log(data);
  });
  
  op.on('exit', function(code) {
    if(code > 0) {
      cb('Oh no, there seems to be an error: ' , code);
    } else {
      var cats = require(path.join(LOCALAPPDATA, './SearchCategories')).Cats;
      sel.html($('<option />', {value: '', text: 'Please select'}));
      $.each(cats, function(k, v) {
        sel.append($('<option />', {value: v.groupID, text: v.id + '(' + v.name + ')'}))
      });
      cb();
    }
  });
}

/*
 * spawns the external job in getSeoUrlParams.js
 */
var getSeoUrlParams = function(cb) {
  var el = $('[name="seoUrlParam"]');
  var op = spawn('node', ['getSeoUrlParams']);

  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    try {
      savedEntries = JSON.parse(data)[0];
    } catch(e) {
      console.log(data);
    }
  });
  
  op.on('exit', function(code) {
    if(code > 0) {
      console.log('Oh no, there seems to be an error: ' , code);
    } else {
      ap = new Awesomplete(el.get(0), {list: savedEntries});
    }
  });
}

/*
 * spawns the external job in findOne.js
 */
var findOne = function(data) {
  spinner.spin(document.querySelector('body'));
  var found = {};
  var op = spawn('node', ['findOne', data, whichDB]);

  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    try {
      found = JSON.parse(data)[0][0];
    } catch(e) {
      console.log(data);
    }
  });
  
  op.on('exit', function(code) {
    if(code > 0) {
      console.log('Oh no, there seems to be an error: ' , code);
    } else if (whichDB === 'prod'){
      try {
        if(found.SEOURLPARAM) {
          $('.insert').addClass('hidden');
          $('.update-delete').removeClass('hidden');
        }
      } catch(e) {
        $('.update-delete').addClass('hidden');
        $('.insert').removeClass('hidden');
      }
    } else {
      var params = found.QUERYPARAMS.split('&facet=')[0]

      paramObj = JSON.parse('{"' + decodeURI(params).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
      
      $.each(paramObj, function(k, v) {
        var el = $('[name="' + k + '"]');
        el.val(v);
        el.find('[value="' + v + '"]').prop('selected', true).trigger('click');
      })
      
      var facetArr = found.QUERYPARAMS.split('&facet=');
      
      facetArr.shift();
      $('.current-facets').empty();
      $.each(facetArr, function(i) {
        var a = $('<a />', {href: '#'}).on('click', function(e) {
              e.preventDefault();
              $(this).parent('li').remove();
            })
            .append(
              $('<img />', {src: 'img/bin.svg', class: 'icon icon-squared-cross'})
            )
        $('.current-facets').append($('<li />', {text: facetArr[i]}).prepend(a))
      });
      
      $('.earl').text(urlSnippet + found.SEOURLPARAM).attr('href', urlSnippet + found.SEOURLPARAM);
    }
    spinner.spin(false);
  });
}

/*
 * spawns the external job in insertOne.js
 */
var insertOne = function(data, cb) {
  spinner.spin(document.querySelector('body'));
  var op = spawn('node', ['insertOne', data.SeoUrlParam, data.queryParams, whichDB]);
  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    console.log(data);
  });
  op.on('exit', function(code) {
    if(code > 0) {
      cb('Oh no, there seems to be an error: ' , code);
    } else {
      cb();
    }
    spinner.spin(false);
  });
}

/*
 * spawns the external job in updateOne.js
 */
var updateOne = function(data, cb) {
  spinner.spin(document.querySelector('body'));
  var op = spawn('node', ['updateOne', data.queryParams, data.SeoUrlParam, whichDB]);
  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    console.log(data);
  });
  op.on('exit', function(code) {
    if(code > 0) {
      cb('Oh no, there seems to be an error: ' , code);
    } else {
      cb();
    }
    spinner.spin(false);
  });
}

/*
 * spawns the external job in deleteOne.js
 */
var deleteOne = function(data, cb) {
  spinner.spin(document.querySelector('body'));
  var op = spawn('node', ['deleteOne', data.SeoUrlParam, whichDB]);
  op.stdout.setEncoding('utf8');
  
  op.stdout.on('data', function(data) {
    console.log(data);
  });
  op.on('exit', function(code) {
    if(code > 0) {
      cb('Oh no, there seems to be an error: ' , code);
    } else {
      cb();
    }
    spinner.spin(false);
  });
}


// Kick off the show
try {
  var stats = fs.lstatSync(LOCALAPPDATA);
  init();
}
catch (e) {
  //console.log(e);
  spinner.spin(document.querySelector('body'));
  // only necessary for dev fs.mkdirSync(LOCALAPPDATA);
  async.series([
    getMfNames,
    getFacets,
    getCategories
  ], function(err, res){
    if(err) {
      console.log(err);
      process.exit(1);
    }
    getSeoUrlParams();
    console.log('Loaded');
    spinner.spin(false);
  });
}
