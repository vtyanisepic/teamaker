let player = {
    money: 0,
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

function actionButtons() {
    const brewTea = document.getElementById("brewTea");
    brewTea.addEventListener("click", () => {
        if (player.stage == 0) {
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
}

function buyIngredient(ingredient) {
    if (player.money >= player.ingredients[ingredient].price) {
        player.money -= player.ingredients[ingredient].price;
        player.ingredients[ingredient].amount += player.ingredients[ingredient].purchaseAmount;
        console.log(`Bought ${player.ingredients[ingredient].purchaseAmount} ${ingredient}.`);
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
    document.getElementById("brewTea").style.display = "";

    // Warehouse
    for (let ingredient in player.ingredients) {
        let element = document.getElementById(`${ingredient}Stock`);
        if (element && element.checkVisibility()) element.innerText = player.ingredients[ingredient].amount;
        element = document.getElementById(`${ingredient}Buy`);
        if (element && element.checkVisibility()) element.innerText = `+${player.ingredients[ingredient].purchaseAmount} ($${player.ingredients[ingredient].price})`;
    }

    // Update market
    for (let tea in player.brewedTea) {
        const teaObj = player.brewedTea[tea];
        const stockEl = document.getElementById(`${tea}Stock`);
        const priceEl = document.getElementById(`${tea}Price`);
        const demandEl = document.getElementById(`${tea}Demand`);
        if (stockEl) stockEl.innerText = teaObj.amount;
        if (priceEl) priceEl.innerText = teaObj.price;
        if (demandEl) demandEl.innerText = teaObj.demand;
    }

    // Stage-based visibility
    document.getElementById("warehouseSection").style.display = "";
    document.getElementById("marketSection").style.display = player.stage >= 1 ? "" : "none";
    document.getElementById("sweetenersRow").style.display = player.ingredients.sweeteners > 0 ? "" : "none";
}

function updateGame(deltaTime) {
    renderUI();
}

window.onload = () => {
    actionButtons();
    let lastTime = performance.now();
    setInterval(function gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        updateGame(deltaTime);
    });
}