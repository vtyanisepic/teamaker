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
        player.money -= player.ingredients[ingredient].price
        player.ingredients[ingredient].amount += player.ingredients[ingredient].purchaseAmount
        console.log(`Bought ${player.ingredients[ingredient].purchaseAmount} ${ingredient}.`)
    } else {
        console.log("Not enough money")
    }
}

function haveEnough(required, available) {
    for (let item in required) {
        if (required[item] > available[item].amount) {
            return false
        }
    }
    return true
}

function renderUI() {
    document.querySelector("p span").innerText = player.money
    // document.getElementById("brewTea").style.display = ""

    //warehouse
    for (let ingredient in player.ingredients) {
        if (document.getElementById(`${ingredient}Row`).checkVisibility()) {
            document.getElementById(`${ingredient}Stock`).innerText = player.ingredients[ingredient].amount
            document.getElementById(`${ingredient}Buy`).innerText = `+${player.ingredients[ingredient].purchaseAmount} ($${player.ingredients[ingredient].price})`
        }
    }

    //market
    document.getElementById("marketSection").style.display = player.stage >= 1 ? "" : "none"
    for (let tea in player.brewedTea) {
        if (document.getElementById(`${tea}Row`).checkVisibility()) {
            document.getElementById(`${tea}Stock`).innerText = player.brewedTea[tea].amount
            document.getElementById(`${tea}Price`).innerText = player.brewedTea[tea].price
            document.getElementById(`${tea}Demand`).innerText = player.brewedTea[tea].demand
        }
    }

    //visibility
    // document.getElementById("warehouseSection").style.display = ""
    document.getElementById("sweetenersRow").style.display = player.ingredients.sweeteners > 0 ? "" : "none"
}

const thresholds = [ // popularity, demand per second
    [50, 0.25],
    [100, 0.255],
    [200, 0.3],
    [600, 0.4],
    [1500, 0.5],
]
const thresholdToDemand = thresholds.map(([max, perSecond], index) => [max, index === 0 ? 0 : thresholds[index - 1][0], perSecond])
// 0 - max, 1 - min, 2 - demand per second
let thresholdIndex = 0
let timeAccumulated = 0
function calculateDemand(popularity, delta) {
    let isMaxed = thresholdIndex === thresholdToDemand.length
    let currentMax = null
    if (!isMaxed) {
        currentMax = thresholdToDemand[thresholdIndex][0]
        if (popularity < thresholdToDemand[thresholdIndex][1]) { //if you got too far ahead reset back
            thresholdIndex = 0
            currentMax = thresholdToDemand[thresholdIndex][0]
        }

        while (popularity > currentMax) {
            thresholdIndex++
            isMaxed = thresholdIndex === thresholdToDemand.length
            if (isMaxed) break //if we run out of ranges, break
            currentMax = thresholdToDemand[thresholdIndex][0]
        }
    }
    const demandPerSecond = isMaxed ? 20 + Math.floor(popularity / 100000) * 10 : thresholdToDemand[thresholdIndex][2] //if it's maxed then just add 10 for every 100k
    const demandCap = demandPerSecond * 60 //cap to 1 minute max
    const timeUntilOrder = 1 / demandPerSecond //this is in seconds!!
    timeAccumulated += delta
    const newOrders = Math.floor(timeAccumulated / timeUntilOrder)
    timeAccumulated -= timeUntilOrder * newOrders
    player.brewedTea.blandTea.demand += newOrders
}

function sellTea() {
    for (let tea in player.brewedTea) {
        if (player.brewedTea[tea].amount > 0 && player.brewedTea[tea].demand > 0) {
            player.brewedTea[tea].amount--; player.brewedTea[tea].demand--; player.money += player.brewedTea[tea].price
        }
    }
}

function updateGame(deltaTime) {
    if (player.stage > 0) calculateDemand(player.popularity, deltaTime)
    sellTea()
    renderUI()
}

window.onload = () => {
    const brewTea = document.getElementById("brewTea")
    brewTea.addEventListener("click", () => {
        if (player.stage === 0) {
            player.stage++
            console.log(`player.stage = ${player.stage}`)
        }
        const required = player.brewedTea.blandTea.creation
        if (haveEnough(required, player.ingredients)) {
            for (let item in required) {
                player.ingredients[item].amount -= required[item]
            }
            player.brewedTea.blandTea.amount++
            console.log("Brewed a cup of bland tea!")
        } else {
            console.log("Not enough ingredients to brew tea.")
        }
    })
    let lastTime = performance.now()
    setInterval(function gameLoop() {
        const currentTime = performance.now()
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        updateGame(deltaTime)
    })
}