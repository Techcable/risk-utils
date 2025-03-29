import React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

function median(data) {
    if (data.length == 0) throw new Error("Empty data!");
    var data = data.slice();
    data.sort(function (a, b) {
        return a - b;
    });
    var mid = Math.floor(data.length / 2);
    if (data.length % 2 != 0) {
        return data[mid];
    } else {
        var first = data[mid];
        var second = data[mid - 1];
        return (first + second) / 2;
    }
}

const VALID_MODES = ["Attack", "Analyse"];

class AttackForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: "Attack",
            attackingTroops: null,
            defendingTroops: null,
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        this.handleClick();
    }

    handleClick() {
        const mode = this.state.mode;
        const attackingTroops = Number.parseInt(this.state.attackingTroops);
        const defendingTroops = Number.parseInt(this.state.defendingTroops);
        if (!VALID_MODES.includes(mode)) {
            alert("Invalid mode: " + mode);
            return;
        }
        if (!Number.isInteger(attackingTroops)) {
            alert("Invalid attacking integer: " + this.state.attackingTroops);
            return;
        }
        if (!Number.isInteger(defendingTroops)) {
            alert("Invalid defending troops: " + this.state.defendingTroops);
        }
        this.props.onSubmit({
            mode: mode,
            attackingTroops: attackingTroops,
            defendingTroops: defendingTroops,
        });
    }

    updateMode(event) {
        const mode = event.target.value;
        if (!VALID_MODES.includes(mode)) throw new Error("Invalid mode: " + mode);
        this.setState({ mode: mode });
    }
    updateAttackingTroops(event) {
        this.setState({ attackingTroops: event.target.value });
    }
    updateDefendingTroops(event) {
        this.setState({ defendingTroops: event.target.value });
    }

    render() {
        return (
            <Form>
                <Form.Group>
                    <Form.Control value={this.state.mode} as="select" onChange={(e) => this.updateMode(e)}>
                        <option>Attack</option>
                        <option>Analyse</option>
                    </Form.Control>
                    <Form.Label>Attacking Troops</Form.Label>
                    <Form.Control type="number" min="2" onChange={(e) => this.updateAttackingTroops(e)} />
                    <Form.Label>Defending Troops</Form.Label>
                    <Form.Control type="number" min="1" onChange={(e) => this.updateDefendingTroops(e)} />
                </Form.Group>
                <Button variant="primary" onClick={(e) => this.handleClick(e)}>
                    Run
                </Button>
            </Form>
        );
    }
}

function AttackOutcome(props) {
    if (props.attackSuccess) {
        return <p>Attacker wins with ${props.attacker.troops} troops remaining</p>;
    } else {
        return <p>Defender wins with ${props.defender.troops} troops remaining</p>;
    }
}

function AnalyseOutcome(props) {
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

class AttackSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            attack: null,
            analyse: null,
            status: 0.0,
        };
    }

    componentDidMount() {
        this.worker = new Worker(new URL("../simulate.js", import.meta.url));
        this.worker.onmessage = (e) => {
            if ("status" in e.data) {
                // This is just a status update
                this.setState({ status: e.data.status });
                return;
            }
            console.log(`Recieved message ${Object.entries(e.data)}`);
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

    handleFormResult(formResult) {
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
        this.worker.postMessage({
            mode: mode,
            attackingTroops: attackingTroops,
            defendingTroops: defendingTroops,
        });
    }

    renderOutcome() {
        if (this.state.mode == null) return null;
        switch (this.state.mode) {
            case "Attack":
                const attack = this.state.attack;
                if (attack == null) {
                    return <p>Awaiting attack results....</p>;
                } else if (attack.win) {
                    return <p>Attacker wins with {attack.attacker} troops remaining</p>;
                } else {
                    return <p>Defender wins with {attack.defender} troops remaining</p>;
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
