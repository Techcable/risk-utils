$(function() {
    "use strict";
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
        console.log(`Surviving attack troops: ${survivingAttackTroops}`)
        console.assert(survivingAttackTroops.length + survivingDefenceTroops.length == RUNS);
        let percentage = (survivingAttackTroops.length / RUNS) * 100;
        $("#outcome").append(`<p>Attacker wins ${percentage}% of the time</p>`);
        if (survivingAttackTroops.length > 0) {
            $("#outcome").append(`<p>Median troops surviving a successful attack: ${median(survivingAttackTroops)}</p>`);
        } else {
            $("#outcome").append("<p>Attacker never wins</p>");
        }
        if (survivingDefenceTroops.length > 0) {
            $("#outcome").append(`<p>Median troops surviving a successful defense: ${median(survivingDefenceTroops)}</p>`)
        } else {
            $("#outcome").append("<p>Defender never survives</p>");
        }
    }
    var sumRoll = 0;
    var numRoll = 0;
    class Territory {
        constructor(name, troops) {
            this.name = name;
            this.troops = troops;
            this.random = new Random();
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
                const value = this.random.integer(1, 6);
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
    $("#attackForm").on('submit', function(event) {
        $("#runButton").trigger('click');
        event.preventDefault();
    });
    $("#runButton").on('click', function() {
        console.log('Clicked');
        const mode = $("#attackMode").val();
        const attackingTroops = Number.parseInt($("#attackingTroops").val());
        const defendingTroops = Number.parseInt($("#defendingTroops").val());
        $("#outcome").empty();
        switch(mode) {
            case "Attack":
                const attacker = new Territory("Attacker", attackingTroops);
                const defender = new Territory("Defender", defendingTroops);
                if (attacker.attack(defender)) {
                    $("#outcome").append(`<p>Attacker wins with ${attacker.troops} troops remaining</p>`);
                } else {
                    $("#outcome").append(`<p>Defender survives with ${defender.troops} troops remaining</p>`);
                }
                break;
            case "Analyse":
                analyse(attackingTroops, defendingTroops);
                break;
            default:
                alert(`Unknown mode ${mode}`);
                break;
        }
    })
})