function zip(a, b) {
    var args = [].slice.call(arguments);
    var shortest = args.length==0 ? [] : args.reduce(function(a,b){
        return a.length<b.length ? a : b
    });

    return shortest.map(function(_,i){
        return args.map(function(array){return array[i]})
    });
}
function median(data) {
    if (data.length == 0) throw new Error("Empty data!");
    var data = data.slice();
    data.sort(function(a, b){return a - b});
    var mid = Math.floor(data.length / 2);
    if (data.length % 2 != 0) {
        return data[mid];
    } else {
        var first = data[mid];
        var second = data[mid - 1];
        return (first + second) / 2;
    }
}
class AnalysisResult {
    constructor(survivingAttackTroops, survivingDefenceTroops) {
        this.survivingAttackTroops = survivingAttackTroops;
        this.survivingDefenceTroops = survivingDefenceTroops;
    }

    get runs() {
        return this.survivingAttackTroops.length
            + this.survivingDefenceTroops.length;
    }

    get percentage() {
        return (this.survivingAttackTroops.length / this.runs) * 100;
    }
}
function analyse(attackingTroops, defendingTroops) {
    const RUNS = 1000;
    let attacker = new Territory("Attacker", null);
    let defender = new Territory("Defender", null);
    let survivingAttackTroops = [];
    let survivingDefenceTroops = [];
    for (var run = 0; run < RUNS; run++) {
        attacker.troops = attackingTroops;
        defender.troops = defendingTroops;
        if (attacker.attack(defender)) {
            survivingAttackTroops.push(attacker.troops);
        } else {
            survivingDefenceTroops.push(defender.troops);
        }
    }
    console.assert(survivingAttackTroops.length + survivingDefenceTroops.length == RUNS);
    return new AnalysisResult(survivingAttackTroops, survivingDefenceTroops);
}
var sumRoll = 0;
var numRoll = 0;
class Territory {
    constructor(name, troops) {
        this.name = name;
        this.troops = troops;
    }
    get attackDice() {
        return Math.max(Math.min(3, this.troops - 1), 1);
    }
    get defenseDice() {
        return Math.min(this.troops, 2);
    }
    roll(times) {
        var rolls = [];
        for (var i = 0; i < times; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            sumRoll += value;
            numRoll += 1;
            rolls.push(value);
        }
        // NOTE: Sorts in reverse order
        rolls.sort(function(a, b){return b-a});
        return rolls;
    }
    attack(defender) {
        console.log(`${this.troops} troops attacking ${defender.troops}`);
        const troopThreshold = 1;
        while (this.troops > troopThreshold) {
            const defenseDice = defender.roll(defender.defenseDice);
            if (defenseDice.length == 0) {
                if (defender.troops != 0) throw new Error(defender.troops);
                return true; // we win
            }
            const attackDice = this.roll(this.attackDice);
            for (let [attackDie, defenseDie] of zip(attackDice, defenseDice)) {
                if (attackDie > defenseDie) {
                    defender.troops -= 1;
                } else {
                    this.troops -= 1;
                }
            }
            if (this.troops < 0) throw new Error();
            if (defender.troops < 0) throw new Error();
        }
        return false; // we loose or give up
    }
}

export {Territory, analyse, median};