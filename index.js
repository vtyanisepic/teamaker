let player = {
    money: 0,
    popularity: 50,
    stage: 0,
    ingredients: {
        teaLeaves: {amount: 5, price: 5, purchaseAmount: 10},
        emptyCups: {amount: 1, price: 1, purchaseAmount: 2},
        sweeteners: {amount: 0, price: 0, purchaseAmount: 0},
    },
    brewedTea: {
        blandTea: {amount: 0, price: 10, demand: 0, creation: {teaLeaves: 5, emptyCups: 1}},
    }
}

function buyIngredient(ingredient) {
    if (player.money >= player.ingredients[ingredient].price) {
        player.money -= player.ingredients[ingredient].price;
        player.ingredients[ingredient].amount += player.ingredients[ingredient].purchaseAmount;
        console.log(`Bought ${player.ingredients[ingredient].purchaseAmount} ${ingredient}.`);
    } else {
        console.log("Not enough money")
    }
}

function haveEnough(required, available) {
    for (let item in required) {
        if (required[item] > available[item].amount) {
            return false;
        }
    }
    return true;
}

function renderUI() {
    document.querySelector("p span").innerText = player.money;
    // document.getElementById("brewTea").style.display = "";

    //warehouse
    for (let ingredient in player.ingredients) {
        if (document.getElementById(`${ingredient}Row`).checkVisibility()) {
            document.getElementById(`${ingredient}Stock`).innerText = player.ingredients[ingredient].amount;
            document.getElementById(`${ingredient}Buy`).innerText = `+${player.ingredients[ingredient].purchaseAmount} ($${player.ingredients[ingredient].price})`;
        }
    }

    //market
    document.getElementById("marketSection").style.display = player.stage >= 1 ? "" : "none";
    for (let tea in player.brewedTea) {
        if (document.getElementById(`${tea}Row`).checkVisibility()) {
            document.getElementById(`${tea}Stock`).innerText = player.brewedTea[tea].amount;
            document.getElementById(`${tea}Price`).innerText = player.brewedTea[tea].price;
            document.getElementById(`${tea}Demand`).innerText = player.brewedTea[tea].demand;
        }
    }

    //visibility
    // document.getElementById("warehouseSection").style.display = "";
    document.getElementById("sweetenersRow").style.display = player.ingredients.sweeteners > 0 ? "" : "none";
}

function calculateDemand(popularity) {
    const thresholds = [ // popularity, demand per second
        [50, 0.1],
        [100, 0.15],
        [200, 0.2],
        [600, 0.3],
        [1500, 0.4],
    ]
    let thresholdToDemand = thresholds.map()
    let demand = 0;
    if (popularity === 0) return; //if it's somehow zero then do nothing
    
}

function updateGame(deltaTime) {
    renderUI();
}

window.onload = () => {
    const brewTea = document.getElementById("brewTea");
    brewTea.addEventListener("click", () => {
        if (player.stage === 0) {
            player.stage++;
            console.log(`player.stage = ${player.stage}`);
        }
        const required = player.brewedTea.blandTea.creation;
        if (haveEnough(required, player.ingredients)) {
            for (let item in required) {
                player.ingredients[item].amount -= required[item];
            }
            player.brewedTea.blandTea.amount += 1;
            console.log("Brewed a cup of bland tea!");
        } else {
            console.log("Not enough ingredients to brew tea.");
        }
    })
    let lastTime = performance.now();
    setInterval(function gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        updateGame(deltaTime);
    });
}