/* ============================================================
   worldmap.js — Accurate interactive world map (D3 + TopoJSON)
   Renders a real geographic world map with India highlighted,
   animated cargo-ship routes from an Indian origin port to
   global regions, and clickable region markers.
   ============================================================ */
(function () {
  var WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
  var worldCache = null;

  function loadWorld() {
    if (worldCache) return worldCache;
    worldCache = fetch(WORLD_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('world map fetch failed');
        return r.json();
      })
      .then(function (topo) {
        return topojson.feature(topo, topo.objects.countries).features;
      });
    return worldCache;
  }

  function renderWorldMap(cfg) {
    var target = typeof cfg.target === 'string' ? document.querySelector(cfg.target) : cfg.target;
    if (!target) return;
    var W = cfg.width || 1000;
    var H = cfg.height || 520;
    target.innerHTML = '';

    var svg = d3.select(target).append('svg')
      .attr('class', 'worldmap-svg ' + (cfg.svgClass || ''))
      .attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    var defs = svg.append('defs');
    var og = defs.append('radialGradient').attr('id', 'oceanGradWM')
      .attr('cx', '0.5').attr('cy', '0.5').attr('r', '0.75');
    og.append('stop').attr('offset', '0').attr('stop-color', '#0d2036');
    og.append('stop').attr('offset', '1').attr('stop-color', '#081524');

    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H)
      .attr('fill', 'url(#oceanGradWM)').attr('rx', 18);

    // Ship symbol
    var ship = defs.append('g').attr('id', 'wmShip');
    ship.append('ellipse').attr('class', 'wm-ship-shadow').attr('cx', 0).attr('cy', 6).attr('rx', 11).attr('ry', 3);
    ship.append('path').attr('d', 'M-9,2 L7,2 L13,-2 L-9,-2 Z').attr('fill', '#0e2a49').attr('stroke', '#123a63').attr('stroke-width', 0.6);
    ship.append('rect').attr('x', -5).attr('y', -9).attr('width', 9).attr('height', 7).attr('rx', 1).attr('fill', '#0a1d33').attr('stroke', '#184c80').attr('stroke-width', 0.5);
    ship.append('rect').attr('x', 1).attr('y', -14).attr('width', 2.5).attr('height', 5).attr('fill', '#123a63');
    ship.append('circle').attr('cx', 0).attr('cy', -17).attr('r', 2).attr('fill', 'rgba(198,154,63,0.6)');

    var projection = d3.geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' });
    var path = d3.geoPath(projection);

    svg.append('path').datum(d3.geoGraticule10()).attr('class', 'wm-graticule').attr('d', path);

    loadWorld().then(function (countries) {
      svg.append('g').attr('class', 'wm-countries')
        .selectAll('path').data(countries).enter().append('path')
        .attr('class', function (d) {
          return 'wm-country' + (d.properties && d.properties.name === 'India' ? ' wm-india-country' : '');
        })
        .attr('d', path);

      var p0 = projection(cfg.origin);
      var decorative = cfg.decorative === true;

      if (!decorative) {
        var og2 = svg.append('g').attr('class', 'wm-origin');
        og2.append('circle').attr('cx', p0[0]).attr('cy', p0[1]).attr('r', 7).attr('class', 'wm-marker-ring');
        og2.append('circle').attr('cx', p0[0]).attr('cy', p0[1]).attr('r', 5).attr('class', 'wm-marker');
        og2.append('circle').attr('cx', p0[0]).attr('cy', p0[1]).attr('r', 2).attr('class', 'wm-marker-core');
        og2.append('text').attr('x', p0[0]).attr('y', p0[1] + 30).attr('text-anchor', 'middle')
          .attr('class', 'wm-label-india').text(cfg.originLabel || 'INDIA');
      }

      var routes = cfg.routes || [];
      routes.forEach(function (rt, i) {
        var p1 = projection([rt.lon, rt.lat]);
        var dx = p1[0] - p0[0], dy = p1[1] - p0[1];
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var off = Math.min(140, dist * 0.28);
        var nx = -dy / dist, ny = dx / dist;
        var cx = (p0[0] + p1[0]) / 2 + nx * off;
        var cy = (p0[1] + p1[1]) / 2 + ny * off;
        var d = 'M' + p0[0] + ',' + p0[1] + ' Q' + cx + ',' + cy + ' ' + p1[0] + ',' + p1[1];

        svg.append('path').attr('id', 'wmroute-' + rt.key).attr('class', 'wm-route').attr('d', d);

        var mg = svg.append('g').attr('class', 'wm-clickable').attr('data-region', rt.key)
          .style('cursor', rt.clickable === false ? 'default' : 'pointer')
          .on('click', function () { if (rt.clickable !== false && cfg.onSelect) cfg.onSelect(rt.key); });
        mg.append('circle').attr('cx', p1[0]).attr('cy', p1[1]).attr('r', 9).attr('class', 'wm-marker-ring');
        mg.append('circle').attr('cx', p1[0]).attr('cy', p1[1]).attr('r', 5).attr('class', 'wm-marker');
        if (!decorative) {
          mg.append('text').attr('x', p1[0]).attr('y', p1[1] - 14).attr('text-anchor', 'middle')
            .attr('class', 'wm-label').text(rt.label);
        }

        if (!decorative) {
          var sh = svg.append('g').attr('class', 'wm-ship');
          sh.append('use').attr('xlink:href', '#wmShip').attr('href', '#wmShip');
          var am = sh.append('animateMotion')
            .attr('dur', (6 + i) + 's').attr('repeatCount', 'indefinite')
            .attr('rotate', 'auto').attr('begin', (i * 0.7) + 's');
          am.append('mpath').attr('xlink:href', '#wmroute-' + rt.key).attr('href', '#wmroute-' + rt.key);
        }
      });
    }).catch(function (err) {
      console.error(err);
      target.innerHTML = '<p style="text-align:center;padding:2rem;color:#cbd8ea;">Interactive world map requires an internet connection to load map data.</p>';
    });
  }

  window.renderWorldMap = renderWorldMap;
})();
