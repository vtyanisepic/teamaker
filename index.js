let player = {
    money: 0,
    ideas: 0,
    popularity: 0,
    stage: 0,
    ingredients: {
        teaLeaves: {amount: 5, price: 5, purchaseAmount: 10},
        emptyCups: {amount: 1, price: 1, purchaseAmount: 2},
        sweeteners: {amount: 0, price: 0, purchaseAmount: 0, unlocked: false},
    },
    brewedTea: {
        blandTea: {amount: 0, price: 10, demand: 0, creation: {teaLeaves: 5, emptyCups: 1}},
    },
    unlockedResearches: {}
}

const researches = {
    lemonJuice: {visible: () => player.ideas >= 10 && !player.unlockedResearches.includes("lemonJuice"), price: 50}
}

function actionButton(item) {
    if (item in player.ingredients) {
        if (player.money >= player.ingredients[item].price) {
            player.money -= player.ingredients[item].price
            player.ingredients[item].amount += player.ingredients[item].purchaseAmount
            console.log(`Bought ${player.ingredients[item].purchaseAmount} ${item}`)
        } else {
            console.log("Not enough money")
        } 
    } else if (item in researches) {
        if (player.money >= researches[item].price) {
            player.money -= researches[item].price
            player.unlockedResearches.push(item)
            console.log(`Unlocked ${item}, ${player.unlockedResearches}`)
        }
    } else if (item === "brewTea") {
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
        }
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
    document.getElementById("cashDisplay").innerText = `Cash: $${player.money}`
    document.getElementById("popularityDisplay").innerText = `Popularity: ${player.popularity}`

    //warehouse
    document.getElementById("sweetenersRow").style.display = player.ingredients.sweeteners.unlocked ? "" : "none"
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

    //research
    document.getElementById("researchSection").style.display = player.stage >= 2 ? "" : "none"
    document.getElementById("lemonJuice").style.display = !researches.lemonJuice.visible ? "" : "none"
}

const thresholds = [ //popularity, demand per second
    [50, 0.25],
    [100, 0.27],
    [200, 0.3],
    [600, 0.4],
    [1500, 0.5],
]
const thresholdToDemand = thresholds.map(([max, perSecond], index) => [max, index === 0 ? 0 : thresholds[index - 1][0], perSecond])
//0 - max, 1 - min, 2 - demand per second
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
    const blandTeaSold = Math.min(player.brewedTea.blandTea.amount, player.brewedTea.blandTea.demand)
    player.brewedTea.blandTea.amount -= blandTeaSold; player.brewedTea.blandTea.demand -= blandTeaSold
    player.money += blandTeaSold * player.brewedTea.blandTea.price
}

function updateGame(deltaTime) {
    if (player.stage > 0) calculateDemand(player.popularity, deltaTime)
    sellTea()
    renderUI()
}

window.onload = () => {
    let lastTime = performance.now()
    setInterval(function gameLoop() {
        const currentTime = performance.now()
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        updateGame(deltaTime)
    })
}