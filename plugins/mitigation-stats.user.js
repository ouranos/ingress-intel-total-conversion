// ==UserScript==
// @id             iitc-plugin-mitigation-stats@ouranos
// @name           IITC plugin: Mitigation stats
// @version        0.0.1.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Determine damage reduction for the selected portal
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.mitigationStats = function() {
};
    
window.plugin.mitigationStats.setup = function() {
  console.log('mitigationStats plugin starting');
    
  // add a new div to the bottom of the sidebar and style it
  $('#sidebar').append('<div id="mitigation_stats_display"></div>');
  $('#mitigation_stats_display').css({'color':'#ffce00', 'font-size':'90%', 'padding':'4px 2px'});
    
  // Setup callbacks
  window.addHook('portalDetailsUpdated', window.plugin.mitigationStats.portalDetail);
}

window.plugin.mitigationStats.getShieldsEffect = function(portal) {
  // shield effect: each shield's mitigation value is assumed to be the percentage of the damage it will absorb
  // the rest of the damage gets through to the next shield, and so on.
  // so, to calculate the total protection, we multiply the fractions of damage allowed through each shield
  // to get a final figure of how much damage gets through
  // e.g.
  // one shield: mitigation 10 - lets 90% of the damage through
  // two shields: mitigation 20 and 30 - first one lets 80% through, second 70% of the remaining
  //              so final amount let through = 0.8 * 0.7 = 0.56 = 56% damage let through
  // four shields: mitigation 30 - 70% through each = 0.7 * 0.7 * 0.7 * 0.7 = 0.24 = 24% damage gets through all four

  var shieldsEffect = 1;
  $.each(portal.portalV2.linkedModArray, function(ind, mod) {
    if(!mod)
      return true;
    if(!mod.stats.MITIGATION)
      return true;
    shieldsEffect *= (1 - parseInt(mod.stats.MITIGATION)/100.0);
  });
  return shieldsEffect;
}

window.plugin.mitigationStats.getShieldsEffect = function(portal) {
  // shield effect: each shield's mitigation value is assumed to be the percentage of the damage it will absorb
  // the rest of the damage gets through to the next shield, and so on.
  // so, to calculate the total protection, we multiply the fractions of damage allowed through each shield
  // to get a final figure of how much damage gets through
  // e.g.
  // one shield: mitigation 10 - lets 90% of the damage through
  // two shields: mitigation 20 and 30 - first one lets 80% through, second 70% of the remaining
  //              so final amount let through = 0.8 * 0.7 = 0.56 = 56% damage let through
  // four shields: mitigation 30 - 70% through each = 0.7 * 0.7 * 0.7 * 0.7 = 0.24 = 24% damage gets through all four

  var shieldsEffect = 1;
  $.each(portal.portalV2.linkedModArray, function(ind, mod) {
    if(!mod)
      return true;
    if(!mod.stats.MITIGATION)
      return true;
    shieldsEffect *= (1 - parseInt(mod.stats.MITIGATION)/100.0);
  });
  return shieldsEffect;
}

window.plugin.mitigationStats.getLinksEffect = function(portal) {
  // find the link mitigation
  var links = 0;
  if(portal.portalV2.linkedEdges) $.each(portal.portalV2.linkedEdges, function(ind, link) {
    links++;
  });
  var linksEffect = 4/9 * Math.atan(links / Math.E);
  return linksEffect
}

window.plugin.mitigationStats.portalDetail = function(data) {
  var d = data.portalDetails;
  var shields_effect = plugin.mitigationStats.getShieldsEffect(d)
  var links_effect = plugin.mitigationStats.getLinksEffect(d)
  var effective_damage = (shields_effect) * (1-links_effect)
      
  $('#mitigation_stats_display').html('Mitigation:<table>'
    + '<tr><td>Shields mitigation: </td><td style="text-align:right">' + Math.round((1-shields_effect)*100) + '%</td></tr>'
    + '<tr><td>Links mitigation: </td><td style="text-align:right">' + Math.round(links_effect*100) + '%</td></tr>'
    + '<tr><td>Effective damage: </td><td style="text-align:right">' + Math.round(effective_damage*100) + '%</td></tr>'
    + '</table>');
}



var setup = function() {
  window.plugin.mitigationStats.setup();
}


// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);