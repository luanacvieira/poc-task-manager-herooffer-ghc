#!/usr/bin/env node
/*
  Ensure Ajv v6 + ajv-keywords v3 are installed; if higher versions detected in tree, exit non-zero.
*/
const fs = require('fs');
const path = require('path');
function scan(root){
  if(!fs.existsSync(root)) return [];
  const results=[];
  function walk(dir){
    let ents; try{ ents=fs.readdirSync(dir,{withFileTypes:true}); }catch{return;}
    for(const e of ents){
      if(e.name==='node_modules' && dir!==root) continue;
      const full=path.join(dir,e.name);
      if(e.isDirectory()){
        if(e.name==='ajv' || e.name==='ajv-keywords'){
          try{ const pkg=require(path.join(full,'package.json')); results.push({dir:full,name:e.name,version:pkg.version}); }catch{}
        }
        walk(full);
      }
    }
  }
  walk(root);
  return results;
}
const found=scan(process.cwd());
let bad=false;
for(const f of found){
  if(f.name==='ajv' && parseInt(f.version.split('.')[0])>6){
    console.error('[ensure-ajv6] Incompatible Ajv version', f.version,'at',f.dir);
    bad=true;
  }
  if(f.name==='ajv-keywords' && parseInt(f.version.split('.')[0])>3){
    console.error('[ensure-ajv6] Incompatible ajv-keywords version', f.version,'at',f.dir);
    bad=true;
  }
}
if(bad){
  console.error('[ensure-ajv6] Failing to enforce deterministic Ajv toolchain.');
  process.exit(2);
} else {
  console.log('[ensure-ajv6] OK: only Ajv<=6 and ajv-keywords<=3 present');
}
