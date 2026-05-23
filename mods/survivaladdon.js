// survival_life_expansion + crafting system
// CELL evolution + iron chemistry upgrades

runAfterLoad(function() {

    // =========================
    // SAFE NEIGHBOR HELPER
    // =========================
    function forEachNeighbor(pixel, callback) {

        const dirs = [
            [1,0],[-1,0],[0,1],[0,-1],
            [1,1],[-1,-1],[1,-1],[-1,1]
        ];

        for (let i = 0; i < dirs.length; i++) {

            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];

            if (!outOfBounds(x, y) && pixelMap[x][y]) {
                callback(pixelMap[x][y]);
            }
        }
    }

    // =========================
    // CELL EVOLUTION PATCH
    // =========================
    if (elements.cell && !elements.cell._lifeExpansionPatched) {

        elements.cell._lifeExpansionPatched = true;

        const oldCellTick = elements.cell.tick;

        elements.cell.tick = function(pixel) {

            if (oldCellTick) oldCellTick(pixel);

            forEachNeighbor(pixel, function(nPixel) {

                if (!nPixel) return;

                // CELL + WATER -> FISH or FROG
                if (nPixel.element === "water") {

                    if (Math.random() < 0.0008) {

                        if (Math.random() < 0.5) {

                            if (elements.fish) {
                                changePixel(pixel, "fish");
                            }

                        } else {

                            if (elements.frog) {
                                changePixel(pixel, "frog");
                            }
                        }
                    }
                }

                // CELL + DIRT -> ANT
                if (nPixel.element === "dirt") {
                    if (Math.random() < 0.0007 && elements.ant) {
                        changePixel(pixel, "ant");
                    }
                }

                // CELL + SLIME -> SLUG
                if (nPixel.element === "slime") {
                    if (Math.random() < 0.001 && elements.slug) {
                        changePixel(pixel, "slug");
                    }
                }

                // CELL + SMOKE -> FLY
                if (nPixel.element === "smoke") {
                    if (Math.random() < 0.001 && elements.fly) {
                        changePixel(pixel, "fly");
                    }
                }

                // CELL + MUD -> STINKBUG
                if (nPixel.element === "mud") {
                    if (Math.random() < 0.0008 && elements.stink_bug) {
                        changePixel(pixel, "stink_bug");
                    }
                }

                // CELL + WORM -> SPIDER
                if (nPixel.element === "worm") {

                    if (Math.random() < 0.0005 && elements.spider) {

                        if (!outOfBounds(pixel.x, pixel.y - 1) &&
                            isEmpty(pixel.x, pixel.y - 1)) {

                            createPixel("spider", pixel.x, pixel.y - 1);
                        }
                    }
                }
            });
        };
    }

    // =========================
    // IRON CHEMISTRY SYSTEM
    // =========================
    if (elements.iron && !elements.iron._chemPatched) {

        elements.iron._chemPatched = true;

        const oldIronTick = elements.iron.tick;

        elements.iron.tick = function(pixel) {

            if (oldIronTick) oldIronTick(pixel);

            forEachNeighbor(pixel, function(nPixel) {

                if (!nPixel) return;

                // IRON + ZINC -> PIPE
                if (nPixel.element === "zinc") {

                    if (elements.pipe) {
                        changePixel(pixel, "pipe");
                    }
                }

                // IRON + GUNPOWDER -> RANDOM EXPLOSIVE
                if (nPixel.element === "gunpowder") {

                    if (Math.random() < 0.002) {

                        const explosives = [
                            "tnt",
                            "bomb",
                            "dynamite",
                            "grenade",
                            "nuke"
                        ];

                        let pick = explosives[Math.floor(Math.random() * explosives.length)];

                        if (elements[pick]) {
                            changePixel(pixel, pick);
                        }
                    }
                }
            });
        };
    }

    // =========================
    // DEAD PLANT CHEMISTRY
    // =========================
    if (elements.dead_plant && !elements.dead_plant._chemPatched) {

        elements.dead_plant._chemPatched = true;

        const oldDeadPlantTick = elements.dead_plant.tick;

        elements.dead_plant.tick = function(pixel) {

            if (oldDeadPlantTick) oldDeadPlantTick(pixel);

            forEachNeighbor(pixel, function(nPixel) {

                if (!nPixel) return;

                // DEAD PLANT + SMOKE -> GUNPOWDER
                if (nPixel.element === "rock") {

                    if (Math.random() < 0.007 && elements.gunpowder) {
                        changePixel(pixel, "gunpowder");
                    }
                }
            });
        };
    }

});