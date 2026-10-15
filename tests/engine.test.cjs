'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),E=require('../web/engine.js');
const copy=()=>structuredClone(E.initial);

test('Alice cannot retrieve Finance or South tenant documents',()=>{const r=E.run(copy());assert.deepEqual(r.rows.map(d=>d.citation).sort(),['handbook','sales-plan']);assert.ok(!JSON.stringify(r.report.citations).includes('123 units'));});
test('Bob can retrieve Finance but not Sales-only content',()=>{const x=copy();x.principal='bob';const ids=E.run(x).rows.map(d=>d.citation);assert.ok(ids.includes('finance-budget'));assert.ok(!ids.includes('sales-plan'));});
test('Tenant isolation holds for the same group name',()=>{const x=copy();x.principal='carol';assert.deepEqual(E.run(x).rows.map(d=>d.citation),['south-budget']);});
test('Revocation invalidates an earlier populated query cache',()=>{const x=copy();x.revokeDocument='sales-plan';const r=E.run(x);assert.ok(r.report.before.includes('sales-plan'));assert.ok(!r.rows.some(d=>d.citation==='sales-plan'));});
test('ACL changes cannot reuse a prior cache result',()=>{const x=copy(),cache=new Map(),user=E.users.alice;assert.ok(E.retrieve(user,x.documents,x.query,'',cache).some(d=>d.id==='sales-plan'));x.documents.find(d=>d.id==='sales-plan').groups=['finance'];assert.ok(!E.retrieve(user,x.documents,x.query,'',cache).some(d=>d.id==='sales-plan'));});
test('Unknown principals and duplicate document IDs fail',()=>{const x=copy();x.principal='intruder';assert.throws(()=>E.run(x));const y=copy();y.documents.push({...y.documents[0]});assert.throws(()=>E.run(y),/unique/);});
