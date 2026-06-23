const Konva = require('konva/lib/Core');
require('konva/lib/shapes/Rect');
require('konva/lib/shapes/Transformer');

const stage = new Konva.Stage({ width: 1000, height: 1000 });
const layer = new Konva.Layer();
stage.add(layer);

const group = new Konva.Group({ id: 'group-1', x: 100, y: 100 });
layer.add(group);

const tableGroup = new Konva.Group({ id: 'table-1', x: 500, y: 500 });
group.add(tableGroup);

const rect = new Konva.Rect({ width: 60, height: 60, fill: 'green' });
tableGroup.add(rect);

const tr = new Konva.Transformer();
layer.add(tr);
tr.nodes([group]);

layer.draw();

// simulate resize from top-left
group.x(-400);
group.scaleX(2);
group.scaleY(2);

console.log("Visual Rect before reset:", rect.getClientRect());

// onTransformEnd logic
const scaleX = group.scaleX();
const scaleY = group.scaleY();
group.scaleX(1);
group.scaleY(1);

tableGroup.x(tableGroup.x() * scaleX);
tableGroup.y(tableGroup.y() * scaleY);
rect.width(rect.width() * scaleX);
rect.height(rect.height() * scaleY);

console.log("Visual Rect after reset:", rect.getClientRect());
