$(function() {
    "use strict";
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        //The maximum is exclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min)) + min;
    }
    function zip(a, b) {
        var args = [].slice.call(arguments);
        var shortest = args.length==0 ? [] : args.reduce(function(a,b){
            return a.length<b.length ? a : b
        });

        return shortest.map(function(_,i){
            return args.map(function(array){return array[i]})
        });
    }
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
                rolls.push(getRandomInt(1, 7));
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
                    if (attackDice > defenseDice) {
                        defender.troops -= 1;
                    } else {
                        this.troops -= 1
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
            default:
                alert(`Unknown mode ${mode}`);
                break;
        }
    })
})