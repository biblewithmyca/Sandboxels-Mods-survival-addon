//v1.0.0
let dangers = ["plasma","magma","fire","cyanide_gas","cyanide","chlorine","acid","caustic_potash","lye","poison_gas","poison","infection","cold_fire",
	"radiation","fallout","dioxin","electric",(element)=>{return (elements[element].category == "weapons");},
	(element)=>{return (element.includes("molten"));}
];

function checkDangers(element){
	res = 0;
	for(let item of dangers){
		if(typeof item == 'function') {
			res = (item(element)) ? 1 : 0;
		} else {
			res = (element == item) ? 1 : 0;
		}
		if(res == 1){
			return res*(Math.min(1, (dangers.length-dangers.indexOf(item)+8)/dangers.length));
		}
	}
	return 0;
}

let checkFor = [];
for(let elem in elements){
	if(checkDangers(elem) != 0){
		checkFor.push(elem);
	}
}

function findClosest(p1, elem){
	let distances = [], px = [];
	for(let p2 of currentPixels){
		if(p2.element == elem){
			distances.push(Math.hypot(Math.abs(p1.x-p2.x), Math.abs(p1.y-p2.y)));
			px.push(p2);
		}
	}let p = px[distances.indexOf(Math.min(...distances))];
	return (p != undefined) ? {pixel: p, dir: [Math.sign(p.x-p1.x), Math.sign(p.y-p1.y)]} : null;
}

function moveHuman(body){
	let x = body.x, y = body.y, head = getPixel(x,y-1), dir = body.dir;
	head = (head != undefined && head.element == "head") ? head : undefined;
	if(head == undefined && body.deathCD == undefined) body.deathCD = 20;
	if(head != undefined) head["_r"] = undefined;
	body['_r'] = undefined;
	if(tryMove(body, x, y+1) && head != undefined){
		tryMove(head, x, y);
	}
	let chance = 0;
	for(let p of currentPixels){
		if((p.x > x && dir[0] == 1) && checkFor.includes(p.element)){
			let distance = Math.hypot(Math.abs(p.x-x), Math.abs(p.y-y));
			chance = Math.max(0,(20-distance)/20)*checkDangers(p.element);
			if(Math.random() > chance){
				dir[0] = -1;
				break;
			}
		} else if((p.x < x && dir[0] == -1) && checkFor.includes(p.element)){
			let distance = Math.hypot(Math.abs(p.x-x), Math.abs(p.y-y));
			chance = Math.max(0,(20-distance)/20)*checkDangers(p.element);
			if(Math.random() > chance){
				dir[0] = 1;
				break;
			}
		}
	}
	
	let nextPx = getPixel(body.x+body.dir[0], body.y);
	let num = 1;
	while(nextPx == null && !outOfBounds(body.x+body.dir[0], body.y+num)){
		nextPx = getPixel(body.x+body.dir[0], body.y+num);
		num++;
	}
	if(nextPx != null && nextPx.element == "water"){
		let pxBelow = getPixel(nextPx.x, nextPx.y+1);
		if(pxBelow != null && pxBelow.element == "water"){
			body.dir[0] *= -1;
		}
	}
	
	body.dir = dir;
	if(Math.random() < (0.15+body.panic/15)){
		if((isEmpty(x+dir[0], y-1) && !outOfBounds(x+dir[0], y-1)) && tryMove(body, x+dir[0], y)){
			if((head != undefined) && !tryMove(head, x+dir[0], y-1) && body.deathCD == undefined){
				body.deathCD = 20;
			}
		} else if((isEmpty(x+dir[0], y-2) && !outOfBounds(x+dir[0], y-2)) && tryMove(body, x+dir[0], y-1)){
			if((head != undefined) && !tryMove(head, x+dir[0], y-2) && body.deathCD == undefined){
				body.deathCD = 20;
			}
		}
		if(Math.random() < (0.2)*(1-chance)){
			dir[0] *= -1;
		}
	}
	
}

