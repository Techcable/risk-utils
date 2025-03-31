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

    /**
     * THe probabilities of a specified outcome,
     * indexed by (attacker dice, defender tipe, defense troops lost)
     *
     * This is a 3x3x3 matrix.
     */
    private static RESULT_PROBABILITIES = new Float64Array(27);
    private static computeResultIndex(i: number, j: number, k: number): number {
        if (
            !Number.isSafeInteger(i) ||
            i < 1 ||
            i > 3 ||
            !Number.isSafeInteger(j) ||
            j < 1 ||
            j > 2 ||
            !Number.isSafeInteger(k) ||
            k < 0 ||
            k >= 3
        )
            throw new Error("bad index");
        return (i - 1) * 9 + (j - 1) * 3 + k;
    }
    private static getProbabilities(i: number, j: number): Float64Array {
        let start = this.computeResultIndex(i, j, 0);
        return this.RESULT_PROBABILITIES.subarray(start, start + 3);
    }
    private static setResultProb(i: number, j: number, k: number, val: number) {
        let idx = this.computeResultIndex(i, j, k);
        if (!Number.isFinite(val) || val < 0 || val > 1) throw new Error(`bad value: ${val}`);
        this.RESULT_PROBABILITIES[idx] = val;
    }
    private static CUMULATIVE_RESULT_PROBABILITIES = new Float64Array(27);
    static {
        // copied straight from Osborne's Table 2
        this.setResultProb(1, 1, 1, 15 / 36);
        this.setResultProb(1, 1, 0, 21 / 36);
        this.setResultProb(1, 2, 1, 55 / 216);
        this.setResultProb(1, 2, 0, 161 / 216);
        this.setResultProb(2, 1, 1, 125 / 216);
        this.setResultProb(2, 1, 0, 91 / 216);
        this.setResultProb(2, 2, 2, 295 / 1296);
        this.setResultProb(2, 2, 1, 420 / 1296);
        this.setResultProb(2, 2, 0, 581 / 1296);
        this.setResultProb(3, 1, 1, 855 / 1296);
        this.setResultProb(3, 1, 0, 441 / 1296);
        this.setResultProb(3, 2, 2, 2890 / 7776);
        this.setResultProb(3, 2, 1, 2611 / 7776);
        this.setResultProb(3, 2, 0, 2275 / 7776);
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 2; j++) {
                let cum = 0;
                for (let k = 0; k < 3; k++) {
                    let idx = this.computeResultIndex(i, j, k);
                    cum += this.RESULT_PROBABILITIES[idx];
                    this.CUMULATIVE_RESULT_PROBABILITIES[idx] = cum;
                }
                if (Math.abs(1 - cum) > 10e-9) throw new Error(`bad sum ${cum} for (${i},${j})`);
            }
        }
    }

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
        const PROB_TABLE = Territory.CUMULATIVE_RESULT_PROBABILITIES;
        while (this.troops > troopThreshold) {
            let defenseDice = defender.defenseDice;
            if (defenseDice == 0) return true; // we win
            let attackDice = this.attackDice;
            let diceAtRisk = Math.min(defenseDice, attackDice);
            const x = Math.random();
            // unrolled loop
            let tableOffset = (attackDice - 1) * 9 + (defenseDice - 1) * 3;
            const a = PROB_TABLE[tableOffset];
            const b = PROB_TABLE[tableOffset + 1];
            let defenseLoss: number;
            if (x <= a) {
                defenseLoss = 0;
            } else if (x <= b) {
                defenseLoss = 1;
            } else {
                defenseLoss = 2;
            }
            let attackLoss = diceAtRisk - defenseLoss;
            console.assert(defenseLoss >= 0 && defenseLoss <= 2);
            console.assert(attackLoss >= 0 && attackLoss <= 2);
            this.troops -= attackLoss;
            defender.troops -= defenseLoss;
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
