import type { TerritoryInfo, AnalysisResult, SimulationRequest, SimulationResponse } from "../Simulator";

function zip<T>(a: T[], b: T[]): T[][] {
    let args = [a, b];
    let shortest = a.length < b.length ? a : b;

    return shortest.map(function (_: T, idx) {
        return args.map(function (array: T[]) {
            return array[idx];
        });
    });
}

/**
 * Use this instead of direct postMessage to enable type checking.
 */
function sendResponse(response: SimulationResponse) {
    postMessage(response);
}

function analyse(
    attackingTroops: number,
    defendingTroops: number,
    statusCallback: (completionPercent: number) => void,
): AnalysisResult {
    const RUNS = 20000;
    let attacker = new Territory("Attacker", attackingTroops);
    let defender = new Territory("Defender", defendingTroops);
    let survivingAttackTroops = [];
    let survivingDefenceTroops = [];
    for (let run = 0; run < RUNS; run++) {
        attacker.troops = attackingTroops;
        defender.troops = defendingTroops;
        if (attacker.attack(defender)) {
            survivingAttackTroops.push(attacker.troops);
        } else {
            survivingDefenceTroops.push(defender.troops);
        }
        statusCallback(run / RUNS);
    }
    console.assert(survivingAttackTroops.length + survivingDefenceTroops.length == RUNS);
    return {
        survivingAttackTroops: survivingAttackTroops,
        survivingDefenceTroops: survivingDefenceTroops,
    };
}

class Territory implements TerritoryInfo {
    name: string;
    troops: number;

    constructor(name: string, troops: number) {
        this.name = name;
        this.troops = troops;
    }
    get attackDice(): number {
        return Math.max(Math.min(3, this.troops - 1), 1);
    }
    get defenseDice(): number {
        return Math.min(this.troops, 2);
    }
    roll(times: number): number[] {
        let rolls = [];
        for (let i = 0; i < times; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            rolls.push(value);
        }
        // NOTE: Sorts in reverse order
        rolls.sort(function (a, b) {
            return b - a;
        });
        return rolls;
    }
    attack(defender: Territory): boolean {
        console.log(`${this.troops} troops attacking ${defender.troops}`);
        const troopThreshold = 1;
        while (this.troops > troopThreshold) {
            const defenseDice = defender.roll(defender.defenseDice);
            if (defenseDice.length == 0) {
                if (defender.troops != 0) {
                    throw new Error(`Defender has zero dice but nonzero troops: ${defender.troops}`);
                }
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

onmessage = function (e: MessageEvent<SimulationRequest>) {
    const mode = e.data.mode;
    const attackingTroops = e.data.attackingTroops;
    const defendingTroops = e.data.defendingTroops;
    switch (mode) {
        case "Attack":
            console.log(`Simulating attack`);
            const attacker = new Territory("Attacker", attackingTroops);
            const defender = new Territory("Defender", defendingTroops);
            const win = attacker.attack(defender);
            console.log(`Attacker troops ${attacker.troops}`);
            sendResponse({
                attacker: attacker,
                defender: defender,
                win: win,
            });
            return;
        case "Analyse":
            let i = 0;
            sendResponse(
                analyse(attackingTroops, defendingTroops, (status) => {
                    if (i++ % 100 == 0) {
                        sendResponse({ status: status });
                    }
                }),
            );
            break;
        default:
            throw new Error(`Invalid mode ${mode}`);
    }
};
