elements.tumbaga = {
    color:["#FFD700","#fff200","#f8ed29","#fcdd30","#FFD700"],
    behavior: behaviors.WALL,
    category: "solids",
    state: "solid",
    density: "14000",
    tempHigh: 800,
    stateHigh: elements.molten_tumbaga,
    conduct: "1",
}
elements.molten_tumbaga = {
    color: ["#ff9500","#fe7412","#ffe600","#ff6a00"],
    behavior: behaviors.MOLTEN,
    category: "states",
    state: "liquid",
    density: "12000",
}

if (!elements.molten_gold.reactions) elements.molten_gold.reactions = {};
elements.molten_gold.reactions["molten_sterling"] = { elem1: "molten_tumbaga", elem2: "molten_tumbaga" };
