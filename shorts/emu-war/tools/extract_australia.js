// Run from assets/: reads countries-50m.json + topojson-client.min.js, writes australia.json
const fs=require('fs');const vm=require('vm');
const src=fs.readFileSync('topojson-client.min.js','utf8');const ctx={};vm.createContext(ctx);vm.runInContext(src,ctx);
const topo=JSON.parse(fs.readFileSync('countries-50m.json'));
const fc=ctx.topojson.feature(topo,topo.objects.countries);
const au=fc.features.find(f=>f.properties.name==='Australia');
// keep polygons with >= 30 points (mainland + Tasmania)
let polys=au.geometry.coordinates.map(p=>p[0]).filter(r=>r.length>=30);
polys=polys.map(r=>r.map(([x,y])=>[+x.toFixed(3),+y.toFixed(3)]));
console.log(polys.map(p=>p.length));
fs.writeFileSync('australia.json',JSON.stringify(polys));