elements.body = {
	color: ["#069469","#047e99","#7f5fb0"],
	category: "life",
	hidden: true,
	density: 1500,
	state: "solid",
	conduct: .05,
	temp: 37,
	tempHigh: 150,
	stateHigh: "cooked_meat",
	tempLow: -30,
	stateLow: "frozen_meat",
	burn: 10,
	burnTime: 250,
	burnInto: "cooked_meat",
	breakInto: ["blood","meat","bone"],
	forceSaveColor: true,
	pickElement: "human",
	tick: function(p){
		if(p.start == pixelTicks+3){
			p.aggr = (Math.random() < 0.15);
		}
		if(p.deathCD != undefined && p.deathCD > 0 && Math.random() < 0.25){
			p.deathCD -= 1;
		} 
		if(p.deathCD == 0){
			p.dead = true;
		}
		if(p.deathCD != undefined){
			if(getPixel(p.x, p.y-1)?.element == "head"){
				p.deathCD == undefined;
			}
		}
		
		
		if(p.dead && Math.random() < 0.015){
			changePixel(p, "rotten_meat");
		}
		moveHuman(p);
		if(p.health < 0) p.dead = true;
		if(p.health > 0 && p.health < 100){
			p.health += (Math.random() < 0.25) ? 5 : 0;
			p.panic = Math.min(20, p.panic + 0.7*((100-p.health)/100));
		}
		if (p.temp > 37) { p.temp -= 1; }
		else if (p.temp < 37) { p.temp += 1; }
		if(p.charge == 1) p.health -= 5;
		
		for(let coords of adjacentCoords){
			let x = p.x+coords[0];
			let y = p.y+coords[1];
			let px = getPixel(x,y);
			if(px != null){
				if(elements[px.element].isFood && !px.element.includes("rotten")) {
					deletePixel(x,y);
					if(p.health < 100) p.health = Math.min(p.health + 10, 100);
				} else if(elements[px.element].isFood && px.element.includes("rotten")){
					deletePixel(x,y);
					if(p.health > 0) p.health = Math.max(p.health - 10, 0);
				}
				if(px.element == "body" && p.aggr && Math.random() < 0.5){
					px.health -= 5;
				}
			}
		}
		
		if(p.panic > 0){
			p.panic = (Math.max(0, p.panic - 0.2));
		}
		
		if(p.burning && Math.random()< 0.25){
			p.health -= 5;
			p.panic = Math.min(20, p.panic + 0.5);
		}
		
	},
	properties: {
		dir: [1, 0],
		dead: false,
		panic: 0,
		health: 100,
		aggr: false,
	},
	reactions: {
		radiation: {func: (p1, p2)=>{p1.health -= 5}, chance:0.4},
		cyanide: {func: (p1, p2)=>{p1.health -= 20}, chance:0.5},
		cyanide_gas: {func: (p1, p2)=>{p1.health -= 20}, chance:0.9},
		poison: {func: (p1, p2)=>{p1.health -= 10}, chance:0.4},
		poison_gas: {func: (p1, p2)=>{p1.health -= 10}, chance:0.8},
		chlorine: {func: (p1, p2)=>{p1.health -= 15}, chance:0.4},
		infection: {func: (p1, p2)=>{p1.health -= 5}, chance:0.5},
		dioxin: {func: (p1, p2)=>{p1.health -= 10}, chance:0.6},
		caustic_potash: {func: (p1, p2)=>{p1.health -= 7}, chance:0.7},
		lye: {func: (p1, p2)=>{p1.health -= 5}, chance:0.7},
		plague: {func: (p1,  p2)=>{p1.health -= 10}, chance:0.7},
		"sun": { elem1:"cooked_meat" },
		"alcohol": { chance:0.2, attr1:{"panic":0} },
		"anesthesia": { attr1:{"panic":0} },
		"alcohol_gas": { chance:0.2, attr1:{"panic":0} },
	}
	
};
elements.poison.reactions.body = undefined;
elements.cyanide.reactions.body = undefined;
elements.cyanide_gas.reactions.body = undefined;
elements.chlorine.reactions.head = undefined;
elements.poison.reactions.head = undefined;
elements.cyanide.reactions.head = undefined;
elements.cyanide_gas.reactions.head = undefined;
