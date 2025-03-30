import React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

function median(data: number[]): number {
    if (data.length == 0) throw new Error("Empty data!");
    data = data.slice(); // defensive copy
    data.sort(function (a, b) {
        return a - b;
    });
    let mid = Math.floor(data.length / 2);
    if (data.length % 2 != 0) {
        return data[mid];
    } else {
        let first = data[mid];
        let second = data[mid - 1];
        return (first + second) / 2;
    }
}

enum Mode {
    ATTACK = "Attack",
    ANALYSE = "Analyse",
}
function validateMode(name: string): Mode {
    const validModes = Object.values(Mode) as string[];
    if (!validModes.includes(name)) throw new Error(`Invalid mode: '${name}'`);
    return name as Mode;
}

/**
 * Requests a simulation.
 */
export interface SimulationRequest {
    mode: Mode;
    attackingTroops: number;
    defendingTroops: number;
}
interface SimulationStatusResponse {
    status: number;
}
export type SimulationResponse = SimulationStatusResponse | AttackResult | AnalysisResult;

interface AttackFormProps {
    onSubmit: (value: SimulationRequest) => void;
}
interface AttackFormState {
    mode: Mode;
    attackingTroops: string | null;
    defendingTroops: string | null;
}

class AttackForm extends React.Component<AttackFormProps, AttackFormState> {
    constructor(props: AttackFormProps) {
        super(props);
        this.state = {
            mode: Mode.ATTACK,
            attackingTroops: null,
            defendingTroops: null,
        };
    }

    // TODO: Why is this unused?
    handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        this.handleClick();
    }

    handleClick() {
        const mode = this.state.mode;
        const attackingTroops = this.state.attackingTroops ? Number.parseInt(this.state.attackingTroops) : null;
        const defendingTroops = this.state.defendingTroops ? Number.parseInt(this.state.defendingTroops) : null;
        if (!Number.isInteger(attackingTroops)) {
            alert("Invalid attacking integer: " + this.state.attackingTroops);
            return;
        }
        if (!Number.isInteger(defendingTroops)) {
            alert("Invalid defending troops: " + this.state.defendingTroops);
            return;
        }
        this.props.onSubmit({
            mode: mode,
            // already checked for non-integer values
            attackingTroops: attackingTroops as number,
            defendingTroops: defendingTroops as number,
        });
    }

    updateMode(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ mode: validateMode(event.target.value) });
    }
    updateAttackingTroops(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ attackingTroops: event.target.value });
    }
    updateDefendingTroops(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ defendingTroops: event.target.value });
    }

    render() {
        return (
            <Form>
                <Form.Group>
                    <Form.Control value={this.state.mode} as="select" onChange={this.updateMode.bind(this)}>
                        <option>Attack</option>
                        <option>Analyse</option>
                    </Form.Control>
                    <Form.Label>Attacking Troops</Form.Label>
                    <Form.Control type="number" min="2" onChange={this.updateAttackingTroops.bind(this)} />
                    <Form.Label>Defending Troops</Form.Label>
                    <Form.Control type="number" min="1" onChange={this.updateDefendingTroops.bind(this)} />
                </Form.Group>
                <Button variant="primary" onClick={this.handleClick.bind(this)}>
                    Run
                </Button>
            </Form>
        );
    }
}

function AttackOutcome(props: AttackResult) {
    if (props.win) {
        return <p>Attacker wins with ${props.attacker.troops} troops remaining</p>;
    } else {
        return <p>Defender wins with ${props.defender.troops} troops remaining</p>;
    }
}

function AnalyseOutcome(props: { result: AnalysisResult }) {
    const result = props.result;
    let survivingAttackMsg;
    let survivingDefenceMsg;
    if (result.survivingAttackTroops.length > 0) {
        survivingAttackMsg = <p>Median troops surviving a successful attack: {median(result.survivingAttackTroops)}</p>;
    } else {
        survivingAttackMsg = <p>Attacker never wins</p>;
    }
    if (result.survivingDefenceTroops.length > 0) {
        survivingDefenceMsg = (
            <p>Median troops surviving a successful defence: {median(result.survivingDefenceTroops)}</p>
        );
    } else {
        survivingDefenceMsg = <p>Defender never wins</p>;
    }
    const runs = result.survivingAttackTroops.length + result.survivingDefenceTroops.length;
    const percentage = (result.survivingAttackTroops.length / runs) * 100;
    return (
        <div>
            <p>Attacker wins {percentage}% of the time</p>
            {survivingAttackMsg}
            {survivingDefenceMsg}
        </div>
    );
}

export interface TerritoryInfo {
    name: string;
    troops: number;
}
interface AttackResult {
    win: boolean;
    attacker: TerritoryInfo;
    defender: TerritoryInfo;
}
interface SimulatorState {
    mode: Mode | null;
    attack: AttackResult | null;
    analyse: AnalysisResult | null;
    status: number;
}
export interface AnalysisResult {
    survivingAttackTroops: number[];
    survivingDefenceTroops: number[];
}

class AttackSimulator extends React.Component<{}, SimulatorState> {
    worker?: Worker;
    constructor(props: {}) {
        super(props);
        this.state = {
            mode: null,
            attack: null,
            analyse: null,
            status: 0.0,
        };
    }

    componentDidMount() {
        this.worker = new Worker(new URL("./workers/simulate.ts", import.meta.url));
        this.worker.onmessage = (e) => {
            if ("status" in e.data) {
                // This is just a status update
                this.setState({ status: e.data.status });
                return;
            }
            console.log(`Received message ${Object.entries(e.data)}`);
            switch (this.state.mode) {
                case null:
                    break;
                case "Attack":
                    console.log(`Updating attack state`);
                    this.setState({ attack: e.data });
                    break;
                case "Analyse":
                    this.setState({ analyse: e.data });
                    break;
                default:
                    throw new Error(`Invalid mode: ${this.state.mode}`);
            }
        };
    }

    handleFormResult(formResult: SimulationRequest) {
        if (formResult == null) return null;
        const mode = formResult.mode;
        if (mode == null) return null;
        // Clear the old state, but update the mode
        this.setState({
            mode: mode,
            attack: null,
            analyse: null,
            status: 0.0,
        });
        const attackingTroops = formResult.attackingTroops;
        const defendingTroops = formResult.defendingTroops;
        this.sendMessage({
            mode: mode,
            attackingTroops: attackingTroops,
            defendingTroops: defendingTroops,
        });
    }

    private sendMessage(message: SimulationRequest) {
        this.worker!.postMessage(message);
    }

    renderOutcome() {
        if (this.state.mode == null) return null;
        switch (this.state.mode) {
            case "Attack":
                const attack = this.state.attack;
                if (attack == null) {
                    return <p>Awaiting attack results....</p>;
                } else if (attack.win) {
                    return <p>Attacker wins with {attack.attacker.troops} troops remaining</p>;
                } else {
                    return <p>Defender wins with {attack.defender.troops} troops remaining</p>;
                }
            case "Analyse":
                const analyse = this.state.analyse;
                if (analyse == null) {
                    return <p>Awaiting analysis results {this.state.status * 100}%....</p>;
                } else {
                    return <AnalyseOutcome result={analyse} />;
                }
            default:
                throw new Error(this.state.mode);
        }
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col lg={true}>
                        <AttackForm onSubmit={(formResult) => this.handleFormResult(formResult)} />
                    </Col>
                </Row>
                <Row>
                    <Col lg={true}>
                        <h4>Outcome</h4>
                        {this.renderOutcome()}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default AttackSimulator;
