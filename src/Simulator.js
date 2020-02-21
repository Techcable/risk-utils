import React from 'react';

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {Territory, analyse, median} from './simulate.js';

const VALID_MODES = ["Attack", "Analyse"];

class AttackForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: "Attack",
			attackingTroops: null,
			defendingTroops: null
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
			mode: mode, attackingTroops: attackingTroops,
			defendingTroops: defendingTroops
		});
	}

	updateMode(event) {
		const mode = event.target.value;
		if (!VALID_MODES.includes(mode)) throw new Error("Invalid mode: " + mode);
		this.setState({mode: mode});
	}
	updateAttackingTroops(event) {
		this.setState({attackingTroops: event.target.value});
	}
	updateDefendingTroops(event) {
		this.setState({defendingTroops: event.target.value});
	}

	render() {
		return (
			<Form>
				<Form.Group>
					<Form.Control
					  value={this.state.mode}
					  as="select"
					  onChange={(e) => this.updateMode(e)}
					>
						<option>Attack</option>
						<option>Analyse</option>
					</Form.Control>
					<Form.Label>Attacking Troops</Form.Label>
					<Form.Control type="number" min="2" 
						onChange={(e) => this.updateAttackingTroops(e)} />
					<Form.Label>Defending Troops</Form.Label>
					<Form.Control type="number" min="1"
						onChange={(e) => this.updateDefendingTroops(e)} />		
				</Form.Group>
				<Button variant="primary" onClick={(e) => this.handleClick(e)}>Run</Button>
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
		survivingDefenceMsg = <p>Median troops surviving a successful defence: {median(result.survivingDefenceTroops)}</p>;
	} else {
		survivingDefenceMsg = <p>Defender never wins</p>;
	}
	return (
		<div>
			<p>Attacker wins {result.percentage}% of the time</p>
			{survivingAttackMsg}
			{survivingDefenceMsg}
		</div>
	);
}

class AttackSimulator extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			formResult: null
		};
	}

	renderOutcome(formResult) {
		if (formResult == null) return null;
		const mode = formResult.mode;
		const attackingTroops = formResult.attackingTroops;
		const defendingTroops = formResult.defendingTroops;
		switch (mode) {
			case null:
				return null;
			case "Attack":
				const attacker = new Territory("Attacker", attackingTroops);
                const defender = new Territory("Defender", defendingTroops);
                if (attacker.attack(defender)) {
                	return <p>Attacker wins with {attacker.troops} troops remaining</p>;
                } else {
                	return <p>Defender wins with {defender.troops} remaining</p>;
                }
            case "Analyse":
            	let analyseResult = analyse(attackingTroops, defendingTroops);
            	return <AnalyseOutcome result={analyseResult} />;
            default:
            	throw new Error(mode);
		}
	}

	render() {
		return (
			<Container>
				<Row>
					<Col lg={true}>
						<AttackForm onSubmit={(formResult) => this.setState({formResult: formResult})} />
					</Col>
				</Row>
				<Row>
					<Col lg={true}>
						<h4>Outcome</h4>
						{this.renderOutcome(this.state.formResult)}
					</Col>
				</Row>
			</Container>
		);
	}
}

export default AttackSimulator;