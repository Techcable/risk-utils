import React from 'react';
import GITHUB_CORNER_HTML from './github_corner.js'

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import Container from 'react-bootstrap/Container';

import AttackSimulator from './Simulator.js';

function RiskNavBar() {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="">Risk Utilities</Navbar.Brand>
      <Navbar.Collapse id="navbarSupportedContent">
        <Nav className="mr-auto">
          <Nav.Item>
            <Nav.Link active={true}>Home</Nav.Link> 
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
      {/* Our github logo */}
      <div dangerouslySetInnerHTML={{__html: GITHUB_CORNER_HTML}} />
    </Navbar>
  );
}

function RiskHeader() {
  return (
    <Container>
    <div>
        <h1>Risk Utilities</h1>
        <p class="lead">Simulate attacks and analyse outputs</p>
    </div>
    </Container>
  );
}

function App() {
  return (
    <div>
      <RiskNavBar />

      <RiskHeader />

      <AttackSimulator />
    </div>
  );
}

export default App;