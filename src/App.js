import React, { useEffect, useState } from 'react'
import Compartment from './Compartment';
import './App.css';
import { Slider, Button } from '@mui/material';
import * as V from 'victory';
import * as FileSaver from 'file-saver'
import XLSX from 'sheetjs-style'

document.title = "EpidemicSimulator"

const SIZE = 500;

// Parameters
// One day = X rendering cycles
const day_cycles = 25

const default_STEP = 0.1
const change_direction_probability = 0.03
const default_INFECTION_RADIUS = 25
const default_P_Dead = 0.03
const default_P_INFECT = 0.05
const default_DELTA_CONTAGIOUS = 5
const default_DELTA_AWARE = 5
const default_DELTA_RECOVER = 5
const DELTA_SUSCEPTIBLE = 3 * 30 * day_cycles // Months

const excelNames = {
  c1: '10000_01',
  c2: '10000_02',
  c3: '10000_03',
  c4: '10000_04',
  c5: '10000_05',
}

const ExcelExport = {
  [excelNames.c1]: [],
  [excelNames.c2]: [],
  [excelNames.c3]: [],
  [excelNames.c4]: [],
  [excelNames.c5]: [],
}

const App = () => {

  const [STEP, setSTEP] = useState(default_STEP)
  const [INFECTION_RADIUS, setINFECTION_RADIUS] = useState(default_INFECTION_RADIUS)
  const [P_Dead, setP_Dead] = useState(default_P_Dead)
  const [P_INFECT, setP_INFECT] = useState(default_P_INFECT)
  const [DELTA_CONTAGIOUS, setDELTA_CONTAGIOUS] = useState(default_DELTA_CONTAGIOUS)
  const [DELTA_AWARE, setDELTA_AWARE] = useState(default_DELTA_AWARE)
  const [DELTA_RECOVER, setDELTA_RECOVER] = useState(default_DELTA_RECOVER)

  // Day counter
  const [counter, setCounter] = useState(0)

  // Statistics:
  // 1
  const [susceptibleNr0, setSusceptibleNr0] = useState(0)
  const [contagiousNr0, setContagiousNr0] = useState(0)
  const [recoveredNr0, setRecoveredNr0] = useState(0)
  const [deadNr0, setDeadNr0] = useState(0)
  // 2
  const [susceptibleNr1, setSusceptibleNr1] = useState(0)
  const [contagiousNr1, setContagiousNr1] = useState(0)
  const [recoveredNr1, setRecoveredNr1] = useState(0)
  const [deadNr1, setDeadNr1] = useState(0)
  // 3
  const [susceptibleNr2, setSusceptibleNr2] = useState(0)
  const [contagiousNr2, setContagiousNr2] = useState(0)
  const [recoveredNr2, setRecoveredNr2] = useState(0)
  const [deadNr2, setDeadNr2] = useState(0)
  // 4
  const [susceptibleNr3, setSusceptibleNr3] = useState(0)
  const [contagiousNr3, setContagiousNr3] = useState(0)
  const [recoveredNr3, setRecoveredNr3] = useState(0)
  const [deadNr3, setDeadNr3] = useState(0)
  // 5
  const [susceptibleNr4, setSusceptibleNr4] = useState(0)
  const [contagiousNr4, setContagiousNr4] = useState(0)
  const [recoveredNr4, setRecoveredNr4] = useState(0)
  const [deadNr4, setDeadNr4] = useState(0)

  

  const resetParams = () => {
    setSTEP(default_STEP)
    setINFECTION_RADIUS(default_INFECTION_RADIUS)
    setP_Dead(default_P_Dead)
    setP_INFECT(default_P_INFECT)
    setDELTA_CONTAGIOUS(default_DELTA_CONTAGIOUS)
    setDELTA_RECOVER(default_DELTA_RECOVER)
  }

  const chart = (id, susceptibleCount, contagiousCount, recoveredCount, deadCount) => {
    return (
      <div style={{float: 'right', display: 'flex', alignItems: 'center', flexDirection: 'column', margin: '50px 0 0 150px'}}>
        <V.VictoryPie 
          data={[
            {x: 'Susceptible', y: susceptibleCount},
            {x: 'Infected', y: contagiousCount},
            {x: 'Recovered', y: recoveredCount},
            {x: 'Dead', y: deadCount}
          ]}
          colorScale={['rgb(180, 180, 180)', 'rgb(200, 70, 60)', 'rgb(30, 180, 30)', 'rgb(20, 20, 20)']}
          labelRadius={({ innerRadius }) => innerRadius + 50 }
          style={{ data: {stroke: "#000", strokeWidth: 1}, labels: { fill: "white", fontSize: 0, fontWeight: "bold" } }}
        />
        <div style={{textAlign: 'center', padding: '25px 0', width: '50%', backgroundColor: '#fff', border: '2px solid black', borderRadius: '5px'}}>
          <div style={{fontWeight: '800', color: 'rgb(180, 180, 180)'}}>Susceptible: {susceptibleCount}</div>
          <div style={{fontWeight: '800', color: 'rgb(200, 70, 60)'}}>Infected: {contagiousCount}</div>
          <div style={{fontWeight: '800', color: 'rgb(30, 180, 30)'}}>Recovered: {recoveredCount}</div>
          <div style={{fontWeight: '800', color: 'rgb(20, 20, 20)'}}>Dead: {deadCount}</div>
        </div>
        <Button variant="contained" style={{margin: '10px 0', backgroundColor: 'green', color: 'white', fontSize: 13}} onClick={() => exportExcel(ExcelExport[id])}>Export data to excel</Button>
      </div>
    )
  }

  const compartmentBlock = (id, numberOfAgents, STEP, CHANGE_DIR_PROB, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS, DELTA_AWARE, DELTA_RECOVER, DELTA_SUSCEPTIBLE, setSusceptibleCount, setContagiousCount, setRecoveredCount, setDeadCount, susceptibleNr, contagiousNr, recoveredNr, deadNr, updateCounter) => {
    return (
      <div style={{float: 'left', marginLeft: '50px', backgroundColor: '#aba', padding: '25px 50px', marginBottom: '50px', borderRadius: '10px', boxShadow: '5px 8px #888888'}}>
        <div style={{float: 'left'}}>
          <div style={{fontWeight: 700, fontSize: 20}}>Nr. of agents: <span>{numberOfAgents}</span></div>
          <Compartment
            canvasSize={SIZE}
            numberOfAgents={numberOfAgents}
            STEP={STEP}
            CHANGE_DIR_PROB={CHANGE_DIR_PROB}
            INFECTION_RADIUS={INFECTION_RADIUS}
            P_Dead={P_Dead}
            P_INFECT={P_INFECT}
            DELTA_CONTAGIOUS={DELTA_CONTAGIOUS}
            DELTA_AWARE={DELTA_AWARE}
            DELTA_RECOVER={DELTA_RECOVER}
            DELTA_SUSCEPTIBLE={DELTA_SUSCEPTIBLE}
            setSusceptibleCount={setSusceptibleCount}
            setContagiousCount={setContagiousCount}
            setRecoveredCount={setRecoveredCount}
            setDeadCount={setDeadCount}
            updateCounter={updateCounter}
          />
        </div>
        {chart(id, susceptibleNr, contagiousNr, recoveredNr, deadNr)}
      </div>
    )
  }

  useEffect(() => {
    if(counter % day_cycles === 0 && counter !== 0) {
      ExcelExport[excelNames.c1].push({Day: Math.round(counter / day_cycles), Susceptible: susceptibleNr0, Infected: contagiousNr0, Recovered: recoveredNr0, Dead: deadNr0})
      ExcelExport[excelNames.c2].push({Day: Math.round(counter / day_cycles), Susceptible: susceptibleNr1, Infected: contagiousNr1, Recovered: recoveredNr1, Dead: deadNr1})
      ExcelExport[excelNames.c3].push({Day: Math.round(counter / day_cycles), Susceptible: susceptibleNr2, Infected: contagiousNr2, Recovered: recoveredNr2, Dead: deadNr2})
      ExcelExport[excelNames.c4].push({Day: Math.round(counter / day_cycles), Susceptible: susceptibleNr3, Infected: contagiousNr3, Recovered: recoveredNr3, Dead: deadNr3})
      ExcelExport[excelNames.c5].push({Day: Math.round(counter / day_cycles), Susceptible: susceptibleNr4, Infected: contagiousNr4, Recovered: recoveredNr4, Dead: deadNr4})
    }
  }, [counter])

  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const exportExcel = async (excelData) => {
    console.log(excelData)
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob ([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, 'SimulationData' + fileExtension)
  }

  const exportAllToExcel = async (excelData) => {
    const wb = { Sheets: {}, SheetNames: [] }
    Object.keys(excelData).forEach((key) => {
      const ws = XLSX.utils.json_to_sheet(excelData[key])
      wb.Sheets[key + 'data'] = ws
      wb.SheetNames.push(key + 'data')
    });
    const data = new Blob([XLSX.write(wb, {bookType:'xlsx', type:'array'})], {type: fileType});
    FileSaver.saveAs(data, 'SimulationData' + fileExtension);
  }

  // const blocks = [
  //   {
  //     mobility: 0.2,
  //     population: 10000,
  //     excelName: `${population}_${mobility}`,
  //     data: [],
  //   },
  //   {
  //     mobility: 0.3,
  //     population: 10000,
  //     excelName: `${population}_${mobility}`,
  //     data: [],
  //   },
  //   {
  //     mobility: 0.4,
  //     population: 10000,
  //     excelName: `${population}_${mobility}`,
  //     data: [],
  //   },
  //   {
  //     mobility: 0.6,
  //     population: 10000,
  //     excelName: `${population}_${mobility}`,
  //     data: [],
  //   },
  //   {
  //     mobility: 0.7,
  //     population: 10000,
  //     excelName: `${population}_${mobility}`,
  //     data: [],
  //   },
  //   {
  //     mobility: 0.8,
  //     population: 10000,
  //     excelName: `${population}_${mobility}`,
  //     data: [],
  //   }
  // ];

  return (
    <div className="App">
      <div style={{textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', width: '300px', color: '#222', fontSize: 32, fontWeight: 'bold', paddingTop: '35px', backgroundColor: '#aba', padding: '20px 25px', borderRadius: '10px', boxShadow: '5px 8px #888888'}}>SICARS Simulator</div>
      <div style={{display: 'flex', paddingTop: '50px'}}>
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '70%'}}>
          {compartmentBlock(excelNames.c1, 10000, 0.1, change_direction_probability, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS * day_cycles, DELTA_AWARE * day_cycles, DELTA_RECOVER * day_cycles, DELTA_SUSCEPTIBLE, setSusceptibleNr0, setContagiousNr0, setRecoveredNr0, setDeadNr0, susceptibleNr0, contagiousNr0, recoveredNr0, deadNr0, () => setCounter(counter + 1))}
          {compartmentBlock(excelNames.c2, 10000, 0.2, change_direction_probability, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS * day_cycles, DELTA_AWARE * day_cycles, DELTA_RECOVER * day_cycles, DELTA_SUSCEPTIBLE, setSusceptibleNr1, setContagiousNr1, setRecoveredNr1, setDeadNr1, susceptibleNr1, contagiousNr1, recoveredNr1, deadNr1, () => {})}
          {compartmentBlock(excelNames.c3, 10000, 0.3, change_direction_probability, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS * day_cycles, DELTA_AWARE * day_cycles, DELTA_RECOVER * day_cycles, DELTA_SUSCEPTIBLE, setSusceptibleNr2, setContagiousNr2, setRecoveredNr2, setDeadNr2, susceptibleNr2, contagiousNr2, recoveredNr2, deadNr2, () => {})}
          {compartmentBlock(excelNames.c4, 10000, 0.4, change_direction_probability, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS * day_cycles, DELTA_AWARE * day_cycles, DELTA_RECOVER * day_cycles, DELTA_SUSCEPTIBLE, setSusceptibleNr3, setContagiousNr3, setRecoveredNr3, setDeadNr3, susceptibleNr3, contagiousNr3, recoveredNr3, deadNr3, () => {})}
          {compartmentBlock(excelNames.c5, 10000, 0.5, change_direction_probability, INFECTION_RADIUS, P_Dead, P_INFECT, DELTA_CONTAGIOUS * day_cycles, DELTA_AWARE * day_cycles, DELTA_RECOVER * day_cycles, DELTA_SUSCEPTIBLE, setSusceptibleNr4, setContagiousNr4, setRecoveredNr4, setDeadNr4, susceptibleNr4, contagiousNr4, recoveredNr4, deadNr4, () => {})}
        </div>
        <div>
          <div style={{position: 'fixed', marginLeft: '100px', width: '250px', backgroundColor: '#aba', padding: '35px 50px', borderRadius: '10px', boxShadow: '5px 8px #888888'}}>
            Step:
            <Slider value={STEP} onChange={(e) => setSTEP(e.target.value)} valueLabelDisplay="auto" min={0} max={1} step={0.05}/>
            Infection Radius:
            <Slider value={INFECTION_RADIUS} onChange={(e) => setINFECTION_RADIUS(e.target.value)} valueLabelDisplay="auto" min={0} max={30} step={1}/>
            P Dead:
            <Slider value={P_Dead} onChange={(e) => setP_Dead(e.target.value)} valueLabelDisplay="auto" min={0} max={1} step={0.01}/>
            P INFECT:
            <Slider value={P_INFECT} onChange={(e) => setP_INFECT(e.target.value)} valueLabelDisplay="auto" min={0} max={1} step={0.05}/>
            DELTA INCUBATION:
            <Slider value={DELTA_CONTAGIOUS} onChange={(e) => setDELTA_CONTAGIOUS(e.target.value)} valueLabelDisplay="auto" min={1} max={20} step={1}/>
            DELTA AWARE:
            <Slider value={DELTA_AWARE} onChange={(e) => setDELTA_AWARE(e.target.value)} valueLabelDisplay="auto" min={1} max={20} step={1}/>
            DELTA RECOVER:
            <Slider value={DELTA_RECOVER} onChange={(e) => setDELTA_RECOVER(e.target.value)} valueLabelDisplay="auto" min={1} max={20} step={1}/>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <Button style={{marginTop: '50px'}} variant="contained" onClick={() => resetParams()}>Reset Params</Button>
              <Button variant="contained" style={{margin: '10px 0', backgroundColor: 'green', color: 'white', fontSize: 13}} onClick={() => exportAllToExcel(ExcelExport)}>Export all data to excel</Button>
              <div style={{fontSize: 20, fontWeight: 'bold', marginTop: '25px'}}>Days passed: <span>{Math.round(counter / day_cycles)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
