import "./App.css";
import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  AppBar,
  Toolbar,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  TextField,
} from "@mui/material";
import { Menu, Visibility } from "@mui/icons-material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import info from "./studies.json";
LicenseInfo.setLicenseKey(
  "5b931c69b031b808de26d5902e04c36fTz00Njk0NyxFPTE2ODg4MDI3MDM3MjAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);
function App() {
  require("highcharts/modules/exporting")(Highcharts);
  require("highcharts/modules/treemap")(Highcharts);
  require("highcharts/modules/treegraph")(Highcharts);

  const tables = Object.keys(info),
    columnDef = {},
    screenWidth = window.innerWidth,
    screenHeight = window.innerHeight;

  // define state variables
  const [windowDimension] = useState({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    }),
    [rows, setRows] = useState(null),
    [cols, setCols] = useState(null),
    [graph1, setGraph1] = useState(null),
    [showTree, setShowTree] = useState(false),
    [singleClickedName, setSingleClickedName] = useState(null),
    [, setDoubleClickedName] = useState(null),
    [singleClickedPath, setSingleClickedPath] = useState(null),
    [doubleClickedPath, setDoubleClickedPath] = useState(null),
    [study, setStudy] = useState(null),
    [indication, setIndication] = useState(null),
    [compound, setCompound] = useState(null),
    [reportingEvent, setReportingEvent] = useState(null),
    [info1, setInfo1] = useState(null),
    [open, setOpen] = useState(false);

  // define functions
  const openInNewTab = (url) => {
      const win = window.open(url, "_blank");
      win.focus();
    },
    handleClose = () => {
      setOpen(false);
    };

  var clickDetected = false;

  tables.forEach((t, i) => {
    const table = info[t],
      keys = Object.keys(table[0]),
      cd = keys.map((item) => {
        return { field: item, headerName: item, width: 90 };
      });
    columnDef[t] = cd;
  });
  // console.log("tables", tables, "columnDef", columnDef, "info", info);

  useEffect(() => {
    setGraph1({
      chart: {
        type: "treegraph",
        height: screenHeight * 0.95,
        width: screenWidth * 0.85,
        zooming: { type: "xy" },
      },
      accessibility: {
        enabled: false,
      },
      title: {
        text: "double click for file viewer",
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          type: "treegraph",
          data: info["treegraph"],
          dataLabels: {
            align: "right",
            pointFormat: "{point.name}",
            style: {
              color: "#000000",
              textOutline: "3px #ffffff",
              whiteSpace: "nowrap",
            },
            x: -20,
            crop: false,
            overflow: "none",
          },
          allowPointSelect: true,
          point: {
            events: {
              click: (e) => {
                setSingleClickedName(e.point.name);
                setSingleClickedPath(e.point.path);
                setDoubleClickedName(null);
                setDoubleClickedPath(null);
                if (clickDetected) {
                  console.log("Double Click", e.point.name);
                  clickDetected = false;
                  setDoubleClickedName(e.point.name);
                  setDoubleClickedPath(e.point.path);
                  const len = e.point.path.split("/").length;
                  console.log(len);
                  if (e.point.name.includes("*") && len === 8)
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A//${e.point.path}/documents/projectstatus.html`
                    );
                  else if (e.point.name.includes("*") && len === 5)
                    setOpen(true);
                  else
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=${e.point.path}`
                    );
                } else {
                  console.log("Single Click", e.point.name, e);
                  clickDetected = true;
                  setTimeout(function () {
                    clickDetected = false;
                  }, 500);
                }
              },
            },
          },
          tooltip: {
            pointFormat: "{point.name}",
          },
          marker: {
            symbol: "circle",
            radius: 6,
            fillColor: "#ffffff",
            lineWidth: 3,
          },
          borderRadius: 10,
          levels: [
            {
              level: 1,
              levelIsConstant: false,
            },
            {
              level: 2,
              colorByPoint: true,
            },
            {
              level: 3,
              collapsed: true,
              colorVariation: {
                key: "brightness",
                to: -0.5,
              },
            },
            {
              level: 4,
              collapsed: true,
              colorVariation: {
                key: "brightness",
                to: 0.5,
              },
            },
          ],
        },
      ],
    });
  }, [screenHeight, screenWidth]);

  // extract study name if we can
  useEffect(() => {
    if (singleClickedPath === null) return;
    setStudy(null);
    setIndication(null);
    setCompound(null);
    setReportingEvent(null);
    setInfo1(null);
    const split = singleClickedPath.split("/");
    console.log(split, split.length);
    if (split.length === 5) {
      const tempStudy = split.pop(),
        row = info["studies_info"].filter((r) => r.study === tempStudy);
      console.log("tempStudy", tempStudy, "row", row);
      if (row.length > 0) setInfo1(row[0]);
      setStudy(tempStudy);
    } else if (split.length === 8) {
      const tempReportingEvent = split.pop();
      console.log("tempReportingEvent", tempReportingEvent);
      setReportingEvent(tempReportingEvent);
    } else if (split.length === 4) {
      const tempIndication = split.pop();
      console.log("tempIndication", tempIndication);
      setIndication(tempIndication);
    } else if (split.length === 3) {
      const tempCompound = split.pop();
      console.log("tempCompound", tempCompound);
      setCompound(tempCompound);
    }
  }, [singleClickedPath, doubleClickedPath]);

  return (
    <div className="App">
      <Box sx={{ m: 2, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <AppBar position="static">
              <Toolbar variant="dense">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                >
                  <Menu />
                </IconButton>
                <Typography variant="h6" color="inherit" component="div">
                  Resource Management
                </Typography>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                {study ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Study: {study}
                  </Typography>
                ) : null}
                {compound ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Compound: {compound}
                  </Typography>
                ) : null}
                {indication ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Indication: {indication}
                  </Typography>
                ) : null}
                {reportingEvent ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Reporting Event: {reportingEvent}
                  </Typography>
                ) : null}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                {graph1 && showTree ? (
                  <Tooltip
                    title={singleClickedName ? `View ${singleClickedName}` : ""}
                  >
                    <IconButton
                      color="inherit"
                      sx={{ mr: 2 }}
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Toolbar>
            </AppBar>
          </Grid>
          <Grid item xs={1}>
            {tables.map((t) => (
              <Tooltip title={`View the table: ${t}`}>
                <Button
                  color={"success"}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setRows(info[t]);
                    setCols(columnDef[t]);
                    setShowTree(false);
                  }}
                  sx={{ mb: 1 }}
                >
                  {t}
                </Button>
              </Tooltip>
            ))}
            <Tooltip title="from %lsaf_getchildren(lsaf_path=/clinical, lsaf_recursive=6)">
              <Button
                color={"success"}
                size="small"
                onClick={() => {
                  setRows(null);
                  setCols(null);
                  setShowTree(true);
                  setSingleClickedName(null);
                  setSingleClickedPath(null);
                  setDoubleClickedName(null);
                  setDoubleClickedPath(null);
                }}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Study hierarchy
              </Button>
            </Tooltip>
          </Grid>
          {rows ? (
            <Grid item xs={11}>
              <DataGridPro
                rows={rows}
                columns={cols}
                density="compact"
                hideFooter={true}
                sx={{
                  height: windowDimension.winHeight - 80,
                  fontWeight: "fontSize=5",
                  fontSize: "0.7em",
                  padding: 1,
                }}
              />
            </Grid>
          ) : null}
          {graph1 && showTree ? (
            <HighchartsReact highcharts={Highcharts} options={graph1} />
          ) : null}
        </Grid>
        <Dialog
          fullWidth={true}
          maxWidth={"sd"}
          open={open}
          onClose={handleClose}
        >
          <DialogTitle>
            {compound ? (
              <>
                <b>Compound: </b>
                {compound}
              </>
            ) : null}
            {indication ? (
              <>
                <b>Indication: </b>
                {indication}
              </>
            ) : null}
            {study ? (
              <>
                <b>Study: </b>
                {study}
              </>
            ) : null}
            {reportingEvent ? (
              <>
                <b>Reporting Event: </b>
                {reportingEvent}
              </>
            ) : null}
          </DialogTitle>
          <DialogContent sx={{ height: 250 }}>
            {info1 ? (
              <>
                <TextField
                  value={info1.product}
                  label="Product"
                  sx={{ width: 100, mr: 2 }}
                  variant="standard"
                  size="small"
                />
                <TextField
                  value={info1.indication}
                  label="Indication"
                  sx={{ width: 100, mr: 2 }}
                  variant="standard"
                  size="small"
                />
                <TextField
                  value={info1.status}
                  label="Status"
                  sx={{ width: 200, mr: 2 }}
                  variant="standard"
                  size="small"
                />
                <TextField
                  value={singleClickedPath}
                  label="Path"
                  sx={{ width: 300, mr: 2 }}
                  variant="standard"
                  size="small"
                />
                <TextField
                  value={info1.No_of_subjects_treated}
                  label="Subjects"
                  sx={{ width: 100, mr: 2 }}
                  variant="standard"
                  size="small"
                />
                <TextField
                  margin="dense"
                  value={info1.Protocol_name}
                  label="Protocol"
                  fullWidth
                  multiline
                  maxRows={4}
                  variant="standard"
                  size="small"
                />
              </>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Tooltip
              title={
                singleClickedPath
                  ? `Open the file viewer at ${singleClickedPath}`
                  : ""
              }
            >
              <Button
                onClick={() => {
                  openInNewTab(
                    `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=${singleClickedPath}`
                  );
                }}
              >
                File Viewer
              </Button>
            </Tooltip>
            {singleClickedPath && singleClickedPath.split("/").length > 5 ? (
              <Tooltip
                title={
                  singleClickedPath
                    ? `Open the Study Dashboard (if it exists)`
                    : ""
                }
              >
                <Button
                  onClick={() => {
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A//${singleClickedPath}/documents/projectstatus.html`
                    );
                  }}
                >
                  Study Dashboard
                </Button>
              </Tooltip>
            ) : null}
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}

export default App;
