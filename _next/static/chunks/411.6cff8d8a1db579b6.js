"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[411],{7792:(t,e,s)=>{s.r(e),s.d(e,{default:()=>v});var n=s(8081),r=s(2149),a=s(4378),i=s(2667),o=s(4215);s(2354);var l=s(4880),c=s(3120),d=s(2874),h=s(3228);function u(t){if(0==t.length)throw Error("Empty data!");(t=t.slice()).sort(function(t,e){return t-e});let e=Math.floor(t.length/2);return t.length%2!=0?t[e]:(t[e]+t[e-1])/2}var p=function(t){return t.ATTACK="Attack",t.ANALYSE="Analyse",t}(p||{});class g extends r.Component{handleSubmit(t){t.preventDefault(),this.handleClick()}handleClick(){let t=this.state.mode,e=this.state.attackingTroops?Number.parseInt(this.state.attackingTroops):null,s=this.state.defendingTroops?Number.parseInt(this.state.defendingTroops):null;if(!Number.isInteger(e)){alert("Invalid attacking integer: "+this.state.attackingTroops);return}if(!Number.isInteger(s)){alert("Invalid defending troops: "+this.state.defendingTroops);return}this.props.onSubmit({mode:t,attackingTroops:e,defendingTroops:s})}updateMode(t){this.setState({mode:function(t){if(!Object.values(p).includes(t))throw Error("Invalid mode: '".concat(t,"'"));return t}(t.target.value)})}updateAttackingTroops(t){this.setState({attackingTroops:t.target.value})}updateDefendingTroops(t){this.setState({defendingTroops:t.target.value})}render(){return(0,n.jsxs)(l.A,{children:[(0,n.jsxs)(l.A.Group,{children:[(0,n.jsxs)(l.A.Control,{value:this.state.mode,as:"select",onChange:this.updateMode.bind(this),children:[(0,n.jsx)("option",{children:"Attack"}),(0,n.jsx)("option",{children:"Analyse"})]}),(0,n.jsx)(l.A.Label,{children:"Attacking Troops"}),(0,n.jsx)(l.A.Control,{type:"number",min:"2",onChange:this.updateAttackingTroops.bind(this)}),(0,n.jsx)(l.A.Label,{children:"Defending Troops"}),(0,n.jsx)(l.A.Control,{type:"number",min:"1",onChange:this.updateDefendingTroops.bind(this)})]}),(0,n.jsx)(c.A,{variant:"primary",onClick:this.handleClick.bind(this),children:"Run"})]})}constructor(t){super(t),this.state={mode:"Attack",attackingTroops:null,defendingTroops:null}}}function m(t){let e,s;let r=t.result;e=r.survivingAttackTroops.length>0?(0,n.jsxs)("p",{children:["Median troops surviving a successful attack: ",u(r.survivingAttackTroops)]}):(0,n.jsx)("p",{children:"Attacker never wins"}),s=r.survivingDefenceTroops.length>0?(0,n.jsxs)("p",{children:["Median troops surviving a successful defence: ",u(r.survivingDefenceTroops)]}):(0,n.jsx)("p",{children:"Defender never wins"});let a=r.survivingAttackTroops.length+r.survivingDefenceTroops.length,i=r.survivingAttackTroops.length/a*100;return(0,n.jsxs)("div",{children:[(0,n.jsxs)("p",{children:["Attacker wins ",i,"% of the time"]}),e,s]})}class f extends r.Component{componentDidMount(){this.worker=new Worker(s.tu(new URL(s.p+s.u(635),s.b))),this.worker.onmessage=t=>{if("status"in t.data){this.setState({status:t.data.status});return}switch(console.log("Received message ".concat(Object.entries(t.data))),this.state.mode){case null:break;case"Attack":console.log("Updating attack state"),this.setState({attack:t.data});break;case"Analyse":this.setState({analyse:t.data});break;default:throw Error("Invalid mode: ".concat(this.state.mode))}}}handleFormResult(t){if(null==t)return null;let e=t.mode;if(null==e)return null;this.setState({mode:e,attack:null,analyse:null,status:0});let s=t.attackingTroops,n=t.defendingTroops;this.sendMessage({mode:e,attackingTroops:s,defendingTroops:n})}sendMessage(t){this.worker.postMessage(t)}renderOutcome(){if(null==this.state.mode)return null;switch(this.state.mode){case"Attack":let t=this.state.attack;if(null==t)return(0,n.jsx)("p",{children:"Awaiting attack results...."});if(t.win)return(0,n.jsxs)("p",{children:["Attacker wins with ",t.attacker.troops," troops remaining"]});return(0,n.jsxs)("p",{children:["Defender wins with ",t.defender.troops," troops remaining"]});case"Analyse":let e=this.state.analyse;if(null==e)return(0,n.jsxs)("p",{children:["Awaiting analysis results ",100*this.state.status,"%...."]});return(0,n.jsx)(m,{result:e});default:throw Error(this.state.mode)}}render(){return(0,n.jsxs)(o.A,{children:[(0,n.jsx)(h.A,{children:(0,n.jsx)(d.A,{lg:!0,children:(0,n.jsx)(g,{onSubmit:t=>this.handleFormResult(t)})})}),(0,n.jsx)(h.A,{children:(0,n.jsxs)(d.A,{lg:!0,children:[(0,n.jsx)("h4",{children:"Outcome"}),this.renderOutcome()]})})]})}constructor(t){super(t),this.state={mode:null,attack:null,analyse:null,status:0}}}function k(){return(0,n.jsxs)(i.A,{bg:"light",expand:"lg",children:[(0,n.jsx)(i.A.Brand,{children:"Risk Utilities"}),(0,n.jsx)(i.A.Collapse,{id:"navbarSupportedContent",children:(0,n.jsx)(a.A,{className:"mr-auto",children:(0,n.jsx)(a.A.Item,{children:(0,n.jsx)(a.A.Link,{active:!0,children:"Home"})})})}),(0,n.jsx)("div",{dangerouslySetInnerHTML:{__html:'<a href=https://github.com/Techcable/risk-utils class="github-corner" aria-label="View source on Github"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#70B7FD; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>'}})]})}function x(){return(0,n.jsx)(o.A,{children:(0,n.jsxs)("div",{children:[(0,n.jsx)("h1",{children:"Risk Utilities"}),(0,n.jsx)("p",{className:"lead",children:"Simulate attacks and analyse outputs"})]})})}let v=function(){return(0,n.jsxs)("div",{children:[(0,n.jsx)(k,{}),(0,n.jsx)(x,{}),(0,n.jsx)(f,{})]})}}}]);