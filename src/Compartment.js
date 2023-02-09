import Sketch from 'react-p5';
import { useState } from 'react'

const Compartment = ({canvasSize, numberOfAgents, STEP, CHANGE_DIR_PROB, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS, DELTA_AWARE, DELTA_RECOVER, DELTA_SUSCEPTIBLE, setSusceptibleCount, setContagiousCount, setRecoveredCount, setDeadCount, updateCounter}) => {

    const DIRECTIONS = [-1 * STEP, -1 * STEP, 0, 1 * STEP, 1 * STEP];

    const STATES = {
        susceptible: 'susceptible', 
        incubating: 'incubating', 
        contagious: 'contagious', 
        aware: 'aware', 
        recovered: 'recovered', 
        dead: 'dead'
    };

    const EPIDEMIC_SPREAD = {
        contagious: 1,
        safe: -1
    };

    const isInRange = (xPosition, yPosition) => xPosition < canvasSize && yPosition < canvasSize;
    const getRandomPosition = () =>  Math.floor(Math.random(canvasSize) * 1000) % canvasSize;
    const getRandomSpeed = () => Math.random() + 0.3;

    const startPopulation = Array(numberOfAgents).fill().map((_, index) => (
        {
            status: index === 0 ? STATES.contagious : STATES.susceptible,
            xPosition: getRandomPosition(),
            yPosition: getRandomPosition(),
            xDirection: 0,
            yDirection: 0,
            xSpeed: getRandomSpeed(),
            ySpeed: getRandomSpeed(),
            statusCounter: 0
        }
    ))

    const [population] = useState(startPopulation);
    const epidemicSpreadMap = Array(canvasSize).fill(0).map(_ => Array(canvasSize).fill({status: EPIDEMIC_SPREAD.safe}));

    const updateNextEpidemicSpreadForAgentLocation = (agent, status, currentEpidemicSpreadMap) => {
        if(isInRange(agent.xPosition, agent.yPosition)) {
            if(currentEpidemicSpreadMap[Math.abs(Math.floor(agent.xPosition))][Math.abs(Math.floor(agent.yPosition))] === EPIDEMIC_SPREAD.contagious){
                return;
            }
            epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition))][Math.abs(Math.floor(agent.yPosition))] = {status: status};
            currentEpidemicSpreadMap[Math.abs(Math.floor(agent.xPosition))][Math.abs(Math.floor(agent.yPosition))] = {status: status};
        }
    }

    const checkNeighbors = (agent) => {
        for(let i = 1; i <= INFECTION_RADIUS; i++) {
            if(isInRange(agent.xPosition + i , agent.yPosition + i) && (
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition - i))][Math.abs(Math.floor(agent.yPosition - i))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition - i))][Math.abs(Math.floor(agent.yPosition))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition - i))][Math.abs(Math.floor(agent.yPosition + i))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition))][Math.abs(Math.floor(agent.yPosition - i))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition))][Math.abs(Math.floor(agent.yPosition + i))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition + i))][Math.abs(Math.floor(agent.yPosition - i))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition + i))][Math.abs(Math.floor(agent.yPosition))].status === EPIDEMIC_SPREAD.contagious ||
                epidemicSpreadMap[Math.abs(Math.floor(agent.xPosition + i))][Math.abs(Math.floor(agent.yPosition + i))].status === EPIDEMIC_SPREAD.contagious)
            ) {
                return true
            }
        }
        return false
    }

    const setPosition = (agent) => {
            // ROWS
            if (agent.xPosition < canvasSize - 1) {
                agent.xPosition += agent.xDirection * agent.xSpeed;
            } else {
                agent.xPosition += -1 * agent.xSpeed;
                agent.xDirection *= -1;
            }
            if (agent.xPosition > 0) {
                agent.xPosition += agent.xDirection * agent.xSpeed;
            } else {
                agent.xPosition += 1 * agent.xSpeed;
                agent.xDirection *= -1;
            }
    
            // COLUMNS
            if (agent.yPosition < canvasSize - 1) {
                agent.yPosition += agent.yDirection * agent.ySpeed;
    
            } else {
                agent.yPosition += -1 * agent.ySpeed;
                agent.yDirection *= -1;
            }
            if (agent.yPosition > 0) {
                agent.yPosition += agent.yDirection * agent.ySpeed;
    
            } else {
                agent.yPosition += 1 * agent.ySpeed;
                agent.yDirection *= -1;
            }
    }

    const setDirection = (agent) => {
        if(Math.random() < CHANGE_DIR_PROB)
                agent.xDirection = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
            
        if(Math.random() < CHANGE_DIR_PROB)
            agent.yDirection = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    }

    const updateSicarsState = (agent, currentEpidemicSpreadMap) => {
        switch (agent.status) {
            case STATES.susceptible:
                updateNextEpidemicSpreadForAgentLocation(agent, EPIDEMIC_SPREAD.safe, currentEpidemicSpreadMap);
                if(Math.random() <= P_INFECT && checkNeighbors(agent)){
                    agent.status = STATES.incubating;
                    agent.statusCounter = 0;
                }
                break;
            case STATES.incubating:
                updateNextEpidemicSpreadForAgentLocation(agent, EPIDEMIC_SPREAD.safe, currentEpidemicSpreadMap);
                agent.statusCounter++
                if (agent.statusCounter > DELTA_CONTAGIOUS) {
                    agent.status = STATES.contagious;
                    agent.statusCounter = 0;
                }
                break;
            case STATES.contagious:
                updateNextEpidemicSpreadForAgentLocation(agent, EPIDEMIC_SPREAD.contagious, currentEpidemicSpreadMap);
                agent.statusCounter++
                if (agent.statusCounter > DELTA_AWARE){
                    agent.status = STATES.aware;
                    agent.statusCounter = 0;
                }
                break;
            case STATES.aware:
                updateNextEpidemicSpreadForAgentLocation(agent, EPIDEMIC_SPREAD.contagious, currentEpidemicSpreadMap);
                agent.statusCounter++
                if(agent.statusCounter > DELTA_RECOVER) {
                    agent.status = STATES.recovered;
                    agent.statusCounter = 0;
                    if(Math.random() <= P_Dead) {
                        agent.status = STATES.dead;
                        agent.statusCounter = 0;
                    }
                }
                break;
            case STATES.recovered:
                updateNextEpidemicSpreadForAgentLocation(agent, EPIDEMIC_SPREAD.safe, currentEpidemicSpreadMap);
                agent.statusCounter++
                if (agent.statusCounter > DELTA_SUSCEPTIBLE){
                    agent.status = STATES.susceptible;
                    agent.statusCounter = 0;
                }
                break;
            case STATES.dead:
            default: 
                break;
        }
    }

    const moveAllAgents = (population) => {
        updateCounter();
        const currentEpidemicSpreadMap = Array(canvasSize).fill(0).map(_ => Array(canvasSize).fill({status: EPIDEMIC_SPREAD.safe}));

        population.forEach(agent => {
            if (agent.status === STATES.dead) {
                return;
            }

            updateNextEpidemicSpreadForAgentLocation(agent, EPIDEMIC_SPREAD.safe, currentEpidemicSpreadMap);
            setPosition(agent);
            updateSicarsState(agent, currentEpidemicSpreadMap);
            setDirection(agent); 
        });
    }

    const setup = (p5, parentRef) => {
        p5.createCanvas(canvasSize, canvasSize).parent(parentRef);
    };

    const displayStatistics = () => {
        setSusceptibleCount(population.filter(agent => agent.status === STATES.susceptible).length);
        setContagiousCount(population.filter(agent => agent.status === STATES.incubating || agent.status === STATES.contagious || agent.status === STATES.aware).length);
        setRecoveredCount(population.filter(agent => agent.status === STATES.recovered).length);
        setDeadCount(population.filter(agent => agent.status === STATES.dead).length);
    }

    const drawAgents = (p5) => {
        population.forEach(agent => { 
            switch (agent.status) {
                case STATES.susceptible:
                    p5.fill(180, 180, 180);
                    break;
                case STATES.incubating:
                    p5.fill(230, 140, 0);
                    break;
                case STATES.contagious:
                case STATES.aware:
                    p5.fill(200, 70, 60);
                    break;
                case STATES.recovered:
                    p5.fill(30, 180, 30);
                    break;
                case STATES.dead:
                default: 
                    p5.fill(20, 20, 20);
                    break;
            }
            p5.ellipse(agent.xPosition, agent.yPosition, 5)
        })
    }

    const debugging = (p5) => {
        for(let i = 0; i < canvasSize; i++) {
            for(let j = 0; j < canvasSize; j++) {
                if(i % 2 && j % 2) {
                    if(epidemicSpreadMap[i][j].status === EPIDEMIC_SPREAD.safe) {
                        p5.fill(60, 60, 60)
                        p5.ellipse(i, j, 2)
                    } else if(epidemicSpreadMap[i][j].status === EPIDEMIC_SPREAD.contagious){
                        p5.fill(155, 30, 30)
                        p5.ellipse(i, j, 2)
                    }
                }
            }
        }
    }

    const draw = (p5) => {
        moveAllAgents(population);
        p5.background(255);
        displayStatistics();
        drawAgents(p5);
        p5.noStroke();

        // Enable for debugging trails
        // debugging(p5);
    };

    return (
        <div className="compartment">
            <Sketch setup={setup} draw={draw} />
        </div>
    )
}

export default Compartment

