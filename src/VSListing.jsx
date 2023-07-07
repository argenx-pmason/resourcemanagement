import React, { useState, useEffect } from "react";
import { DataGridPro } from '@mui/x-data-grid-pro';
import { sql, globalFilter, addToHistory, openSaveFileDialog } from "../../apis/utility";
import { useLocation } from "react-router-dom";
import { Box, IconButton, Button, Tooltip } from "@mui/material";
import { usePapaParse } from 'react-papaparse';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// register Handsontable's modules
// registerAllModules();
export default function VSListing(props) {
    const location = useLocation()
    addToHistory({ title: "VS Listing", url: location })
    const [vsData, setVsData] = useState([]),
        [subtitle, setSubtitle] = useState(null),
        [columns, setColumns] = useState(null),
        { jsonToCSV } = usePapaParse(),
        exportData = () => {
            openSaveFileDialog(jsonToCSV(vsData), 'vs', 'text/csv')
        },
        lowSys = props.normalRanges.SYSBP.low,
        highSys = props.normalRanges.SYSBP.high,
        lowDia = props.normalRanges.DIABP.low,
        highDia = props.normalRanges.DIABP.high,
        lowPulse = props.normalRanges.PULSE.low,
        highPulse = props.normalRanges.PULSE.high
    // hotColumns = ['SUBJID', 'day', 'VISIT', 'VSDTC', 'PULSE', 'OPULSE', 'SYSBP', 'DIABP', 'OSYSBP', 'ODIABP'],

    useEffect(() => {
        const whereSubjects = props.selectedSubjects.length > 0
            ? 'and SUBJID in ("' + props.selectedSubjects.join('","') + '")'
            : ''
        setSubtitle(globalFilter(props.selectedOptions))
        sql(props.studyDatabase, `select SUBJID, cast(VISITNUM as numeric ) as day, visit, vsdtc, vspos,
                    sum(case when vstestcd='PULSE' then vsstresn end) as PULSE,
                    sum(case when vstestcd='OPULSE' then vsstresn end) as OPULSE,
                    sum(case when vstestcd='SYSBP' then vsstresn end) as SYSBP,
                    sum(case when vstestcd='DIABP' then vsstresn end) as DIABP,
                    sum(case when vstestcd='OSYSBP' then vsstresn end) as OSYSBP,
                    sum(case when vstestcd='ODIABP' then vsstresn end) as ODIABP
                    from vs where VSTESTCD in ('PULSE','OPULSE','SYSBP','DIABP','OSYSBP','ODIABP') and visitdy!='999' ${whereSubjects} 
                    group by SUBJID, day, vspos`)
            .then((res) => {
                // console.log('res', res)
                if (res.message === "success") {
                    const tempData = res.data.map((row, id) => { return { ...row, id: id } })
                    setVsData(tempData)
                }
            })
    }, [props.selectedOptions, props.studyDatabase, props.selectedSubjects])

    useEffect(() => {
        const getValues = (data, variable) => {
            return data.map((row) => row[variable]).filter((value) => Number.isFinite(value))
        },
            renderProgress = (cellValues, variable) => {
                const { value } = cellValues,
                    flex = (value - min[variable]) / (max[variable] - min[variable])
                let backgroundColor = '#ffffff'
                if (variable === 'PULSE') backgroundColor = value <= lowPulse ? '#b3d1ff' : value >= highPulse ? '#ffcccc' : '#ffff99'
                else if (variable === 'SYSBP') backgroundColor = value <= lowSys ? '#b3d1ff' : value >= highSys ? '#ffcccc' : '#ffff99'
                else if (variable === 'DIABP') backgroundColor = value <= lowDia ? '#b3d1ff' : value >= highDia ? '#ffcccc' : '#ffff99'

                return <Box sx={{ flex: { flex }, backgroundColor: backgroundColor, color: 'black' }} >{value}</Box >
            }
        const pulseValues = getValues(vsData, 'PULSE'),
            opulseValues = getValues(vsData, 'OPULSE'),
            sysbpValues = getValues(vsData, 'SYSBP'),
            osysbpValues = getValues(vsData, 'OSYSBP'),
            diabpValues = getValues(vsData, 'DIABP'),
            odiabpValues = getValues(vsData, 'ODIABP'),
            min = [],
            max = []
        min['PULSE'] = Math.min(...pulseValues)
        max['PULSE'] = Math.max(...pulseValues)
        min['OPULSE'] = Math.min(...opulseValues)
        max['OPULSE'] = Math.max(...opulseValues)
        min['SYSBP'] = Math.min(...sysbpValues)
        max['SYSBP'] = Math.max(...sysbpValues)
        min['OSYSBP'] = Math.min(...osysbpValues)
        max['OSYSBP'] = Math.max(...osysbpValues)
        min['DIABP'] = Math.min(...diabpValues)
        max['DIABP'] = Math.max(...diabpValues)
        min['ODIABP'] = Math.min(...odiabpValues)
        max['ODIABP'] = Math.max(...odiabpValues)
        const cols = [
            {
                width: 80, headerName: 'Subject', field: 'SUBJID',
                renderCell: (cellValues) => {
                    const { value } = cellValues
                    const target = `${window.location.protocol}//${window.location.host}/#/patientprofile/${props.studyDatabase}/${value}`
                    return <Button onClick={() => { window.open(target) }
                    }
                    >{value}</Button>
                }
            },
            { width: 50, headerName: 'Day', field: 'day' },
            { width: 90, headerName: 'Visit', field: 'VISIT' },
            { width: 140, headerName: 'Date', field: 'VSDTC' },
            {
                width: 105, headerName: 'Pulse', field: 'PULSE',
                renderCell: (cellValues) => { return renderProgress(cellValues, 'PULSE') }
            },
            {
                width: 105, headerName: 'Systolic BP', field: 'SYSBP',
                renderCell: (cellValues) => { return renderProgress(cellValues, 'SYSBP') }
            },
            {
                width: 105, headerName: 'Diastolic BP', field: 'DIABP',
                renderCell: (cellValues) => { return renderProgress(cellValues, 'DIABP') }
            },
            {
                width: 105, headerName: 'Orth. Pulse', field: 'OPULSE',
                renderCell: (cellValues) => { return renderProgress(cellValues, 'OPULSE') }
            },
            {
                width: 105, headerName: 'Ortho. Systolic BP', field: 'OSYSBP',
                renderCell: (cellValues) => { return renderProgress(cellValues, 'DIABP') }
            },
            {
                width: 105, headerName: 'Ortho. Diastolic BP', field: 'ODIABP',
                renderCell: (cellValues) => { return renderProgress(cellValues, 'DIABP') }
            }
        ]
        setColumns(cols)
        // eslint-disable-next-line
    }, [vsData, highPulse, lowPulse, highSys, lowSys, highDia, lowDia])

    return (<>
        <h4>Vital Signs ({props.study})
            <Tooltip title="Download table">
                <IconButton color="primary" onClick={exportData}>
                    <FileDownloadIcon />
                </IconButton>
            </Tooltip>
            <br />
            <span style={{ fontSize: 12 }}>{subtitle}</span></h4>
        {vsData && columns
            ? <div style={{ height: props.screenHeight * 0.8, width: "100%" }}>
                <DataGridPro
                    rows={vsData}
                    columns={columns}
                    density={"compact"}
                    rowHeight={30}
                    sx={{ fontSize: '0.7em' }}
                />
            </div>
            : "Loading..."
        }
    </>
    );
}